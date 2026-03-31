# curlgeco

curlgeco is a Next.js AI playground frontend for testing Hugging Face and OpenAI-compatible chat endpoints. It ships as a local-first workspace with optional Supabase authentication, Google Tag Manager wiring, Docker packaging, and a Helm chart for deployment to the UGECO AKS cluster at `curlgeco.ugeco.in`.

## Repo layout

- `curlgeco_frontend/`: Next.js application code
- `brand/`: logo asset and brand guide
- `design/`: HLD, LLD, OpenAPI, and Supabase schema
- `deployment/`: Docker, Helm, and AKS deployment notes
- `submodule/`: frontend_matchmaker-aligned repo context docs
- `ugeco-infra/`: shared AKS platform reference for ingress, DNS, and cluster issuer

## Local development

```bash
cp .example.env .env
cd curlgeco_frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_REQUIRE_AUTH`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`

## Docker

```bash
docker compose up --build
```

The root `Dockerfile` builds the frontend in standalone mode and serves it on port `3000`.

## Helm / AKS

```bash
./deployment/deploy.sh
```

The Helm chart is in `deployment/charts/curlgeco` and is preconfigured for:

- namespace: `curlgeco`
- host: `curlgeco.ugeco.in`
- ingress class: `nginx`
- cluster issuer: `letsencrypt-ugeco-dns`

## Docs

- [Frontend README](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/curlgeco_frontend/README.md)
- [Brand Guide](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/brand/brand.md)
- [HLD](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/design/HLD.md)
- [LLD](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/design/LLD.md)
- [OpenAPI](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/design/open-api.yaml)
- [Schema](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/design/schema.sql)
- [Deployment Notes](/home/ubuntu/Project/kilobybyte/ugeco_projects/curlgeco/deployment/README.md)
