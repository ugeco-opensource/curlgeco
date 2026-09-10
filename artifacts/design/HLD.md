# High-Level Design - curlgeco

## Overview
curlgeco is an AI playground frontend focused on fast endpoint testing, streaming chat, prompt evaluation, and deployment readiness. The application is a static Next.js App Router export with no server component at runtime. It keeps workspace state local-first in the browser, uses Supabase for signup and login when enabled, and calls model providers directly from the browser.

## Core components
- Frontend shell (Next.js App Router, static export): renders dashboard, connections, chat, tests, logs, settings, and auth.
- Runtime config layer: values are read from `NEXT_PUBLIC_*` env at build time and inlined into the static output; there is no per-request server config.
- Auth layer (Supabase): provides email/password signup and login without a custom backend.
- Provider client (`src/lib/hf/chatCompletion.ts`): calls `{baseUrl}/chat/completions` directly from the browser for Hugging Face router, dedicated endpoints, or generic OpenAI-compatible providers.
- Local workspace store: persists endpoints, threads, test cases, results, logs, and theme in browser storage.

## Data and control flow
- Endpoint flow:
  1. User adds an endpoint in the frontend.
  2. Config is stored in browser storage.
  3. Test requests and chat runs send the selected endpoint config straight to the provider.
- Chat flow:
  1. User selects an endpoint and model in the UI.
  2. Browser posts the chat payload directly to `{baseUrl}/chat/completions` with the stored API key as a bearer token.
  3. Streamed SSE chunks are read from the response and appended live.
  4. The target endpoint must allow cross-origin (CORS) requests from the browser, since there is no server hop to avoid it.
- Auth flow:
  1. User opens `/auth`.
  2. Supabase client SDK handles email/password signup or login.
  3. Auth state is held client-side and can gate the app when `NEXT_PUBLIC_REQUIRE_AUTH=true`.
- Analytics flow:
  1. Layout reads `NEXT_PUBLIC_GTM_ID`.
  2. GTM script loads only when the ID exists.

## Deployment architecture
- Primary target: Cloudflare Pages, Next.js (Static HTML Export) preset, root directory `submodule/curlgeco_frontend`, output directory `out`.
- Packaging: static export built via `submodule/curlgeco_frontend/Dockerfile`, served by `nginxinc/nginx-unprivileged`.
- Local runtime: `submodule/curlgeco_frontend/docker-compose.yml`
- Cluster target (secondary, local-only chart): UGECO AKS
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
- Endpoint API keys are stored client-side only and sent directly to the configured provider — there is no server in between to centralize or redact them.
- Security headers are set via `public/_headers` (static hosting convention), not Next.js config, since static export doesn't support the `headers()` config function.

## Operational posture
- There is no server process to health-check; readiness is host-level (e.g. Cloudflare Pages build status, or the nginx container in the Docker/Helm path).
- Logs are kept inside the user workspace for replay and inspection.
- The service is a static asset bundle — it scales as far as the CDN/host serving it, since there is no application server at all.
