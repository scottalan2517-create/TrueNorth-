import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  cash: z.number().min(0),
  investments: z.number().min(0),
  retirement: z.number().min(0),
  realEstate: z.number().min(0),
  otherAssets: z.number().min(0),
  creditCardDebt: z.number().min(0),
  studentLoanDebt: z.number().min(0),
  mortgageDebt: z.number().min(0),
  autoLoanDebt: z.number().min(0),
  otherDebt: z.number().min(0),
  note: z.string().max(280).optional(),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const snapshot = await db.netWorthSnapshot.create({
    data: { userId: user.id, ...parsed.data },
  });

  return NextResponse.json({ ok: true, snapshot });
}
