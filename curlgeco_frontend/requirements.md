Below is a **copy-paste ready “super-detailed prompt”** you can give to your coding agent to build the project exactly as you described.

It’s designed around **Hugging Face Endpoints / Router** using the **OpenAI-compatible Chat Completions API** (`/v1/chat/completions`). ([Hugging Face][1])

---

## ✅ Prompt for Coding Agent (Next.js Hugging Face Model Testing Suite)

You are a **senior full-stack engineer + UI/UX designer**. Build a production-grade **Next.js (App Router) web application** that acts as a **Hugging Face model testing suite + chatbot playground**.

### Product name

**UGECO Model Lab** (or “HF Model Lab by UGECO”)

---

# 0) Core Objective

Create a **Next.js based frontend project** with exceptional UI/UX (UGECO design language). The app should:

1. Accept **HF endpoints + API keys**
2. Send requests to these endpoints
3. Receive responses (including **streaming tokens**)
4. Provide a **Chatbot UI**
5. Provide a **Testing Suite UI** to evaluate prompts, latency, retries, compare results, and export logs

HF endpoints support OpenAI-compatible chat completions, and the app must use that format. ([Hugging Face][1])

---

# 1) Tech Stack Requirements

## Mandatory

* **Next.js 14+ (App Router) + TypeScript**
* **TailwindCSS**
* **shadcn/ui** components for clean modern UI
* **React Hook Form + Zod** for forms & validation
* **State:** Zustand or React Context (your choice)
* **Syntax highlighting** for code blocks (Shiki or Prism)
* **Streaming support** using Web Streams (`ReadableStream`) and SSE-style UI updates
* Must work on **Ubuntu 22.04** local dev

## Nice-to-have

* Vercel AI SDK optional (only if it reduces complexity)
* Theme support (dark/light) but default to UGECO dark

---

# 2) UGECO UI / UX Design Language (Must Follow)

**Important:** Refer to the “UGECO brand pack” for exact colors, logo usage, spacing, typography, gradients, shadows, and corner radii.
If the brand pack isn’t available at runtime, implement the design with these defaults, but keep it **easy to swap** later:

### Default Design Tokens (fallback)

* Background: `#070B18` (deep navy)
* Surface: `#0B1224` (elevated cards)
* Border: subtle `rgba(255,255,255,0.06)`
* Primary accent: `#2F6BFF` (UGECO blue)
* Secondary accent: `#00D4FF` (cyan glow)
* Text primary: `#EAF0FF`
* Text muted: `rgba(234,240,255,0.7)`
* Radius: 16px+ (2xl)
* Shadow: soft + layered
* Layout: **grid-based**, generous spacing, minimal clutter

### UI/UX Principles

* **Feels like a premium devtool** (Linear + Vercel-like)
* “Delight” details: animations, hover states, skeleton loaders
* Extremely readable chat bubbles and config panels
* Don’t overwhelm: progressive disclosure (Advanced settings collapsed)
* All actions should have: toast feedback + clear error states

---

# 3) Functional Requirements

## 3.1 Endpoint Manager

Build a “Connections” system where user can add multiple endpoints:

Each endpoint config includes:

* **Name** (e.g., “HF Router / Llama 70B”, “My Qwen Endpoint”)
* **Provider Type**

  * `HF_ROUTER` (serverless)
  * `HF_DEDICATED_ENDPOINT` (custom deployed endpoint base URL)
  * `OPENAI_COMPATIBLE_GENERIC` (any `/v1/chat/completions` compatible)
* **Base URL**

  * For HF Router: default fixed to `https://router.huggingface.co/v1` ([Hugging Face][2])
  * For Dedicated endpoints: user provides base URL ending with `/v1` (app enforces it)
* **API Key** (masked input, show toggle)
* **Default model id** (string)
* Optional: headers override (advanced)

✅ Save these configs in `localStorage` (with clear warning: local only).
✅ Provide “Test Connection” button.

### “Test Connection” behavior

Run a minimal request to:

* `POST {baseUrl}/chat/completions`
* with a simple message like “Hello”
* show status, latency, and model response

This works because HF chat completion uses OpenAI-compatible API. ([Hugging Face][3])

---

## 3.2 Chat Playground

A full chat interface:

### Features

* Multi-chat threads (left sidebar)
* System prompt editor (per thread)
* Model parameters panel (per thread)

  * temperature
  * max_tokens
  * top_p
  * stream on/off
* Message rendering supports:

  * Markdown
  * Code blocks + copy button
  * Inline formatting
* Regenerate last answer
* Stop streaming
* Clear chat
* Export conversation JSON

### Request Format (STRICT)

Use OpenAI-compatible format:

`POST {baseUrl}/chat/completions`

Body:

```json
{
  "model": "MODEL_ID",
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.6,
  "max_tokens": 200,
  "stream": true
}
```

TGI supports `/v1/chat/completions` and supports `"stream": true`. ([Hugging Face][4])
Hugging Face Inference Providers router is also OpenAI-compatible (chat completion). ([Hugging Face][2])

---

## 3.3 Model Testing Suite (Evaluator UI)

Create a “Test Suite” screen where user can run a batch of prompts.

### Each Test Case includes

* Name
* Prompt / Messages template
* Expected behavior (optional text)
* Tags (reasoning, code, summarization, safety, etc.)
* Parameters override

### Running tests should output

