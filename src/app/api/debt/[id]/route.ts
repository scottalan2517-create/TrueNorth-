import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  balance: z.number().min(0).optional(),
  apr: z.number().min(0).max(100).optional(),
  minPayment: z.number().min(0).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const debt = await db.debtAccount.findUnique({ where: { id } });
  if (!debt || debt.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const data = { ...parsed.data, paidOffAt: parsed.data.balance === 0 ? new Date() : undefined };
  const updated = await db.debtAccount.update({ where: { id }, data });
  return NextResponse.json({ ok: true, debt: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const debt = await db.debtAccount.findUnique({ where: { id } });
  if (!debt || debt.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await db.debtAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
