# curlgeco Frontend

curlgeco is a local-first AI playground built with Next.js App Router, exported as a static site. It connects directly from the browser to Hugging Face router, Hugging Face dedicated endpoints, or any OpenAI-compatible `/v1/chat/completions` backend.

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

`NEXT_PUBLIC_*` values are inlined into the static build at build time (see the `ARG`s in `Dockerfile`, or set them in your shell before `npm run build`):

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_REQUIRE_AUTH`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Provider calls

There is no backend proxy — `src/lib/hf/chatCompletion.ts` calls each configured endpoint's `/chat/completions` directly from the browser using the endpoint's stored base URL and API key. The target endpoint must allow browser (CORS) requests.

## Build and verification

```bash
npm run lint
npm run build
```

`npm run build` produces a static export in `out/`.

## Notes

- Endpoint API keys stay in browser storage in the current implementation, and are sent directly to the configured provider — there is no server in between.
- Supabase currently covers authentication only; workspace sync can be added later.
- Security headers are set via `public/_headers` (Cloudflare Pages / Netlify convention) rather than `next.config.ts`, since static export doesn't support the `headers()` config function.
