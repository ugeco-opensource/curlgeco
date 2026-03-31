{{- define "curlgeco.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "curlgeco.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- include "curlgeco.name" . -}}
{{- end -}}
{{- end -}}

{{- define "curlgeco.labels" -}}
app.kubernetes.io/name: {{ include "curlgeco.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | quote }}
{{- end -}}

{{- define "curlgeco.selectorLabels" -}}
app.kubernetes.io/name: {{ include "curlgeco.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
