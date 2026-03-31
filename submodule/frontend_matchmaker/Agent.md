# Agent Guide - frontend_matchmaker

## Scope
- Treat `curlgeco_frontend/` as the effective frontend submodule.
- Do not assume a custom backend exists; auth is Supabase-backed and provider traffic is proxied through Next.js routes.

## Important files
- App shell: `curlgeco_frontend/src/components/layout/AppShell.tsx`
- Auth page: `curlgeco_frontend/src/app/auth/page.tsx`
- Proxy route: `curlgeco_frontend/src/app/api/chat/route.ts`
- Health route: `curlgeco_frontend/src/app/api/health/route.ts`
- Runtime config: `curlgeco_frontend/src/lib/runtime-config.server.ts`

## Runtime assumptions
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` enable auth.
- `NEXT_PUBLIC_REQUIRE_AUTH` gates the app.
- `NEXT_PUBLIC_GTM_ID` enables GTM.
- App state persists in browser storage under `curlgeco-playground`.

## Verification
- `npm run lint`
- `npm run build`
