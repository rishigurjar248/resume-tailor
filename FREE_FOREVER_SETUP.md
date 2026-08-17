# ResumeLM — Free Forever build

This build keeps the existing ResumeLM UI/workflows while removing the monetization layer.

## What changed

- No subscriptions, checkout, Stripe, paid plans, credits, trials, or upgrade prompts.
- No application-enforced daily/monthly resume limits.
- Base and tailored resume creation is unlimited from the app's perspective.
- AI provider abstraction supports automatic server-side failover.
- Provider order: OpenRouter Free → Google Gemini → Groq.
- Failover is only used when a configured provider fails, times out, is unavailable, or returns a quota/rate-limit style error.
- Provider rate limits and terms are not bypassed.
- API keys are server-side environment variables only.

## Quick start

### Option A — local Next.js

```bash
npm install
cp .env.example .env.local
```

Put at least one permitted free-tier provider key in `.env.local`:

```env
OPENROUTER_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=
```

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Option B — included Docker stack

The project retains the original local Supabase/Redis Docker stack. Start the supporting services with the commands documented in `docker/DOCKER.md`, then run the Next.js app locally with `npm run dev`.

## Important

"Unlimited" means there is no artificial application credit/subscription/resume-count limit. Free AI providers still enforce their own free-tier quotas. When a provider reaches a permitted limit, the server attempts the next configured provider automatically.

If all configured providers are unavailable, the user receives a generic temporary-service message rather than a raw provider error, key, or stack trace.