* response text
* latency (ms)
* tokens (if available in response)
* pass/fail (manual toggle)
* retry button
* compare against another endpoint

### Must Support “Compare Mode”

Pick 2 endpoints + same test set → show side-by-side diff.

### Export

* JSON export of results
* “Copy Markdown report” for sharing

---

## 3.4 Observability Panel

Add a “Logs” page:

* list of requests
* endpoint used
* model used
* latency
* success/failure
* error message
* quick “Replay request”

---

# 4) Backend Architecture (Next.js API Proxy)

**Important security/compatibility requirement:**
Implement a server-side proxy using Next.js route handler:

`POST /api/chat`

### Why

* Avoid CORS issues
* Avoid exposing API keys directly to the browser
* Keep provider logic centralized

Use **Next.js App Router route handlers** and stream to the client using Web Streams. Next.js supports streaming concepts in App Router. ([Next.js][5])

### Proxy behavior

* Client sends endpoint config ID + messages + params to `/api/chat`
* Server reads config from request payload (or from encrypted storage later)
* Server calls `{baseUrl}/chat/completions` with bearer token
* Server returns response to client
* If `stream=true`, forward tokens as stream

---

# 5) Streaming Requirements

Implement proper streaming UX:

### UI streaming behavior

* assistant message appears immediately as empty bubble
* tokens append live
* “Stop” button cancels fetch (AbortController)
* on completion, persist final message into thread history

TGI explicitly supports streaming in OpenAI Messages API. ([Hugging Face][6])

---

# 6) Pages & Navigation

### Required routes

* `/` → Dashboard (quick start + recent tests)
* `/connections` → Endpoint manager
* `/chat` → Chat playground
* `/tests` → Testing suite
* `/logs` → Request logs
* `/settings` → Theme + defaults + export/import configs

### Layout

* Left sidebar navigation with icons
* Topbar:

  * current endpoint selector
  * model selector
  * quick “New Chat”
* Main canvas uses cards and panels

---

# 7) Folder Structure (recommended)

Use clean architecture:

```
src/
  app/
    (marketing)/page.tsx
    chat/page.tsx
    tests/page.tsx
    connections/page.tsx
    logs/page.tsx
    settings/page.tsx
    api/chat/route.ts
  components/
    layout/
    chat/
    connections/
    tests/
    ui/ (shadcn)
  lib/
    hf/
      types.ts
      client.ts
      streaming.ts
    storage/
      local.ts
    utils.ts
  styles/
```

---

# 8) HF Provider Support Rules

### Provider: HF Router (Serverless)

Use base URL:

* `https://router.huggingface.co/v1` ([Hugging Face][2])

### Provider: HF Inference Endpoint (Dedicated)

User provides endpoint base url, app ensures it ends with `/v1/`

HF endpoints are OpenAI chat completion compatible. ([Hugging Face][1])

### Response parsing

Support standard OpenAI chat completion responses:

* `choices[0].message.content`

Also handle errors nicely.

---

# 9) Acceptance Criteria (Must Pass)

✅ You can add an endpoint and test it
✅ You can chat with it (non-stream and streaming)
✅ You can run test suite prompts and get results
✅ Compare results between 2 endpoints
✅ Logs capture every request
✅ Beautiful UI consistent with UGECO design language
✅ No secrets leaked in console logs
✅ TypeScript strict mode clean build
✅ Good empty states + loading skeletons + error messages

---

# 10) Deliverables

1. A working Next.js repo (App Router)
2. `README.md` with:

   * Setup steps
   * How to add HF Router endpoint
   * How to add HF Dedicated endpoint
   * How streaming works
3. `.env.example`
4. Screenshots/gifs optional

---

# 11) README Snippet Must Include (copy-ready)

Example HF Router config:

* Base URL: `https://router.huggingface.co/v1`
* API Key: `<HF_TOKEN>`
* Model: provide user input (e.g., “Qwen/Qwen2.5-7B-Instruct”)

Example Chat Request uses `/v1/chat/completions` format. ([Hugging Face][3])

---

## Extra Credit (if time)

* prompt templates library (“Summarize”, “Fix Code”, “Write PRD”, “Agent planner”)
* keyboard shortcuts (⌘K command palette)
* import/export endpoint configs JSON
* “Shareable session” via URL param (without secrets)
* lightweight auth (optional)

---

If you want, I can also generate:

* A **sample UGECO design tokens `theme.ts`**
* A **ready-to-run API proxy implementation strategy** for streaming
* A **complete test prompt pack** for agent-orchestrator evaluation (tool calling, reasoning, planning, refusal tests)

[1]: https://huggingface.co/docs/inference-endpoints/en/tutorials/chat_bot?utm_source=chatgpt.com "Build and deploy your own chat application"
[2]: https://huggingface.co/docs/inference-providers/en/index?utm_source=chatgpt.com "Inference Providers"
[3]: https://huggingface.co/docs/inference-providers/en/tasks/chat-completion?utm_source=chatgpt.com "Chat Completion"
[4]: https://huggingface.co/docs/text-generation-inference/en/basic_tutorials/consuming_tgi?utm_source=chatgpt.com "Consuming Text Generation Inference"
[5]: https://nextjs.org/learn/dashboard-app/streaming?utm_source=chatgpt.com "Streaming - App Router"
[6]: https://huggingface.co/docs/text-generation-inference/en/reference/api_reference?utm_source=chatgpt.com "HTTP API Reference"
