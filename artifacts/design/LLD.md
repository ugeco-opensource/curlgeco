# Low-Level Design - curlgeco

## Runtime topology
- Service: static export, no application server
- UI routes:
  - `/`
  - `/auth`
  - `/connections`
  - `/chat`
  - `/tests`
  - `/logs`
  - `/settings`
- Container port (Docker/Helm path only): `8080` (nginx-unprivileged)
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

## Provider client contract
### `requestChatCompletion` (`src/lib/hf/chatCompletion.ts`)
- Input:
  - `endpoint`: selected endpoint config, including `baseUrl`, `apiKey`, and optional headers
  - `model`
  - `messages`
  - `temperature`
  - `max_tokens`
  - `top_p`
  - `stream`
- Behavior:
  - validates endpoint presence
  - calls `{baseUrl}/chat/completions` directly from the browser via `fetch`
  - passes bearer token from `endpoint.apiKey`
  - returns the raw `Response`; callers read upstream JSON for non-stream calls or read the stream for stream calls
  - relies on the target endpoint allowing cross-origin requests (no server hop to route around CORS)

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

All `NEXT_PUBLIC_*` values are inlined into the JS bundle at build time (`next build`); none of them are read at runtime.

## Container and Helm details
- Dockerfile (`submodule/curlgeco_frontend/Dockerfile`):
  - installs dependencies from `package-lock.json`
  - takes `NEXT_PUBLIC_*` values as build `ARG`s so they're baked into the static export
  - builds the static export (`next build` with `output: "export"`) into `out/`
  - serves `out/` with `nginxinc/nginx-unprivileged` on port `8080`
- Helm chart (local-only, gitignored):
  - deployment, service, ingress
  - `/` readiness and liveness probes on port `8080` (no app-level health endpoint; nginx serving the index page is the signal)
  - TLS secret default: `curlgeco-ugeco-in-tls`
  - issuer default: `letsencrypt-ugeco-dns`

## Known constraints
- Endpoint API keys remain in browser storage in the current release.
- GTM has no consent-management layer yet.
- Supabase schema is defined, but frontend persistence beyond auth is still future work.
