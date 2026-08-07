import type { PayoffStrategy } from "@/generated/prisma/client";

export interface PayoffDebtInput {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface PayoffScheduleEntry {
  id: string;
  name: string;
  monthsToPayoff: number;
}

export interface PayoffResult {
  monthsToDebtFree: number;
  totalInterestPaid: number;
  order: PayoffScheduleEntry[];
}

const MAX_MONTHS = 480; // 40 years — a safety cap, not a real horizon

export function simulatePayoff(
  debts: PayoffDebtInput[],
  extraMonthly: number,
  strategy: PayoffStrategy,
): PayoffResult {
  const active = debts.filter((d) => d.balance > 0).map((d) => ({ ...d }));
  if (active.length === 0) {
    return { monthsToDebtFree: 0, totalInterestPaid: 0, order: [] };
  }

  const sortKey = (d: PayoffDebtInput) => (strategy === "AVALANCHE" ? -d.apr : d.balance);
  const staticOrder = [...active].sort((a, b) => sortKey(a) - sortKey(b));

  const paidMonth = new Map<string, number>();
  let totalInterest = 0;
  let month = 0;

  while (paidMonth.size < active.length && month < MAX_MONTHS) {
    month++;
    const target = staticOrder.find((d) => !paidMonth.has(d.id));
    const freedMinimums = staticOrder
      .filter((d) => paidMonth.has(d.id))
      .reduce((sum, d) => sum + d.minPayment, 0);
    const extraThisMonth = extraMonthly + freedMinimums;

    for (const debt of active) {
      if (paidMonth.has(debt.id)) continue;
      const interest = (debt.balance * (debt.apr / 100)) / 12;
      debt.balance += interest;
      totalInterest += interest;

      const payment =
        debt.id === target?.id
          ? Math.min(debt.balance, debt.minPayment + extraThisMonth)
          : Math.min(debt.balance, debt.minPayment);
      debt.balance = Math.max(0, debt.balance - payment);

      if (debt.balance < 0.5) paidMonth.set(debt.id, month);
    }
  }

  const order: PayoffScheduleEntry[] = staticOrder.map((d) => ({
    id: d.id,
    name: d.name,
    monthsToPayoff: paidMonth.get(d.id) ?? MAX_MONTHS,
  }));

  return {
    monthsToDebtFree: Math.max(0, ...order.map((o) => o.monthsToPayoff)),
    totalInterestPaid: Math.round(totalInterest),
    order,
  };
}
