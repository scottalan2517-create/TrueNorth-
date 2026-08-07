import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  categoryId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().min(0),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const category = await db.budgetCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const actual = await db.budgetActual.upsert({
    where: { categoryId_month: { categoryId: parsed.data.categoryId, month: parsed.data.month } },
    create: parsed.data,
    update: { amount: parsed.data.amount },
  });

  return NextResponse.json({ ok: true, actual });
}
