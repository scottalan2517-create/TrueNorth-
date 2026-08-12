import { describe, it, expect } from "vitest";
import { simulatePayoff, type PayoffDebtInput } from "./payoff";

describe("simulatePayoff", () => {
  it("returns zero months and zero interest with no debts", () => {
    const r = simulatePayoff([], 500, "AVALANCHE");
    expect(r.monthsToDebtFree).toBe(0);
    expect(r.totalInterestPaid).toBe(0);
    expect(r.order).toHaveLength(0);
  });

  it("pays off a single zero-interest debt in one month when extra covers the balance", () => {
    const debts: PayoffDebtInput[] = [{ id: "1", name: "Card", balance: 500, apr: 0, minPayment: 25 }];
    const r = simulatePayoff(debts, 500, "AVALANCHE");
    expect(r.monthsToDebtFree).toBe(1);
    expect(r.totalInterestPaid).toBe(0);
  });

  it("AVALANCHE orders debts by highest APR first, regardless of balance", () => {
    const debts: PayoffDebtInput[] = [
      { id: "1", name: "Big low-rate loan", balance: 10000, apr: 5, minPayment: 100 },
      { id: "2", name: "Small high-rate card", balance: 500, apr: 25, minPayment: 25 },
    ];
    const r = simulatePayoff(debts, 200, "AVALANCHE");
    expect(r.order[0].name).toBe("Small high-rate card");
  });

  it("SNOWBALL orders debts by smallest balance first, regardless of APR", () => {
    const debts: PayoffDebtInput[] = [
      { id: "1", name: "Big low-rate loan", balance: 10000, apr: 5, minPayment: 100 },
      { id: "2", name: "Small high-rate card", balance: 500, apr: 25, minPayment: 25 },
    ];
    const r = simulatePayoff(debts, 200, "SNOWBALL");
    expect(r.order[0].name).toBe("Small high-rate card"); // also smallest balance here
    const debts2: PayoffDebtInput[] = [
      { id: "1", name: "Small low-rate loan", balance: 500, apr: 5, minPayment: 25 },
      { id: "2", name: "Big high-rate card", balance: 10000, apr: 25, minPayment: 100 },
    ];
    const r2 = simulatePayoff(debts2, 200, "SNOWBALL");
    expect(r2.order[0].name).toBe("Small low-rate loan");
  });

  it("more extra monthly payment never increases months to debt-free", () => {
    const debts: PayoffDebtInput[] = [{ id: "1", name: "Card", balance: 5000, apr: 20, minPayment: 100 }];
    const slow = simulatePayoff(debts, 50, "AVALANCHE");
    const fast = simulatePayoff(debts, 500, "AVALANCHE");
    expect(fast.monthsToDebtFree).toBeLessThanOrEqual(slow.monthsToDebtFree);
  });

  it("monthsToDebtFree is the max across all individual debt payoff times", () => {
    const debts: PayoffDebtInput[] = [
      { id: "1", name: "A", balance: 1000, apr: 10, minPayment: 50 },
      { id: "2", name: "B", balance: 3000, apr: 10, minPayment: 50 },
    ];
    const r = simulatePayoff(debts, 100, "AVALANCHE");
    const maxIndividual = Math.max(...r.order.map((o) => o.monthsToPayoff));
    expect(r.monthsToDebtFree).toBe(maxIndividual);
  });

  it("caps at 480 months instead of looping forever when payments barely cover interest", () => {
    const debts: PayoffDebtInput[] = [{ id: "1", name: "Barely serviced", balance: 100000, apr: 30, minPayment: 1 }];
    const r = simulatePayoff(debts, 0, "AVALANCHE");
    expect(r.monthsToDebtFree).toBe(480);
  });
});
