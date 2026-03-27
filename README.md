# Andy — Creator Match by OWM

> AI-powered creator matching for founders. Describe your startup and Andy finds the creators who can move your audience.

**Live URL:** _Add your Vercel URL here after deployment_

---

## What it does

Founders describe their startup (name, industry, target audience, what they want in a creator partner), and Andy — powered by GPT-4o-mini — generates 4 realistic creator persona matches with:

- Name, niche, platform, and follower range
- A one-liner on why they fit
- A "why this creator" reasoning paragraph
- A match score (1–10)

Sessions are persisted so founders can browse past matches, view full creator cards, and delete sessions they no longer need.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components + route handlers keep the API key server-side |
| Language | TypeScript | Type safety across the DB ↔ API ↔ UI boundary |
| Styling | Tailwind CSS v4 | Fast iteration, no extra CSS files |
| Database | SQLite via `better-sqlite3` | Zero-config local persistence; swap for Postgres/Turso in production |
| AI | OpenAI `gpt-4o-mini` | Fast, cheap, structured JSON output via `response_format` |
| Deployment | Vercel | Native Next.js support, env var management |

## Local setup

```bash
# 1. Clone and install
git clone <repo>
cd owm_ai_app
npm install

# 2. Add your OpenAI key
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY=sk-...

# 3. Run
npm run dev
# Open http://localhost:3000
```

## Project structure

```
app/
  page.tsx                  # Home — startup input form
  dashboard/
    page.tsx                # Sessions list
    DeleteButton.tsx        # Client component for delete with confirm
  sessions/[id]/
    page.tsx                # Session detail with creator cards
  api/
    sessions/
      route.ts              # GET list + POST create (calls OpenAI)
      [id]/route.ts         # GET single + DELETE
lib/
  db.ts                     # SQLite via better-sqlite3, typed queries
  andy.ts                   # System prompt + OpenAI call
```

## Deployment (Vercel)

1. Push to GitHub
2. Import into Vercel
3. Add `OPENAI_API_KEY` in Project Settings → Environment Variables
4. Deploy

> **Note:** SQLite writes to the local filesystem — Vercel's serverless functions have an ephemeral FS. For a persistent production deployment, swap `lib/db.ts` for [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Turso](https://turso.tech). The schema and query interface are identical; only the driver changes.

## Trade-offs and what I'd add with more time

**Cut to ship:**
- Auth — sessions are currently unowned and public by URL
- Pagination on the dashboard
- Streaming the OpenAI response with `ReadableStream` for a snappier UX

**Would add next:**
- Real creator database lookup (e.g. via a creator data API) instead of purely generated personas
- Session sharing via shareable links
- Export to CSV / PDF for founder decks
- Turso/Neon as the database so Vercel deployments get real persistence without changes
- Filtering/sorting on the dashboard by industry or match score

## The system prompt

Andy's prompt (in `lib/andy.ts`) is opinionated:

- It rejects generic "lifestyle influencer" thinking and forces specificity on niche, audience psychographics, and platform dynamics
- It explicitly models the difference between reach and resonance
- It returns strict JSON so the frontend never parses freeform text
- Temperature is set to 0.85 — enough creativity for varied personas, not so high that outputs become unreliable
