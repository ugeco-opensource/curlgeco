# curlgeco Deployment

This directory contains the application deployment layer for curlgeco. Shared ingress controllers, Azure DNS, cert-manager issuer setup, and private admin tooling remain in `ugeco-infra/`.

## Contents

- `deploy.sh`: Helm deploy helper
- `charts/curlgeco/`: application Helm chart

## Local container run

```bash
docker compose up --build
```

The root container setup serves the standalone Next.js build on port `3000`.

## Helm target

- namespace: `curlgeco`
- host: `curlgeco.ugeco.in`
- ingress class: `nginx`
- cluster issuer: `letsencrypt-ugeco-dns`

These defaults are aligned with the shared AKS platform notes in `ugeco-infra/README.md`.

## Deploy

```bash
./deployment/deploy.sh
```

Equivalent manual command:

```bash
helm upgrade --install curlgeco deployment/charts/curlgeco \
  --namespace curlgeco \
  --create-namespace \
  -f deployment/charts/curlgeco/values.yaml
```

## Values to review

- `image.repository`
- `image.tag`
- `env.NEXT_PUBLIC_SUPABASE_URL`
- `env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `env.NEXT_PUBLIC_GTM_ID`
- `env.NEXT_PUBLIC_REQUIRE_AUTH`

## Verification

```bash
kubectl get pods -n curlgeco
kubectl get svc -n curlgeco
kubectl get ingress -n curlgeco
kubectl describe ingress -n curlgeco curlgeco
curl -I https://curlgeco.ugeco.in/api/health
```
