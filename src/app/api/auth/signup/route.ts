import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// The 25 most common passwords in breach corpora — not exhaustive, just
// enough to stop the laziest accounts on a product that holds real
// financial data.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890",
  "qwertyui", "qwerty123", "letmein1", "welcome1", "admin1234", "iloveyou1",
  "abc123456", "monkey123", "dragon123", "sunshine1", "princess1", "football1",
  "baseball1", "trustno1", "superman1", "master123", "hello1234", "freedom1",
  "whatever1",
]);

const schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), "That password is too common. Try another."),
  firstName: z.string().trim().min(1).max(60).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`signup:ip:${ip}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many accounts created from this connection. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: { email, passwordHash, firstName: parsed.data.firstName },
  });

  await createSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
