# High-Level Design - curlgeco

## Overview
curlgeco is an AI playground frontend focused on fast endpoint testing, streaming chat, prompt evaluation, and deployment readiness. The application is implemented as a single Next.js App Router service. It keeps workspace state local-first in the browser, uses Supabase for signup and login when enabled, and proxies model traffic through Next.js route handlers to avoid direct browser-to-provider coupling.

## Core components
- Frontend shell (Next.js App Router): renders dashboard, connections, chat, tests, logs, settings, and auth.
- Runtime config layer: reads deployment env at request time and exposes GTM, Supabase, and auth policy to client components.
- Auth layer (Supabase): provides email/password signup and login without a custom backend.
- Chat proxy (`/api/chat`): forwards OpenAI-compatible chat completion requests to Hugging Face router, dedicated endpoints, or generic providers.
- Health route (`/api/health`): exposes readiness/liveness status for Docker and Kubernetes probes.
- Local workspace store: persists endpoints, threads, test cases, results, logs, and theme in browser storage.

## Data and control flow
- Endpoint flow:
  1. User adds an endpoint in the frontend.
  2. Config is stored in browser storage.
  3. Test requests and chat runs send the selected endpoint config to `/api/chat`.
- Chat flow:
  1. User selects an endpoint and model in the UI.
  2. Frontend posts chat payloads to `/api/chat`.
  3. Next.js forwards the request to `{baseUrl}/chat/completions`.
  4. Streamed SSE chunks are passed back to the UI and appended live.
- Auth flow:
  1. User opens `/auth`.
  2. Supabase client SDK handles email/password signup or login.
  3. Auth state is held client-side and can gate the app when `NEXT_PUBLIC_REQUIRE_AUTH=true`.
- Analytics flow:
  1. Layout reads `NEXT_PUBLIC_GTM_ID`.
  2. GTM script loads only when the ID exists.

## Deployment architecture
- Packaging: standalone Next.js build via `submodule/curlgeco_frontend/Dockerfile`
- Local runtime: `submodule/curlgeco_frontend/docker-compose.yml`
- Cluster target: UGECO AKS
- Ingress host: `curlgeco.ugeco.in`
- Ingress class: `nginx`
- Certificate issuer: `letsencrypt-ugeco-dns`
- Chart location: `artifacts/deployment/charts/curlgeco` (gitignored, not part of the public repo)

## Infra boundary
- Shared platform concerns (public ingress controller values, DNS, cert-manager cluster issuer, and admin tooling) are managed on the shared AKS platform, outside this repo.
- Application-specific concerns live in this repo:
  - curlgeco frontend image and runtime env
  - application ingress for `curlgeco.ugeco.in`
  - Docker and Helm packaging

## Security model
- No custom backend secrets are required for authentication; Supabase anon key is public by design.
- Endpoint API keys are stored client-side only in the current implementation.
- The proxy does not log secrets and centralizes provider calls.
- Security headers are set in Next.js config.

## Operational posture
- Health checks hit `/api/health`.
- Logs are kept inside the user workspace for replay and inspection.
- The service is horizontally scalable because application state is client-owned and the server is stateless.
