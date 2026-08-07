import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, verifyPassword, clearSessionCookie } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const schema = z.object({ password: z.string().min(1) });

export async function DELETE(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your password to confirm." }, { status: 400 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Password is incorrect." }, { status: 401 });
  }

  if (user.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
    } catch {
      // Subscription may already be canceled — deletion should proceed regardless.
    }
  }

  // Cascades to every child table (net worth, debts, budget, goals, money
  // dates, linked bank accounts) via onDelete: Cascade in the schema.
  await db.user.delete({ where: { id: user.id } });
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
