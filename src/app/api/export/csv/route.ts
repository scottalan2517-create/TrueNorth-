import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/tiers";

export async function GET() {
  const user = await requireUser();
  if (!hasFeature(user, "csv_export")) {
    return NextResponse.json({ error: "CSV export is part of TrueNorth Complete." }, { status: 403 });
  }

  const snapshots = await db.netWorthSnapshot.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const header = [
    "date", "cash", "investments", "retirement", "realEstate", "otherAssets",
    "creditCardDebt", "studentLoanDebt", "mortgageDebt", "autoLoanDebt", "otherDebt", "note",
  ];
  const rows = snapshots.map((s) =>
    [
      s.date.toISOString().slice(0, 10),
      s.cash, s.investments, s.retirement, s.realEstate, s.otherAssets,
      s.creditCardDebt, s.studentLoanDebt, s.mortgageDebt, s.autoLoanDebt, s.otherDebt,
      JSON.stringify(s.note ?? ""),
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=truenorth-net-worth.csv",
    },
  });
}
