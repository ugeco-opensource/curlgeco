# curlgeco

curlgeco is a Next.js AI playground frontend for testing Hugging Face and OpenAI-compatible chat endpoints. It's a static export (no backend) — provider calls go straight from the browser to each configured endpoint. It ships as a local-first workspace with optional Supabase authentication, Google Tag Manager wiring, Docker packaging, and a Helm chart for deployment to the UGECO AKS cluster at `curlgeco.ugeco.in`.

## Repo layout

- `submodule/curlgeco_frontend/`: Next.js application code, Dockerfile, and docker-compose.yml
- `artifacts/brand/`: logo asset and brand guide
- `artifacts/design/`: HLD, LLD, OpenAPI, and Supabase schema
- `artifacts/scripts/`: developer utility scripts
- `artifacts/prompt.md`: original product brief

`artifacts/deployment/` (Helm chart and AKS deploy script) is gitignored and not part of this public repo.

## Local development

```bash
cd submodule/curlgeco_frontend
cp .example.env .env
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
cd submodule/curlgeco_frontend
docker compose up --build
```

The frontend's `Dockerfile` builds a static export and serves it with nginx on port `3000` (container port `8080`). `NEXT_PUBLIC_*` values are baked in at build time via Docker build args, sourced from `.env` in that directory.

## Cloudflare Pages

- Framework preset: **Next.js (Static HTML Export)**
- Root directory: `submodule/curlgeco_frontend`
- Build command: `npx next build`
- Build output directory: `out`
- Set the `NEXT_PUBLIC_*` env vars in the Pages project settings (they're inlined at build time)

## Helm / AKS

Helm chart and deploy tooling are kept out of this public repo (see `artifacts/deployment/` in `.gitignore`). Internally it targets:

- namespace: `curlgeco`
- host: `curlgeco.ugeco.in`
- ingress class: `nginx`
- cluster issuer: `letsencrypt-ugeco-dns`

## Docs

- [Frontend README](submodule/curlgeco_frontend/README.md)
- [Brand Guide](artifacts/brand/brand.md)
- [HLD](artifacts/design/HLD.md)
- [LLD](artifacts/design/LLD.md)
- [OpenAPI](artifacts/design/open-api.yaml)
- [Schema](artifacts/design/schema.sql)

## License

Apache License 2.0 — see [LICENSE](LICENSE).
