import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  currentAmount: z.number().min(0).optional(),
  targetAmount: z.number().min(0.01).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const goal = await db.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const updated = await db.goal.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, goal: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const goal = await db.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await db.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
