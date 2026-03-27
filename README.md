# Andy — Creator Match by OWM

> AI-powered creator matching for founders. Describe your startup and Andy finds the creators who can move your audience.

**Live demo:** https://owm-ai-andy.vercel.app/
**Walkthrough:** [https://loom.com/share/placeholder](https://www.loom.com/share/70c7d9f04d484d7bb6e05f2f0bbdefe5)

---

## What it does

Founders describe their startup (name, industry, target audience, what they want in a creator partner), and Andy — powered by OpenAI — generates realistic creator persona matches with:

- Name, niche, platform, and follower range
- A one-liner on why they fit
- A "why this creator" reasoning paragraph
- A match score (1–100)

Sessions are persisted so founders can browse past matches, view full creator cards, and delete sessions they no longer need.

## Design

The goal was a sleek, modern tool that feels premium without being flashy. Dark backgrounds, restrained use of color, and clean typography keep the interface out of the way so the content — Andy's matches — stays front and center. Indigo accents give it energy without overwhelming the screen, and animations are used deliberately to communicate state (loading, revealing, transitioning) rather than for decoration. The experience is meant to feel like a focused professional tool, not a consumer app.

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
  page.tsx                  # Home — startup input form and loading
  dashboard/
    page.tsx                # Dashboard session list page
    DashboardList.tsx       # List of all session cards
    DashboardCard.tsx       # Individual session card, creator modal + session modal
    DeleteButton.tsx        # Client component for delete with confirm
    SpeechTooltip.tsx       # Andy speech bubble tooltip
  matches/[id]/
    page.tsx                # Creator match reveal page
    MatchesReveal.tsx       # Animated reveal + creator grid
    CreatorTile.tsx         # Individual creator card tile
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

## Trade-offs

### SQLite over a hosted database
SQLite is fast, lightweight, and requires zero configuration — perfect for a take-home where getting something running quickly matters. The downside is that Vercel's serverless functions use an ephemeral filesystem, so sessions don't persist between cold starts or deployments. For a real production app, swapping to a hosted database like PostgreSQL (Vercel Postgres, Neon, or Supabase) would give true persistence with minimal changes — the query interface in `lib/db.ts` would stay largely the same, only the driver changes.

### Fictional creator personas over real creator data
Generating fictional creator personas means Andy is inventing his reasoning to fit criteria rather than evaluating real people with verifiable track records. This creates a fundamental tension: the match scores and one-liners feel authoritative, but they're constructed post-hoc to justify a persona Andy fabricated from scratch. A real creator matching product would ingest actual creator data — follower counts, engagement rates, past brand deals, audience demographics — and have Andy reason over that. The current approach demonstrates the matching logic well but the outputs are illustrative rather than actionable.

### Parallel AI calls (matches + ratings simultaneously)
Each session triggers two separate OpenAI calls: one to generate named creator matches (`generateCreatorMatches`) and one to score and enrich the 20 pre-seeded creator images (`generateCreatorRatings`). Running them in parallel with `Promise.all` cuts the wait time roughly in half compared to running them sequentially — both calls take ~30–40 seconds, so parallel execution saves the user nearly a minute of loading time. The trade-off is doubled API cost per session and the fact that if either call fails, the whole session fails and both calls need to be retried.

### No streaming
Both OpenAI calls are fully awaited before anything renders, so the user stares at a loading screen for 60–70 seconds. Streaming the response would let results appear progressively and make the wait feel much shorter. This was cut for simplicity — streaming adds meaningful complexity to both the API route and the client — but it's the single biggest UX pain point in the current build.

### What I'd add with more time
- **Accounts and session persistence** — a proper user model so each account owns its own sessions, with no cross-visibility between users, backed by a persistent database
- **Authentication** — ensure users can only read and delete their own sessions
- **Per-account rate limiting** — prevent any single user from burning through OpenAI quota
- **A more alive Andy** — Andy is the core of the experience and should feel present throughout, not just at the output stage. He should pop in during the input form with suggestions, flag if a prompt is too vague or won't produce good results, and guide the user toward a better search rather than just accepting whatever is typed
- **Input validation** — profanity filtering and gibberish detection on the form before the OpenAI call is even made
- **Rich creator profiles** — each creator should have a full profile page with deeper information: how they like to conduct brand deals, content style, past partnership examples, audience breakdown, and contact approach
- **Mobile layout** — the current UI is desktop-first; a responsive mobile version would significantly expand usability
- **Smarter secondary/tertiary enrichment** — having Andy reliably produce secondary and tertiary niches and platforms for each creator would make matches feel richer and allow brand deals to reach adjacent but relevant audiences beyond the obvious fit
- **Deeper demographic understanding** — Andy currently has basic awareness of gender, ethnicity, and couple accounts, but a more sophisticated model would understand the nuanced content styles, audience dynamics, and brand fit signals that come with each. A couple account, for example, operates very differently from a solo creator and tends to attract a different advertiser profile entirely
- **Streaming results** — Surface creators as they're generated rather than waiting for the full response, directly addressing the 60–70 second loading screen
- **Shareable session links** — Let founders send their match results to a co-founder or investor without needing an account
- **Export to PDF / deck** — Founders often need to present creator recommendations; a one-click export would make the output actually usable in a pitch or brief
- **Component and utility refactoring** — Several pieces of UI logic are duplicated across files (e.g. the match percentage ring, color helpers, date formatters). With more time these would be extracted into shared components and utility functions, each defined once and imported where needed rather than copied
- **Empty dashboard state** — The "no sessions found" screen on the dashboard is intentionally minimal. A user landing there without any prior matches is an extremely rare path (they'd have to navigate directly without ever submitting the form), so it was deprioritized in favor of screens that actually get seen
- **Typography system** — Font choices were not fully fleshed out. Most of the time was spent on screen flow, animations, and layout, so a proper type scale with intentional font pairings for headings, body, and UI labels was left underdeveloped

## The system prompt

Andy has two prompts in `lib/andy.ts`, both heavily engineered to produce outputs that feel like a real talent agent's work rather than an algorithm's.

### SYSTEM_PROMPT — generating creator matches
The first prompt produces 3-7 named creator personas from scratch given a startup profile. Key design decisions:

- **Niche specificity is enforced by example.** The prompt doesn't just say "be specific" — it gives a concrete bad example ("fitness creator") and a good one ("evidence-based strength training for women 25–40 who work desk jobs"). This pattern reliably pushes the model away from generic outputs.
- **Platform literacy is baked in.** Andy understands that TikTok is for viral Gen Z reach, LinkedIn is for B2B, Podcasts are for deep engagement, and so on. Platforms like Twitter/X are excluded entirely — they don't serve brand partnerships well and cluttered the output.
- **Audience psychographics over follower count.** The prompt explicitly tells Andy that a smaller, highly-aligned audience beats a large misaligned one. This mirrors how real talent agents think.
- **Persona depth via secondary/tertiary fields.** Each creator can have up to 3 niches and 3 platforms, but only when they genuinely add dimension. The schema annotations use active-question framing ("what else does this creator naturally talk about?") rather than "optional, omit if not applicable" — the latter was too strong a suppression signal and caused the fields to never appear.
- **Personality is explicitly requested.** The prompt tells Andy to have a voice and act like a matchmaker a founder would want to grab coffee with, not a dry algorithm. This bleeds into the one-liners and why-fit reasoning.

### RATING_SYSTEM_PROMPT — scoring the creator roster
The second prompt takes the 20 pre-seeded creator images (each with an age range, ethnicity, and gender) and invents a full persona for each one tailored to the startup — then scores it. Key design decisions:

- **Score distribution is enforced.** Exactly 3–7 creators must score 75 or above. The rest fall below. This forces Andy to be genuinely selective rather than inflating every score, and creates meaningful contrast between strong matches and weak ones in the UI.
- **Irregular numbers are required.** The prompt bans multiples of 5 and 10 for match scores (e.g. 73, 81, 67 instead of 70, 80, 65). Round numbers feel robotic; irregular ones feel like a human actually thought about it.
- **One-liners have a specific voice constraint.** Andy is told to sell the match, not describe it — and critically, never to end with a verdict like "they're a great fit" or "this is a strong match." The line should speak for itself. Bad: "Their audience overlaps with your target demographic." Good: "He turns gym chalk and sweat into aspirational content — your product belongs in that gym bag."
- **Schema annotations carry as much weight as rule text.** A key discovery: when using `response_format: { type: 'json_object' }`, the LLM pays close attention to the annotations inside the JSON schema definition at generation time. "string (optional, omit if not applicable)" acts as a default-off suppression signal; "string or omit — what else does this creator naturally talk about?" frames it as an active question the model actually considers. The framing of the annotation matters as much as the rules written above it.
- **Temperature is 0.75** (lower than the first prompt) — the rating task requires more consistency and judgment; too much variance here produces score distributions that feel random.
