import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";

const schema = z.object({
  name: z.string().min(1).max(80),
  kind: z.enum(["EMERGENCY_FUND", "DEBT_PAYOFF", "SAVINGS", "CUSTOM"]),
  targetAmount: z.number().min(0.01),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasFeature(user, "goals")) {
    return NextResponse.json({ error: "Goals are part of TrueNorth Complete." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { targetDate, ...rest } = parsed.data;
  const goal = await db.goal.create({
    data: { userId: user.id, ...rest, targetDate: targetDate ? new Date(targetDate) : undefined },
  });

  return NextResponse.json({ ok: true, goal });
}
