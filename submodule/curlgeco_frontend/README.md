# curlgeco Frontend

curlgeco is a local-first AI playground built with Next.js App Router. It connects to Hugging Face router, Hugging Face dedicated endpoints, or any OpenAI-compatible `/v1/chat/completions` backend through a Next.js proxy.

## Features

- Endpoint manager with connection testing
- Streaming chat playground with markdown rendering
- Batch test suite with compare mode
- Replayable request logs
- Optional Supabase signup and login
- Optional Google Tag Manager
- Theme toggle, import/export, and local storage migration from the old app key

## Local setup

```bash
npm install
npm run dev
```

Copy `.example.env` to `.env` in this directory, or export the same variables in your shell.

## Runtime env

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_REQUIRE_AUTH`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## API routes

- `POST /api/chat`: proxies OpenAI-compatible chat completion requests
- `GET /api/health`: readiness and liveness probe

## Build and verification

```bash
npm run lint
npm run build
```

## Notes

- Endpoint API keys stay in browser storage in the current implementation.
- Supabase currently covers authentication only; workspace sync can be added later.
- Security headers are set in `next.config.ts`.
