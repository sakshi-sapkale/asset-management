# Local container and Kubernetes deployment

## Prerequisites

- Docker with Compose support
- MicroK8s with `dns`, `ingress`, and `hostpath-storage` enabled
- The regular Helm CLI (`helm`)
- `kubectl`

The Kubernetes deployment is managed by the chart in
`helm/asset-management`. The old raw Kubernetes manifests were removed after
being replaced by this chart. The root `backend/docker-compose.yml` remains
available for Docker Compose development.

## Prepare MicroK8s and Helm

Run these commands from the project root:

```sh
microk8s status --wait-ready
microk8s enable dns ingress hostpath-storage
microk8s config > ~/.kube/microk8s.config
export KUBECONFIG="$HOME/.kube/microk8s.config"
kubectl get nodes
helm version
```

The `KUBECONFIG` setting makes the regular `helm` and `kubectl` commands use
the MicroK8s cluster.

## Build and import local images

Build the images with the names configured in
`helm/asset-management/values.yaml`:

```sh
docker build -t asset-service:local ./backend
docker build -t asset-frontend:local ./frotend
docker save asset-service:local | microk8s ctr image import -
docker save asset-frontend:local | microk8s ctr image import -
```

MicroK8s uses its own container runtime, so the images must be imported into
it. The chart uses `imagePullPolicy: Never`, so Kubernetes will use these local
images instead of trying to pull them from a registry.

## Validate the chart before installing

```sh
helm lint ./helm/asset-management
helm template asset-management ./helm/asset-management
```

These commands do not change the cluster. `helm lint` checks the chart and
`helm template` shows the Kubernetes YAML Helm will generate.

## Deploy to a fresh local cluster

Install the chart from the project root:

```sh
helm install asset-management ./helm/asset-management
```

The chart creates:

- PostgreSQL Secret, Deployment, Service, and a 1 GiB PVC
- Backend Secret, Deployment, and ClusterIP Service
- Frontend Deployment and ClusterIP Service
- Nginx Ingress for `asset.local`

Wait for all workloads:

```sh
kubectl rollout status deployment/postgres
kubectl rollout status deployment/asset-api
kubectl rollout status deployment/asset-frontend
```

Inspect the release and resources:

```sh
helm status asset-management
kubectl get pods
kubectl get services
kubectl get pvc
kubectl get ingress
```

## Migrate an existing raw-manifest deployment

If the old deployment is still running, first confirm that its PostgreSQL data
claim exists:

```sh
kubectl get pvc postgres-data
```

Remove the old application resources while preserving the PVC:

```sh
kubectl delete deployment asset-api asset-frontend
kubectl delete service asset-api asset-frontend
kubectl delete secret asset-api
kubectl delete ingress asset-management
```

Remove the old PostgreSQL resources only after confirming the PVC remains:

```sh
kubectl delete deployment postgres
kubectl delete service postgres
kubectl delete secret asset-postgres
```

Install the chart and tell it to reuse the existing claim:

```sh
helm install asset-management ./helm/asset-management \
  --set postgres.persistence.existingClaim=postgres-data
```

Do not delete `postgres-data`. The chart's `existingClaim` setting mounts that
claim instead of creating a new one, preserving the database files.

## Configure local browser access

Add the hostname mapping once:

```sh
grep -qF '127.0.0.1 asset.local' /etc/hosts || \
  echo '127.0.0.1 asset.local' | sudo tee -a /etc/hosts
```

Open this URL:

```text
http://asset.local
```

The Ingress routes `/` to the frontend and `/api` to the backend. The frontend
calls the backend using `/api`, so both use the same browser host.

## Test the backend directly

```sh
kubectl port-forward service/asset-api 3000:3000
curl http://localhost:3000/health
```

Keep the port-forward command running in its terminal while testing. Stop it
with `Ctrl+C`.

## Upgrade the release

After changing Helm templates or values:

```sh
helm upgrade asset-management ./helm/asset-management
```

For a new local backend image:

```sh
docker build -t asset-service:v2 ./backend
docker save asset-service:v2 | microk8s ctr image import -
helm upgrade asset-management ./helm/asset-management \
  --set backend.image.tag=v2
```

Build and import a new frontend image the same way, then set
`frontend.image.tag` during the upgrade.

## Roll back or uninstall

```sh
helm history asset-management
helm rollback asset-management 1
```

To remove the release:

```sh
helm uninstall asset-management
```

The chart marks its newly created PVC with `helm.sh/resource-policy: keep`,
but always verify storage before deleting or recreating PostgreSQL resources.

## Before a shared or production cluster

- Replace example credentials with a Kubernetes Secret manager or sealed secret.
- Use managed PostgreSQL or a PostgreSQL operator instead of this single-replica deployment.
- Push images to a registry and change `imagePullPolicy` from `Never`.
- Add TLS, resource requests and limits, and a migration job or versioned migration tool.
