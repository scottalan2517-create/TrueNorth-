# TrueNorth

Your financial decision engine. A standalone product under Chosen Man HQ —
independent from FinalCoat HQ, its own database, its own deploy.

Not a tracker. Every screen answers one question: what should I do with my
next dollar? Four engines power that: the Priority Engine (which of five
stages you're in), the Fragility Score (emergency-fund health), the Action
Panel (dollar-by-dollar allocation), and the Projection Engine (a realistic,
consistency-adjusted compound-interest forecast).

## Running it locally

```bash
npm install                # installs dependencies and generates the Prisma client
cp .env.example .env       # then edit .env — see below
npm run db:migrate         # applies the schema to your database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete the
onboarding flow, then set a `tier` on your user row (`STARTER` or
`COMPLETE`) directly in the database until Stripe checkout is configured —
see below.

## Environment variables (`.env`)

| Variable | What it's for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `SESSION_SECRET` | Random string used to sign session cookies. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `STRIPE_SECRET_KEY` | Stripe secret key (test or live). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe/webhook` endpoint. |
| `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_COMPLETE` / `STRIPE_PRICE_PLUS` | Stripe Price IDs for the three products. Starter/Complete are one-time payment prices; Plus is a recurring monthly price. |
| `NEXT_PUBLIC_APP_URL` | Base URL used for Stripe checkout success/cancel redirects. |

Until the Stripe env vars are set, checkout buttons fail gracefully with an
explanatory message instead of crashing.

## Tiers

- **Starter ($49 one-time)** — all four engines, net worth tracking, debt
  payoff planner, Money Date ritual.
- **Complete ($129 one-time)** — everything in Starter, plus budgeting,
  goals, full Money Date history, and CSV export.
- **Plus ($19/mo add-on)** — requires Starter or Complete. Money Date
  reminders and a changelog feed, wired for future use.

Feature gating lives in `src/lib/tiers.ts`.

## The four engines

Pure functions in `src/lib/engines/` — no framework dependency, directly
testable:

- `priority.ts` — the five-stage decision tree
- `fragility.ts` — emergency-fund coverage in months
- `action.ts` — monthly dollar allocation
- `projection.ts` — compound growth with a consistency haircut
- `payoff.ts` — avalanche/snowball debt payoff simulation

## Tech stack

Next.js (App Router) + TypeScript, Prisma + Postgres, Tailwind CSS v4,
email/password auth with a signed session cookie (no third-party auth
dependency), Stripe for payments. Deploys to Railway as its own service.
