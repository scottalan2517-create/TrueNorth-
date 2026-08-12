import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";
import { isPlaidConfigured, getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/token-encryption";
import { db } from "@/lib/db";

const schema = z.object({ plaidItemId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasFeature(user, "bank_linking")) {
    return NextResponse.json({ error: "Bank sync is part of TrueNorth Plus." }, { status: 403 });
  }
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync isn't configured yet." }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Scoped to userId so one user can never disconnect another's item.
  const item = await db.plaidItem.findFirst({
    where: { id: parsed.data.plaidItemId, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const plaid = getPlaidClient();
    await plaid.itemRemove({ access_token: decryptToken(item.accessTokenEncrypted) });
  } catch {
    // Item may already be revoked on Plaid's side — still clear it locally.
  }

  await db.plaidItem.delete({ where: { id: item.id } });

  return NextResponse.json({ ok: true });
}
