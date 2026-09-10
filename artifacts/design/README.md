# curlgeco Design Docs

This folder contains the current system design for the curlgeco frontend and its immediate operational boundary.

## Files

- `HLD.md`: high-level architecture and infra boundary
- `LLD.md`: runtime topology, state model, and env matrix
- `open-api.yaml`: the provider (`/chat/completions`) contract the browser calls directly
- `schema.sql`: Supabase bootstrap schema for auth-adjacent product tables

## Scope

curlgeco has no backend at all — it's a static export. The design therefore centers on:

- Next.js frontend pages, statically exported
- Supabase auth for signup and login
- local-first browser persistence
- direct browser-to-provider calls for chat completions
- GTM integration through build-time env
- Cloudflare Pages as the primary deploy target, with a Docker/Helm path to the UGECO AKS public ingress as a secondary option
