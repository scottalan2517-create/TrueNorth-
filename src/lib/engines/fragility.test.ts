import { describe, it, expect } from "vitest";
import { computeFragility, FRAGILITY_STARTER_MONTHS, FRAGILITY_FULL_MONTHS } from "./fragility";

describe("computeFragility", () => {
  it("is FRAGILE with zero cash and real essential spend", () => {
    const r = computeFragility(0, 3000);
    expect(r.months).toBe(0);
    expect(r.band).toBe("FRAGILE");
    expect(r.label).toBe("Fragile");
  });

  it("is STABLE at exactly the starter-month boundary", () => {
    const r = computeFragility(3000, 3000); // exactly 1 month
    expect(r.months).toBe(1);
    expect(r.band).toBe("STABLE");
  });

  it("is FRAGILE just under the starter-month boundary", () => {
    const r = computeFragility(2999, 3000);
    expect(r.band).toBe("FRAGILE");
  });

  it("is STRONG at exactly the full-month boundary", () => {
    const r = computeFragility(9000, 3000); // exactly 3 months
    expect(r.band).toBe("STRONG");
  });

  it("treats zero essential spend with cash on hand as effectively STRONG (capped, not divide-by-zero)", () => {
    const r = computeFragility(5000, 0);
    expect(r.months).toBe(99);
    expect(r.band).toBe("STRONG");
    expect(Number.isFinite(r.months)).toBe(true);
  });

  it("treats zero essential spend and zero cash as FRAGILE, not NaN", () => {
    const r = computeFragility(0, 0);
    expect(r.months).toBe(0);
    expect(r.band).toBe("FRAGILE");
  });

  it("computes dollarsToTarget against the starter target while fragile", () => {
    const r = computeFragility(1000, 2000); // 0.5 months, target is starter (1 month)
    expect(r.targetMonths).toBe(FRAGILITY_STARTER_MONTHS);
    expect(r.dollarsToTarget).toBe(1000); // needs 2000 total, has 1000
  });

  it("computes dollarsToTarget against the full target once stable", () => {
    const r = computeFragility(3000, 3000); // 1 month, stable -> target is full (3 months)
    expect(r.targetMonths).toBe(FRAGILITY_FULL_MONTHS);
    expect(r.dollarsToTarget).toBe(6000); // needs 9000 total, has 3000
  });

  it("never returns a negative dollarsToTarget once past the target", () => {
    const r = computeFragility(50000, 1000);
    expect(r.dollarsToTarget).toBe(0);
    expect(r.monthsToTarget).toBe(0);
  });
});
