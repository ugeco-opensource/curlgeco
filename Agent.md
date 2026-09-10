# Agent Context

curlgeco is a Next.js App Router AI playground, built as a static export (`output: "export"`, no server/API routes). The app supports local endpoint management, streaming chat, batch testing, replayable logs, optional Supabase email authentication, and Google Tag Manager through build-time env. Provider calls are made directly from the browser to each configured endpoint's `/chat/completions` — there is no backend proxy.

## Repo layout

- `submodule/curlgeco_frontend/`: the Next.js application (code, Dockerfile, docker-compose.yml)
- `artifacts/`: everything else — brand, design docs, and scripts
- `artifacts/deployment/`: Helm chart and deploy script; gitignored, not part of the public repo

## Key locations

- Frontend app: `submodule/curlgeco_frontend/src`
- Runtime config: `submodule/curlgeco_frontend/src/lib/runtime-config.ts`
- Auth provider: `submodule/curlgeco_frontend/src/components/providers/AuthProvider.tsx`
- Provider client (browser-side, replaces the old server proxy): `submodule/curlgeco_frontend/src/lib/hf/chatCompletion.ts`
- Core store: `submodule/curlgeco_frontend/src/lib/store.ts`
- Brand assets: `artifacts/brand/` and `submodule/curlgeco_frontend/public/curlgeco.logo.svg`
- Helm chart: `artifacts/deployment/charts/curlgeco` (gitignored, local only)

## Product behavior

- Endpoint configs, threads, tests, and logs persist in browser storage under `curlgeco-playground`.
- The store transparently migrates legacy data from the old `ugeco-model-lab` key.
- Supabase auth is enabled only when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- `NEXT_PUBLIC_REQUIRE_AUTH=true` forces the app behind `/auth`.
- GTM loads only when `NEXT_PUBLIC_GTM_ID` is set.

## Deployment notes

- The production host is `curlgeco.ugeco.in`.
- Primary deployment target is Cloudflare Pages: Next.js (Static HTML Export) preset, root directory `submodule/curlgeco_frontend`, build command `npx next build`, output directory `out`.
- The Helm chart (local-only, gitignored) targets the shared public `nginx` ingress and `letsencrypt-ugeco-dns` cluster issuer on the target AKS platform, serving the same static export via nginx.
- Docker and docker-compose files live in `submodule/curlgeco_frontend/`; the Dockerfile builds the static export and serves it with `nginxinc/nginx-unprivileged` on port `8080`. `NEXT_PUBLIC_*` values must be passed as Docker build args (or set in the shell) — they're inlined at build time, not read at container runtime.
