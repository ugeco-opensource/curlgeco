# Agent Context

UGECO Model Lab is a Next.js (App Router) frontend for testing Hugging Face and OpenAI-compatible chat endpoints. It supports local endpoint management, streaming chat, batch testing, and logs replay. All frontend code is located in `geco_frontend`.

## Key locations

- Frontend app: `geco_frontend/src`
- API proxy: `geco_frontend/src/app/api/chat/route.ts`
- Core store: `geco_frontend/src/lib/store.ts`
- Design tokens: `geco_frontend/src/app/globals.css`

## UX notes

- Dark, premium devtool aesthetic with UGECO design tokens
- Left sidebar navigation, topbar endpoint selector, and quick actions
- Streaming + markdown rendering in chat

## Persistence

- Endpoint configs, threads, tests, and logs are stored in `localStorage`
- API keys are never logged and are sent only to the server proxy
