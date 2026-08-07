// Engine 01 — Projection Engine.
// Compound interest with a reality check: a "consistency factor" haircuts
// the contribution to account for months you don't hit the target.

export const DEFAULT_ANNUAL_RETURN_PCT = 7.5;

export interface ProjectionInput {
  startingBalance: number;
  monthlyContribution: number;
  consistencyPct: number; // 0-100
  annualReturnPct?: number;
  years: number;
}

export interface ProjectionPoint {
  year: number;
  balance: number;
}

export interface ProjectionResult {
  finalBalance: number;
  totalContributed: number;
  growth: number;
  series: ProjectionPoint[];
}

export function projectBalance({
  startingBalance,
  monthlyContribution,
  consistencyPct,
  annualReturnPct = DEFAULT_ANNUAL_RETURN_PCT,
  years,
}: ProjectionInput): ProjectionResult {
  const effectiveContribution = monthlyContribution * (consistencyPct / 100);
  const monthlyRate = annualReturnPct / 100 / 12;
  const totalMonths = years * 12;

  const series: ProjectionPoint[] = [{ year: 0, balance: round2(startingBalance) }];

  let balance = startingBalance;
  let contributed = 0;
  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + effectiveContribution;
    contributed += effectiveContribution;
    if (month % 12 === 0) {
      series.push({ year: month / 12, balance: round2(balance) });
    }
  }

  return {
    finalBalance: round2(balance),
    totalContributed: round2(contributed),
    growth: round2(balance - startingBalance - contributed),
    series,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
