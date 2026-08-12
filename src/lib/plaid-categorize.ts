// Deliberately coarse: Plaid's "depository" type (checking/savings/money
// market) maps to cash; "investment" (brokerage, IRA, 401k alike) maps to
// investments. We don't try to split investment accounts into
// investments-vs-retirement — Plaid's subtypes for that are numerous and
// getting it wrong would misinform the Fragility Score, which depends on
// liquid cash specifically. Both buckets already feed the same
// "investable" total everywhere else in the app (see playground/page.tsx),
// so lumping retirement in with investments here is safe, not just
// convenient.
export function summarizeLinkedBalances(
  accounts: { type: string; currentBalance: number | null }[],
): { cash: number; investments: number } {
  let cash = 0;
  let investments = 0;
  for (const a of accounts) {
    const balance = a.currentBalance ?? 0;
    if (a.type === "depository") cash += balance;
    else if (a.type === "investment") investments += balance;
  }
  return { cash: Math.round(cash), investments: Math.round(investments) };
}
