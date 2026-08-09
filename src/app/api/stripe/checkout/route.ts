import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const schema = z.object({ product: z.enum(["STARTER", "COMPLETE", "PLUS", "PLUS_ANNUAL"]) });

const PRICE_ENV: Record<string, string | undefined> = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  COMPLETE: process.env.STRIPE_PRICE_COMPLETE,
  PLUS: process.env.STRIPE_PRICE_PLUS,
  PLUS_ANNUAL: process.env.STRIPE_PRICE_PLUS_ANNUAL,
};

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const priceId = PRICE_ENV[parsed.data.product];
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe isn't configured for this product yet. Set the price ID in your environment." },
      { status: 501 },
    );
  }

  const stripe = getStripe();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    mode: parsed.data.product === "PLUS" || parsed.data.product === "PLUS_ANNUAL" ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id, product: parsed.data.product },
    success_url: `${appUrl}/settings?upgraded=1`,
    cancel_url: `${appUrl}/settings/upgrade`,
  });

  return NextResponse.json({ url: session.url });
}
