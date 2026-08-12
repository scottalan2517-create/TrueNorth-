import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";
import { isPlaidConfigured, getPlaidClient } from "@/lib/plaid";
import { encryptToken } from "@/lib/token-encryption";
import { db } from "@/lib/db";

const schema = z.object({
  publicToken: z.string().min(1),
  institutionName: z.string().max(200).optional(),
});

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

  try {
    const plaid = getPlaidClient();
    const exchange = await plaid.itemPublicTokenExchange({ public_token: parsed.data.publicToken });
    const { access_token: accessToken, item_id: itemId } = exchange.data;

    const balances = await plaid.accountsBalanceGet({ access_token: accessToken });

    const plaidItem = await db.plaidItem.create({
      data: {
        userId: user.id,
        itemId,
        accessTokenEncrypted: encryptToken(accessToken),
        institutionName: parsed.data.institutionName,
      },
    });

    await db.linkedAccount.createMany({
      data: balances.data.accounts.map((a) => ({
        plaidItemId: plaidItem.id,
        accountId: a.account_id,
        name: a.name,
        mask: a.mask ?? undefined,
        type: a.type,
        subtype: a.subtype ?? undefined,
        currentBalance: a.balances.current ?? undefined,
        availableBalance: a.balances.available ?? undefined,
      })),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't finish linking that account. Try again." }, { status: 502 });
  }
}
