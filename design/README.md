# curlgeco Design Docs

This folder contains the current system design for the curlgeco frontend and its immediate operational boundary.

## Files

- `HLD.md`: high-level architecture and infra boundary
- `LLD.md`: runtime topology, route behavior, state model, and env matrix
- `open-api.yaml`: app-owned HTTP API contract
- `schema.sql`: Supabase bootstrap schema for auth-adjacent product tables

## Scope

curlgeco still has no custom backend. The design therefore centers on:

- Next.js frontend pages and route handlers
- Supabase auth for signup and login
- local-first browser persistence
- GTM integration through runtime env
- Docker packaging
- Helm deployment to the UGECO AKS public ingress
