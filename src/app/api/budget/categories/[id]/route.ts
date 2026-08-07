import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(60).optional(),
  monthlyPlanned: z.number().min(0).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const category = await db.budgetCategory.findUnique({ where: { id } });
  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const updated = await db.budgetCategory.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, category: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const category = await db.budgetCategory.findUnique({ where: { id } });
  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await db.budgetCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
