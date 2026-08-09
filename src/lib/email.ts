import { Resend } from "resend";

const globalForResend = globalThis as unknown as { resend?: Resend };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResend(): Resend {
  if (globalForResend.resend) return globalForResend.resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set. Add it to your .env file.");
  }
  const client = new Resend(key);
  if (process.env.NODE_ENV !== "production") {
    globalForResend.resend = client;
  }
  return client;
}

export async function sendMoneyDateReminder(to: string, firstName: string | null) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set. Add it to your .env file.");
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const greeting = firstName ? `Hey ${firstName},` : "Hey,";

  await getResend().emails.send({
    from,
    to,
    subject: "Your Money Date is due",
    text: [
      greeting,
      "",
      "Fifteen minutes, once a month — that's the whole deal. Refresh your numbers, check your priority, log one sentence.",
      "",
      `${appUrl}/money-date`,
      "",
      "— TrueNorth",
    ].join("\n"),
  });
}
