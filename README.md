# Flashcard Engine

> AI-powered spaced repetition flashcards. Upload your notes, get study-ready cards, review smarter.

**Live demo:** [https://flashcard-engine-k6mn.vercel.app](https://flashcard-engine-k6mn.vercel.app)

---

## What I Built

Flashcard Engine is a full-stack study application that solves one specific problem: **most people study wrong**. They re-read notes passively, cram the night before, and forget everything within a week. This app forces active recall with a feedback loop that actually compounds.

The core loop:

1. **Upload** a PDF or paste raw notes
2. **AI generates** question-answer flashcards chunked by topic
3. **Study** with a flipping card interface — rate each card (Again / Hard / Medium / Easy)
4. **SM-2 algorithm** reschedules each card based on your rating
5. **Insights** surface your weakest topics, best study time, and daily volume

---

## Screenshot / Demo Flow

```
Upload PDF → Generation Progress → Deck View → Study Session → Session Summary → Insights
```

The study session is the heart of the app. Cards flip on click (or Space/Enter). After revealing the answer, you rate your recall. That rating feeds directly into SM-2 to set the next review date.

---

## The SM-2 Algorithm — Plain English

SM-2 is a scheduling algorithm originally developed by Piotr Woźniak in 1987. It answers one question: **when should you see this card again?**

Every card stores three numbers:

| Field | What it means |
|---|---|
| `interval` | Days until the next review |
| `easeFactor` | How easy this card is for you (starts at 2.5) |
| `repetitions` | How many successful reviews in a row |

After each review, the algorithm adjusts based on your rating:

**AGAIN** — You blanked. Reset to interval=0 (end of deck for now), repetitions=0, ease drops by 0.2 (floor: 1.3).

**HARD** — You got it, but struggled. Interval = 1 day, ease drops by 0.15.

**GOOD** — Normal recall. Interval = 3 days. Ease unchanged. This is the default path.

**EASY** — Instant recall. Interval = 7 days, ease increases by 0.1 (ceiling: 3.0). The card backs off faster.

The approach is **fixed intervals** for all cards (0→1→3→7), not a multiplier-based SM-2. This keeps early-stage cards feeling responsive without disappearing for weeks after one review. It's the same bootstrapping strategy Anki uses.

```ts
// src/lib/sm2.ts
export function applyRating(card, rating) {
  let { interval, easeFactor, repetitions } = card;

  switch (rating) {
    case "AGAIN":
      interval = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;
    case "HARD":
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions = repetitions + 1;
      break;
    case "GOOD":
      interval = 3;
      repetitions = repetitions + 1;
      break;
    case "EASY":
      interval = 7;
      easeFactor = Math.min(3.0, easeFactor + 0.1);
      repetitions = repetitions + 1;
      break;
  }
  return { interval, easeFactor, repetitions, nextReviewDate: daysFromNow(interval), isNew: false };
}
```

---

## Key Decisions & Tradeoffs

### 1. Grok (via OpenRouter) over GPT-4
I used Grok via OpenRouter because it offers a cost-effective and flexible entry point — OpenRouter automatically retries other models if Grok is unavailable, which adds resilience without extra infrastructure. The chunker splits source text into ~500-word segments with heading detection, so generation runs in parallel per chunk — faster and more fault-tolerant than one giant prompt.

### 2. Streaming generation progress via SSE
Card generation is async and can take 10–30 seconds depending on document length. Rather than polling, I implemented a Server-Sent Events endpoint (`/api/progress/[deckId]`) backed by a simple in-process event emitter. The frontend subscribes and updates a progress bar in real time. Tradeoff: this won't scale horizontally across multiple Node processes — for production you'd swap the emitter for Redis pub/sub.

### 3. Session persistence in localStorage
If you close the tab mid-session, your progress is saved. On re-open the session resumes exactly where you left off. This was a small feature with a disproportionate UX payoff. The tradeoff is that `localStorage` is synchronous and slightly fragile — a proper solution would persist to the server after each rating, but that adds latency to the hot path.

### 4. Topic tags as first-class citizens
Every card has a `topicTag`. Topics flow through the entire app: the heatmap shows mastery per topic, study sessions can be filtered by topic, and the insights dashboard shows per-topic retention rates. The initial design had topics as a nice-to-have — they ended up being the most useful navigation primitive.

### 5. Prisma with a pg adapter rather than a serverless ORM
I used Prisma with `@prisma/adapter-pg` instead of a serverless-first ORM like Drizzle. This adds a small cold-start penalty on Vercel but gives a richer query API and a migration system that's familiar to most teams.

The stack was chosen for developer experience (Prisma + TypeScript), modern UI (MUI + Tailwind), and easy deployment (Vercel). Next.js App Router enables both server-rendered dashboards and client-side study sessions without complex state management.

---

## What I'd Improve With More Time

**1. Server-side session persistence**
Currently each card rating hits `/api/review` in real time. If you lose connection mid-session, ratings are lost. The right design: batch ratings into a session object, persist to DB at the end, reconcile on resume.

**2. Horizontal scaling for generation**
The in-process SSE event emitter works on a single server. With multiple instances, events emitted on one pod won't reach clients connected to another. Redis pub/sub or a message queue (BullMQ) would fix this cleanly.

**3. Smarter chunking**
The current chunker splits on word count and heading boundaries. A better approach uses semantic similarity (embeddings) to chunk by concept rather than structure — especially important for dense academic PDFs where a single concept can span multiple sections.

**4. Mobile study mode**
The study session works on mobile but isn't optimized for it. Swipe-to-flip and thumb-zone rating buttons would make this feel native on phones, where most real studying happens.

**5. Deck sharing / public links**
Right now decks are private. A shareable read-only link (or exportable Anki format) would make the app genuinely useful for study groups and classroom settings.

**6. Better PDF extraction**
The current PDF pipeline fails on scanned/image-based PDFs. Adding OCR (Tesseract or a cloud vision API) as a fallback would dramatically expand what users can upload.

---

## Interesting Challenges

### Challenge: SM-2 scheduling for early-stage cards
A strict SM-2 implementation multiplies `interval × easeFactor` on every GOOD rating, which produces large jumps even for cards a user has only seen once or twice. In practice this felt too aggressive — a card seen once shouldn't disappear for a week.

Instead of the full multiplier algorithm, this implementation uses **fixed intervals** (AGAIN=0, HARD=1 day, GOOD=3 days, EASY=7 days). This keeps early-stage cards feeling responsive and predictable. It's a deliberate design choice (same approach Anki uses) rather than a simplified SM-2 — sacrificing mathematical purity for better UX.

### Challenge: SSE stream cleanup on Vercel
SSE streams need careful cleanup when the client disconnects. The initial implementation leaked event listeners and setInterval handles on every connection. I fixed this by attaching to `request.signal`'s `abort` event and tracking a `closed` boolean, then unregistering all listeners atomically.

### Challenge: MUI theme in Next.js App Router
MUI's emotion-based styling system doesn't work with React Server Components out of the box — it needs a client-side cache provider. I implemented a `ThemeRegistry` component that wraps `CacheProvider` and uses `useServerInsertedHTML` to inject critical CSS during SSR without a flash of unstyled content.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | NextAuth v5 (credentials + session) |
| AI | Grok (OpenRouter) |
| UI | MUI v9 + Tailwind v4 |
| Animation | Framer Motion |
| Deployment | Vercel |

---

## Running Locally

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in the required values — see Environment Variables below

# 3. Push schema
# Use migrate deploy if you want to apply existing migrations:
npx prisma migrate deploy
# Or use db push to skip migrations and sync the schema directly (dev only):
npx prisma db push

# 4. Seed demo data
npx prisma db seed

# 5. Start dev server
npm run dev
```

Visit `http://localhost:3000` and log in with:

- **Email:** `demo@flashcard.app`
- **Password:** `demo@123`

---

## Environment Variables

```dotenv
# Database — get this from Neon dashboard -> Connection string -> Pooled connection
DATABASE_URL="postgresql://neondb_owner:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require"

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret_here"

# Gemini — get from Google AI Studio (aistudio.google.com)
GEMINI_API_KEY=""

# LLM provider selection: gemini | groq
LLM_PROVIDER="groq"
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL="llama-3.1-8b-instant"
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Fallback — Second Groq key (different account)
GROQ_API_KEY_FALLBACK="your_groq_fallback_api_key_here"

# Cron security — random string to protect cron endpoint from public calls
CRON_SECRET="your_random_cron_secret_here"
```

---

## Running Tests

```bash
# Unit tests (SM-2 algorithm, chunker, utils)
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-lib.ts

# Service integration tests (requires running DB)
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-services.ts

# API tests (requires running dev server on :3000)
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-api.ts
```

---

## Project Structure

```
src/
├── app/              # Next.js routes (App Router)
│   ├── (app)/        # Authenticated shell — dashboard, decks, settings
│   ├── (auth)/       # Login, register, verify
│   └── api/          # REST + SSE endpoints
├── components/       # React components by domain
├── services/         # Business logic (deck, card, review, session, progress)
├── lib/              # Pure utilities — SM-2, chunker, Gemini client, Prisma
├── hooks/            # Client-side data hooks (SWR-based)
└── types/            # Shared TypeScript types
```

The service layer is deliberately separated from API routes so the same logic can be called from server components (dashboard page) or API handlers without duplication.