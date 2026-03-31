# Low-Level Design - curlgeco

## Runtime topology
- Service: single Next.js process
- Internal HTTP surface:
  - `GET /api/health`
  - `POST /api/chat`
- UI routes:
  - `/`
  - `/auth`
  - `/connections`
  - `/chat`
  - `/tests`
  - `/logs`
  - `/settings`
- Container port: `3000`
- Kubernetes service port: `80`
- Kubernetes ingress class: `nginx`
- Kubernetes host: `curlgeco.ugeco.in`

## Storage model
- Browser storage key: `curlgeco-playground`
- Legacy browser storage key: `ugeco-model-lab`
- Persisted state:
  - endpoints
  - chat threads
  - active thread id
  - test cases
  - test results
  - logs
  - UI settings

## Auth implementation
- Provider: Supabase client SDK
- Mode: email/password signup and login
- Enablement:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Enforcement:
  - `NEXT_PUBLIC_REQUIRE_AUTH=true` redirects all non-auth routes to `/auth`
- Current scope:
  - user session handling only
  - no workspace persistence to Supabase yet

## GTM implementation
- Env key: `NEXT_PUBLIC_GTM_ID`
- Injection point: root layout
- Behavior: script and noscript container render only when the env var is non-empty

## Proxy contract
### `POST /api/chat`
- Request body:
  - `endpoint`: selected endpoint config, including `baseUrl`, `apiKey`, and optional headers
  - `model`
  - `messages`
  - `temperature`
  - `max_tokens`
  - `top_p`
  - `stream`
- Behavior:
  - validates endpoint presence
  - forwards request to `{baseUrl}/chat/completions`
  - passes bearer token from `endpoint.apiKey`
  - returns upstream JSON for non-stream calls
  - returns SSE stream for stream calls
  - forwards upstream error bodies without wrapping them in fake SSE responses

### `GET /api/health`
- Response fields:
  - `status`
  - `service`
  - `authEnabled`
  - `authRequired`
  - `gtmEnabled`

## Frontend implementation notes
- `src/components/providers/AppProviders.tsx`: runtime config + auth provider root
- `src/components/layout/AppShell.tsx`: auth-aware route shell and footer
- `src/components/layout/Topbar.tsx`: endpoint defaults and sign-in/out entry point
- `src/app/auth/page.tsx`: Supabase auth UI
- `src/app/chat/page.tsx`: thread-based prompt lab with streaming
- `src/app/tests/page.tsx`: batch testing and compare mode
- `src/app/logs/page.tsx`: replayable request history
- `src/app/settings/page.tsx`: theme, auth status, GTM status, import/export

## Environment matrix
- `NEXT_PUBLIC_APP_URL`: canonical app URL
- `NEXT_PUBLIC_SUPPORT_EMAIL`: support/contact email used in UI
- `NEXT_PUBLIC_GTM_ID`: optional GTM container id
- `NEXT_PUBLIC_REQUIRE_AUTH`: enables auth enforcement
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `NODE_ENV`: runtime mode for container and chart

## Container and Helm details
- Dockerfile:
  - installs dependencies from `curlgeco_frontend/package-lock.json`
  - builds standalone Next.js output
  - runs `node server.js`
- Helm chart:
  - deployment, service, ingress
  - `/api/health` readiness and liveness probes
  - env vars passed directly from chart values
  - TLS secret default: `curlgeco-ugeco-in-tls`
  - issuer default: `letsencrypt-ugeco-dns`

## Known constraints
- Endpoint API keys remain in browser storage in the current release.
- GTM has no consent-management layer yet.
- Supabase schema is defined, but frontend persistence beyond auth is still future work.
