# Going live checklist

Everything below is Railway environment variables and dashboard clicks —
no code changes needed. The app already handles each of these being unset
by degrading gracefully (buttons show a clear "not configured yet" message
instead of erroring), so you can do these in any order, one at a time.

Set variables on the `TrueNorth-` service in Railway → Variables tab.

## 1. Custom domain

- Buy a domain, then in Railway: your app service → Settings → Networking
  → Custom Domain. Point your DNS as Railway instructs.
- Set `NEXT_PUBLIC_APP_URL` to the real public URL (custom domain once you
  have one, otherwise the `*.up.railway.app` URL in the meantime). This
  feeds Stripe checkout redirects and every link in outgoing emails.

## 2. Stripe (required to actually take payments)

Create four Price objects in the Stripe dashboard matching the real
pricing in `src/lib/tiers.ts`:

| Product | Price | Type |
| --- | --- | --- |
| Starter | $49 | one-time |
| Complete | $129 | one-time |
| Plus (monthly) | $19/mo | recurring |
| Plus (annual) | $190/yr | recurring |

Then set:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` — from a webhook endpoint pointed at
  `<your domain>/api/stripe/webhook`, listening for
  `checkout.session.completed` and `customer.subscription.deleted`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_COMPLETE`, `STRIPE_PRICE_PLUS`,
  `STRIPE_PRICE_PLUS_ANNUAL` — the four Price IDs above

## 3. Resend (email — powers password reset AND Money Date reminders)

- Sign up at resend.com, verify a sending domain.
- Set `RESEND_API_KEY` and `EMAIL_FROM` (must be on the verified domain).
- Without this, "Forgot password?" shows a clean "not configured yet"
  error instead of sending anything — so this one matters early, not just
  for the Plus reminder feature.

## 4. Cron secret (optional — only for the monthly reminder email)

- Set `CRON_SECRET` (generate like `SESSION_SECRET`, see `.env.example`).
- Point Railway's Cron Schedule (or a free external pinger like
  cron-job.org) at `<your domain>/api/cron/money-date-reminders` once a
  day, with header `Authorization: Bearer <CRON_SECRET>`.

## Pre-orders collected before Stripe is live

Until Stripe's price IDs are set (step 2), every checkout button falls
back to a pre-order capture instead of a dead end — email + which tier
they wanted, saved to a `PreOrder` table. To see who's on the list, run
in the same Postgres → Data → Query box:

```sql
SELECT email, product, "createdAt" FROM "PreOrder" ORDER BY "createdAt" DESC;
```

Once Stripe is configured, checkout starts working normally again for
new clicks — but people already captured in `PreOrder` won't automatically
get charged or unlocked. Either email them a signup/checkout link, or
comp them directly with the same `UPDATE "User"` query below if that's
the plan (e.g. an early-bird deal for pre-orderers).

## Comping free accounts (friends, reviewers)

No promo-code system exists — this is a manual DB update. Full steps
in-repo aren't written down elsewhere, so noting here: have the friend
sign up normally at `/signup`, then in Railway → Postgres service → Data
tab → Query box, run:

```sql
UPDATE "User"
SET tier = 'COMPLETE', "tierPurchasedAt" = NOW(), "plusActive" = true
WHERE email = 'friend@example.com';
```
