import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";

const schema = z.object({
  name: z.string().min(1).max(60),
  group: z.enum(["ESSENTIALS", "LIFESTYLE", "SAVINGS_AND_DEBT"]),
  monthlyPlanned: z.number().min(0),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasFeature(user, "budget")) {
    return NextResponse.json({ error: "Budgeting is part of TrueNorth Complete." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const count = await db.budgetCategory.count({ where: { userId: user.id } });
  const category = await db.budgetCategory.create({
    data: { userId: user.id, sortOrder: count, ...parsed.data },
  });

  return NextResponse.json({ ok: true, category });
}
