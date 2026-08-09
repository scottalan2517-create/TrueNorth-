import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isEmailConfigured, sendMoneyDateReminder } from "@/lib/email";

const DAYS_UNTIL_DUE = 28;

// Triggered by an external scheduler (Railway Cron Schedule, or any pinger)
// hitting this URL on a daily cadence — see README for setup. Protected by
// a shared secret rather than auth, since there's no logged-in user making
// the request.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 501 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email isn't configured yet." }, { status: 501 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const candidates = await db.user.findMany({
    where: {
      plusActive: true,
      onboardedAt: { not: null },
      OR: [{ moneyDateReminderSentAt: null }, { moneyDateReminderSentAt: { lt: startOfMonth } }],
    },
    select: { id: true, email: true, firstName: true, onboardedAt: true },
  });

  let sent = 0;
  for (const user of candidates) {
    const lastLog = await db.moneyDateLog.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    const since = lastLog?.date ?? user.onboardedAt!;
    const daysSince = Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince < DAYS_UNTIL_DUE) continue;

    try {
      await sendMoneyDateReminder(user.email, user.firstName);
      await db.user.update({ where: { id: user.id }, data: { moneyDateReminderSentAt: new Date() } });
      sent++;
    } catch {
      // One bad send (invalid address, provider hiccup) shouldn't stop the rest of the batch.
    }
  }

  return NextResponse.json({ checked: candidates.length, sent });
}
