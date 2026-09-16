{{- define "asset-management.labels" -}}
app.kubernetes.io/name: asset-management
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}