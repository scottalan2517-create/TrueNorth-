import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  priorityStage: z.enum(["STABILIZE_AND_ATTACK_DEBT", "SURVIVAL", "PAY_DEBT", "STABILIZE", "INVEST"]),
  note: z.string().min(1).max(280),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const log = await db.moneyDateLog.create({ data: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ ok: true, log });
}
