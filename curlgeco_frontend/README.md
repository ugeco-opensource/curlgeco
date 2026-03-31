# UGECO Model Lab (Frontend)

UGECO Model Lab is a premium Hugging Face model testing suite + chatbot playground built with Next.js (App Router). It connects to Hugging Face Router or dedicated endpoints using the OpenAI-compatible `/v1/chat/completions` format, supports streaming, and includes a test harness + logs panel.

## Features

- Endpoint manager (HF Router, HF Dedicated Endpoint, OpenAI-compatible)
- Chat playground with streaming tokens, system prompts, and markdown rendering
- Testing suite with batch prompts + compare mode
- Observability logs with replay
- Local-only persistence via `localStorage`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Configuration

### HF Router example

- **Base URL**: `https://router.huggingface.co/v1`
- **API Key**: `<HF_TOKEN>`
- **Model**: `Qwen/Qwen2.5-7B-Instruct` (or any router-supported model)

### HF Dedicated Endpoint example

- **Base URL**: `https://YOUR_ENDPOINT.huggingface.cloud/v1`
- **API Key**: `<HF_TOKEN>`
- **Model**: provided by your endpoint

## Streaming

All chat requests go through the server-side proxy at `POST /api/chat`. When `stream: true`, the proxy forwards SSE responses so the client can render tokens as they arrive.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- Endpoint configs + API keys are stored locally in the browser. No server-side persistence yet.
- `.env.example` is included for future expansion.
