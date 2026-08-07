import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["CREDIT_CARD", "STUDENT_LOAN", "AUTO_LOAN", "MORTGAGE", "PERSONAL_LOAN", "OTHER"]),
  balance: z.number().min(0),
  apr: z.number().min(0).max(100),
  minPayment: z.number().min(0),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const count = await db.debtAccount.count({ where: { userId: user.id } });
  const debt = await db.debtAccount.create({
    data: { userId: user.id, sortOrder: count, ...parsed.data },
  });

  return NextResponse.json({ ok: true, debt });
}
