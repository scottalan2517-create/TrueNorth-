import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isEmailConfigured, sendPreOrderConfirmation } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  product: z.enum(["STARTER", "COMPLETE", "PLUS", "PLUS_ANNUAL"]),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`preorder:ip:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await getCurrentUser();

  await db.preOrder.upsert({
    where: { email },
    create: { email, product: parsed.data.product, userId: user?.id },
    update: { product: parsed.data.product, userId: user?.id },
  });

  if (isEmailConfigured()) {
    try {
      await sendPreOrderConfirmation(email, user?.firstName ?? null);
    } catch {
      // Best-effort — the pre-order is already saved either way.
    }
  }

  return NextResponse.json({ ok: true });
}
