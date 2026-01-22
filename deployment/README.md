# Deployment Notes

UGECO Model Lab is a standard Next.js App Router project.

## Local build

```bash
cd geco_frontend
npm install
npm run build
npm run start
```

## Environment

- Node.js 18+
- Ubuntu 22.04 compatible

## Proxy

The `/api/chat` route forwards requests to Hugging Face endpoints and streams tokens back to the client. Ensure outbound HTTPS access to Hugging Face endpoints in the target environment.
