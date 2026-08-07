import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const product = session.metadata?.product;
      if (!userId || !product) break;

      if (product === "PLUS") {
        await db.user.update({
          where: { id: userId },
          data: {
            plusActive: true,
            plusRenewsAt: null,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          },
        });
      } else {
        await db.user.update({
          where: { id: userId },
          data: { tier: product as "STARTER" | "COMPLETE", tierPurchasedAt: new Date() },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await db.user.findFirst({ where: { stripeSubscriptionId: subscription.id } });
      if (user) {
        await db.user.update({ where: { id: user.id }, data: { plusActive: false } });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
