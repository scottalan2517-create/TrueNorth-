import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";
import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";
import { isPlaidConfigured, getPlaidClient } from "@/lib/plaid";

export async function POST() {
  const user = await requireUser();
  if (!hasFeature(user, "bank_linking")) {
    return NextResponse.json({ error: "Bank sync is part of TrueNorth Plus." }, { status: 403 });
  }
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync isn't configured yet." }, { status: 501 });
  }

  try {
    const plaid = getPlaidClient();
    const response = await plaid.linkTokenCreate({
      client_name: "TrueNorth",
      language: "en",
      country_codes: [CountryCode.Us],
      user: { client_user_id: user.id },
      products: [Products.Balance],
    });
    return NextResponse.json({ linkToken: response.data.link_token });
  } catch {
    return NextResponse.json({ error: "Couldn't start bank sync right now. Try again shortly." }, { status: 502 });
  }
}
