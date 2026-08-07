// Engine 04 — Fragility Score.
// One number: how many months of essential spending your liquid cash
// would cover if income stopped today. Fragile -> Stable -> Strong.

export type FragilityBand = "FRAGILE" | "STABLE" | "STRONG";

export const FRAGILITY_STARTER_MONTHS = 1; // a starter buffer exists once you clear this
export const FRAGILITY_FULL_MONTHS = 3; // "Strong" — a real emergency fund

export interface FragilityResult {
  months: number;
  band: FragilityBand;
  label: string;
  targetMonths: number;
  monthsToTarget: number;
  dollarsToTarget: number;
}

export function computeFragility(
  liquidCash: number,
  monthlyEssentialSpend: number,
): FragilityResult {
  const months =
    monthlyEssentialSpend > 0 ? liquidCash / monthlyEssentialSpend : liquidCash > 0 ? 99 : 0;

  const band: FragilityBand =
    months < FRAGILITY_STARTER_MONTHS
      ? "FRAGILE"
      : months < FRAGILITY_FULL_MONTHS
        ? "STABLE"
        : "STRONG";

  const label =
    band === "FRAGILE" ? "Fragile" : band === "STABLE" ? "Stable" : "Strong";

  const targetMonths = band === "FRAGILE" ? FRAGILITY_STARTER_MONTHS : FRAGILITY_FULL_MONTHS;
  const monthsToTarget = Math.max(0, targetMonths - months);
  const dollarsToTarget = Math.max(0, targetMonths * monthlyEssentialSpend - liquidCash);

  return { months, band, label, targetMonths, monthsToTarget, dollarsToTarget };
}
