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

export async function sendPreOrderConfirmation(to: string, firstName: string | null) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set. Add it to your .env file.");
  }
  const greeting = firstName ? `Hey ${firstName},` : "Hey,";

  await getResend().emails.send({
    from,
    to,
    subject: "You're on the list for TrueNorth",
    text: [
      greeting,
      "",
      "You're locked in. We're finishing up checkout on our end — the moment it's live, you'll get an email with a direct link to unlock your account. No charge until then.",
      "",
      "— TrueNorth",
    ].join("\n"),
  });
}

export async function sendPasswordResetEmail(to: string, firstName: string | null, token: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set. Add it to your .env file.");
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const greeting = firstName ? `Hey ${firstName},` : "Hey,";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await getResend().emails.send({
    from,
    to,
    subject: "Reset your TrueNorth password",
    text: [
      greeting,
      "",
      "Someone (hopefully you) asked to reset your TrueNorth password. This link works for one hour:",
      "",
      resetUrl,
      "",
      "If you didn't request this, you can ignore this email — your password won't change.",
      "",
      "— TrueNorth",
    ].join("\n"),
  });
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
