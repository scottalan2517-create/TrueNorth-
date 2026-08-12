import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";
import { isPlaidConfigured, getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/token-encryption";
import { db } from "@/lib/db";

export async function POST() {
  const user = await requireUser();
  if (!hasFeature(user, "bank_linking")) {
    return NextResponse.json({ error: "Bank sync is part of TrueNorth Plus." }, { status: 403 });
  }
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync isn't configured yet." }, { status: 501 });
  }

  const items = await db.plaidItem.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });

  const plaid = getPlaidClient();

  for (const item of items) {
    try {
      const accessToken = decryptToken(item.accessTokenEncrypted);
      const balances = await plaid.accountsBalanceGet({ access_token: accessToken });

      await Promise.all(
        balances.data.accounts.map((a) =>
          db.linkedAccount.updateMany({
            where: { accountId: a.account_id },
            data: {
              currentBalance: a.balances.current ?? undefined,
              availableBalance: a.balances.available ?? undefined,
              syncedAt: new Date(),
            },
          }),
        ),
      );
    } catch {
      await db.plaidItem.update({ where: { id: item.id }, data: { status: "ERROR" } });
    }
  }

  return NextResponse.json({ ok: true });
}
