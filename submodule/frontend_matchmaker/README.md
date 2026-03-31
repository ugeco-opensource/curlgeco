# frontend_matchmaker Context

For curlgeco, the `frontend_matchmaker` responsibility maps to the local `curlgeco_frontend` directory.

## Current stack

- Next.js App Router
- Tailwind CSS
- Zustand
- React Hook Form + Zod
- Supabase client auth

## Key behaviors

- `/auth` handles signup and login through Supabase.
- `/api/chat` proxies provider requests.
- `/api/health` supports container and Kubernetes probes.
- Browser storage remains the primary workspace persistence layer.

## Local commands

```bash
cd curlgeco_frontend
npm install
npm run lint
npm run build
npm run dev
```

## Deployment note

The master-repo deployment path is the Helm chart in `deployment/charts/curlgeco`, published on `curlgeco.ugeco.in`.
