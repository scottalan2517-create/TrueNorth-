import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const GENERIC_MESSAGE = "If an account exists for that email, a reset link is on its way.";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`forgot-password:ip:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Password reset email isn't configured yet. Contact support." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  if (!checkRateLimit(`forgot-password:email:${email}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const { token, tokenHash } = generateResetToken();
    await db.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    await sendPasswordResetEmail(user.email, user.firstName, token);
  }

  // Same response whether the account exists or not — don't leak which
  // emails are registered.
  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
