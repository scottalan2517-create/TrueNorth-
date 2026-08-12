import { describe, it, expect } from "vitest";
import { computeActionPlan, type ActionDebt } from "./action";

const debts: ActionDebt[] = [
  { id: "1", name: "Card A", balance: 5000, apr: 22 },
  { id: "2", name: "Card B", balance: 1000, apr: 12 },
];

describe("computeActionPlan", () => {
  it("returns a single zero-amount item when there's no surplus", () => {
    const items = computeActionPlan({
      monthlySurplus: 0,
      stage: "INVEST",
      debts: [],
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(0);
  });

  it("clamps a negative surplus to zero rather than allocating a negative amount", () => {
    const items = computeActionPlan({
      monthlySurplus: -200,
      stage: "INVEST",
      debts: [],
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items[0].amount).toBe(0);
  });

  it("STABILIZE_AND_ATTACK_DEBT splits surplus between buffer and highest-interest debt, summing to the full surplus", () => {
    const items = computeActionPlan({
      monthlySurplus: 1000,
      stage: "STABILIZE_AND_ATTACK_DEBT",
      debts,
      fragilityDollarsToTarget: 3000,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items).toHaveLength(2);
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    expect(total).toBe(1000);
    expect(items[1].label).toContain("Card A"); // highest APR
  });

  it("STABILIZE_AND_ATTACK_DEBT puts the entire surplus toward the buffer when there's no high-interest debt", () => {
    const items = computeActionPlan({
      monthlySurplus: 1000,
      stage: "STABILIZE_AND_ATTACK_DEBT",
      debts: [{ id: "1", name: "Low APR loan", balance: 5000, apr: 4 }],
      fragilityDollarsToTarget: 3000,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(1000);
  });

  it("SURVIVAL sends the full surplus to the emergency fund", () => {
    const items = computeActionPlan({
      monthlySurplus: 800,
      stage: "SURVIVAL",
      debts: [],
      fragilityDollarsToTarget: 5000,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items[0].amount).toBe(800);
  });

  it("PAY_DEBT with AVALANCHE targets the highest APR balance", () => {
    const items = computeActionPlan({
      monthlySurplus: 500,
      stage: "PAY_DEBT",
      debts,
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items[0].label).toContain("Card A");
    expect(items[0].amount).toBe(500);
  });

  it("PAY_DEBT with SNOWBALL targets the smallest balance", () => {
    const items = computeActionPlan({
      monthlySurplus: 500,
      stage: "PAY_DEBT",
      debts,
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "SNOWBALL",
    });
    expect(items[0].label).toContain("Card B");
  });

  it("PAY_DEBT with no debts on file falls back to investing the surplus", () => {
    const items = computeActionPlan({
      monthlySurplus: 500,
      stage: "PAY_DEBT",
      debts: [],
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items[0].label).toBe("Invest the surplus");
  });

  it("INVEST with a top goal splits surplus, summing to the full amount", () => {
    const items = computeActionPlan({
      monthlySurplus: 1000,
      stage: "INVEST",
      debts: [],
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
      topGoal: { id: "g1", name: "House down payment", remaining: 20000 },
    });
    expect(items).toHaveLength(2);
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    expect(total).toBe(1000);
  });

  it("INVEST with no goal sends the full surplus to investing", () => {
    const items = computeActionPlan({
      monthlySurplus: 1000,
      stage: "INVEST",
      debts: [],
      fragilityDollarsToTarget: 0,
      highInterestAprCutoff: 15,
      payoffStrategy: "AVALANCHE",
    });
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(1000);
  });
});
