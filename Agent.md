# Agent Context

curlgeco is a Next.js App Router AI playground. The app supports local endpoint management, streaming chat, batch testing, replayable logs, optional Supabase email authentication, and Google Tag Manager through runtime env.

## Key locations

- Frontend app: `curlgeco_frontend/src`
- Runtime config: `curlgeco_frontend/src/lib/runtime-config.ts`
- Auth provider: `curlgeco_frontend/src/components/providers/AuthProvider.tsx`
- API proxy: `curlgeco_frontend/src/app/api/chat/route.ts`
- Health probe: `curlgeco_frontend/src/app/api/health/route.ts`
- Core store: `curlgeco_frontend/src/lib/store.ts`
- Brand assets: `brand/` and `curlgeco_frontend/public/curlgeco.logo.svg`
- Helm chart: `deployment/charts/curlgeco`

## Product behavior

- Endpoint configs, threads, tests, and logs persist in browser storage under `curlgeco-playground`.
- The store transparently migrates legacy data from the old `ugeco-model-lab` key.
- Supabase auth is enabled only when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- `NEXT_PUBLIC_REQUIRE_AUTH=true` forces the app behind `/auth`.
- GTM loads only when `NEXT_PUBLIC_GTM_ID` is set.

## Deployment notes

- The production host is `curlgeco.ugeco.in`.
- The Helm chart targets the shared public `nginx` ingress and `letsencrypt-ugeco-dns` cluster issuer from `ugeco-infra/`.
- Docker uses the root `Dockerfile`; local container testing uses the root `docker-compose.yml`.
