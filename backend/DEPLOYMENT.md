# Local container and Kubernetes deployment

## Prerequisites

- Docker with Compose support
- A local Kubernetes cluster such as Docker Desktop, kind, or minikube
- `kubectl`

## Verify with Docker Compose

```sh
docker compose up --build
curl http://localhost:3000/health
```

Stop the stack with `docker compose down`. Add `-v` only when you want to delete the local PostgreSQL data volume.

## Deploy to a local Kubernetes cluster

Build the image from this directory:

```sh
docker build -t asset-service:local .
```

For kind, load the image into the cluster:

```sh
kind load docker-image asset-service:local
```

For minikube, run the build against minikube's Docker daemon instead:

```sh
eval "$(minikube docker-env)"
docker build -t asset-service:local .
```

Apply PostgreSQL and the API manifests:

```sh
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/api.yaml
kubectl rollout status deployment/postgres
kubectl rollout status deployment/asset-api
```

The API is intentionally a `ClusterIP` service. Access it locally with:

```sh
kubectl port-forward service/asset-api 3000:3000
curl http://localhost:3000/health
```

The API initializes the `assets` table when it starts. Kubernetes may restart the API while PostgreSQL is still becoming ready; the deployment's startup probe then allows it to settle once the database is available.

## Before a shared or production cluster

- Replace the example credentials with a Kubernetes Secret manager or sealed secret.
- Use a managed PostgreSQL instance or a PostgreSQL operator rather than this single-replica database deployment.
- Push the image to a registry and remove `imagePullPolicy: Never`.
- Add TLS/Ingress, resource requests and limits, and a migration job or versioned migration tool.