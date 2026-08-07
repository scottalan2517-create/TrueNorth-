import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  monthlyTakeHomeIncome: z.number().min(0).optional(),
  monthlyEssentialSpend: z.number().min(0).optional(),
  highInterestAprCutoff: z.number().min(0).max(100).optional(),
  defaultConsistencyPct: z.number().min(0).max(100).optional(),
  payoffStrategy: z.enum(["AVALANCHE", "SNOWBALL"]).optional(),
});

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const profile = await db.financialProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true, profile });
}
