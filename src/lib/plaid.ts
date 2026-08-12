import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const globalForPlaid = globalThis as unknown as { plaid?: PlaidApi };

export function isPlaidConfigured(): boolean {
  return Boolean(
    process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET && process.env.PLAID_TOKEN_ENCRYPTION_KEY,
  );
}

export function getPlaidClient(): PlaidApi {
  if (globalForPlaid.plaid) return globalForPlaid.plaid;

  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error("PLAID_CLIENT_ID / PLAID_SECRET are not set. Add them to your .env file.");
  }
  const env = process.env.PLAID_ENV ?? "sandbox";

  const configuration = new Configuration({
    basePath: PlaidEnvironments[env as keyof typeof PlaidEnvironments] ?? PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  const client = new PlaidApi(configuration);
  if (process.env.NODE_ENV !== "production") {
    globalForPlaid.plaid = client;
  }
  return client;
}
