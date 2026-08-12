import { describe, it, expect } from "vitest";
import { computePriority } from "./priority";

describe("computePriority", () => {
  it("is STABILIZE_AND_ATTACK_DEBT below the starter buffer with high-interest debt", () => {
    const r = computePriority({ liquidCash: 0, monthlyEssentialSpend: 3000, hasHighInterestDebt: true });
    expect(r.stage).toBe("STABILIZE_AND_ATTACK_DEBT");
    expect(r.severity).toBe("red");
  });

  it("is SURVIVAL below the starter buffer with no high-interest debt", () => {
    const r = computePriority({ liquidCash: 0, monthlyEssentialSpend: 3000, hasHighInterestDebt: false });
    expect(r.stage).toBe("SURVIVAL");
    expect(r.severity).toBe("red");
  });

  it("prioritizes debt over buffer strength once the starter buffer exists", () => {
    // 2 months covered (past starter, short of full) but still has high-interest debt —
    // debt takes priority over further buffer-building.
    const r = computePriority({ liquidCash: 6000, monthlyEssentialSpend: 3000, hasHighInterestDebt: true });
    expect(r.stage).toBe("PAY_DEBT");
    expect(r.severity).toBe("amber");
  });

  it("stays on PAY_DEBT even with a full emergency fund, as long as high-interest debt remains", () => {
    const r = computePriority({ liquidCash: 20000, monthlyEssentialSpend: 3000, hasHighInterestDebt: true });
    expect(r.stage).toBe("PAY_DEBT");
  });

  it("is STABILIZE between the starter and full buffer with no high-interest debt", () => {
    const r = computePriority({ liquidCash: 6000, monthlyEssentialSpend: 3000, hasHighInterestDebt: false });
    expect(r.stage).toBe("STABILIZE");
    expect(r.severity).toBe("amber");
  });

  it("is INVEST once the buffer is full and no high-interest debt remains", () => {
    const r = computePriority({ liquidCash: 9000, monthlyEssentialSpend: 3000, hasHighInterestDebt: false });
    expect(r.stage).toBe("INVEST");
    expect(r.severity).toBe("green");
  });

  it("always returns a nextMove and reason for every stage", () => {
    const cases = [
      { liquidCash: 0, monthlyEssentialSpend: 3000, hasHighInterestDebt: true },
      { liquidCash: 0, monthlyEssentialSpend: 3000, hasHighInterestDebt: false },
      { liquidCash: 6000, monthlyEssentialSpend: 3000, hasHighInterestDebt: true },
      { liquidCash: 6000, monthlyEssentialSpend: 3000, hasHighInterestDebt: false },
      { liquidCash: 9000, monthlyEssentialSpend: 3000, hasHighInterestDebt: false },
    ];
    for (const input of cases) {
      const r = computePriority(input);
      expect(r.nextMove.length).toBeGreaterThan(0);
      expect(r.reason.length).toBeGreaterThan(0);
    }
  });
});
