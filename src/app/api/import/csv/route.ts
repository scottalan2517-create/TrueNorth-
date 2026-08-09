import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/tiers";
import { parseNetWorthCsv } from "@/lib/csv-import";

const MAX_FILE_BYTES = 1_000_000;

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasFeature(user, "csv_import")) {
    return NextResponse.json({ error: "CSV import is part of TrueNorth Complete." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (1MB max)." }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors } = parseNetWorthCsv(text);

  if (rows.length > 0) {
    await db.netWorthSnapshot.createMany({
      data: rows.map((r) => ({ userId: user.id, ...r })),
    });
  }

  return NextResponse.json({ ok: true, imported: rows.length, errors });
}
