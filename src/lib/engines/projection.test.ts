import { describe, it, expect } from "vitest";
import { projectBalance } from "./projection";

describe("projectBalance", () => {
  it("with zero return and zero contribution, the balance never moves", () => {
    const r = projectBalance({
      startingBalance: 10000,
      monthlyContribution: 0,
      consistencyPct: 100,
      annualReturnPct: 0,
      years: 5,
    });
    expect(r.finalBalance).toBe(10000);
    expect(r.totalContributed).toBe(0);
    expect(r.growth).toBe(0);
  });

  it("with zero return, final balance equals starting balance plus every contribution", () => {
    const r = projectBalance({
      startingBalance: 1000,
      monthlyContribution: 100,
      consistencyPct: 100,
      annualReturnPct: 0,
      years: 1,
    });
    expect(r.finalBalance).toBe(1000 + 100 * 12);
    expect(r.totalContributed).toBe(1200);
    expect(r.growth).toBe(0);
  });

  it("applies the consistency haircut to the contribution before compounding", () => {
    const full = projectBalance({
      startingBalance: 0,
      monthlyContribution: 100,
      consistencyPct: 100,
      annualReturnPct: 0,
      years: 1,
    });
    const half = projectBalance({
      startingBalance: 0,
      monthlyContribution: 100,
      consistencyPct: 50,
      annualReturnPct: 0,
      years: 1,
    });
    expect(half.totalContributed).toBe(full.totalContributed / 2);
  });

  it("produces positive growth with a positive return rate", () => {
    const r = projectBalance({
      startingBalance: 10000,
      monthlyContribution: 200,
      consistencyPct: 100,
      annualReturnPct: 7.5,
      years: 10,
    });
    expect(r.growth).toBeGreaterThan(0);
    expect(r.finalBalance).toBeGreaterThan(10000);
  });

  it("returns one series point per year plus year zero", () => {
    const r = projectBalance({
      startingBalance: 5000,
      monthlyContribution: 100,
      consistencyPct: 85,
      years: 10,
    });
    expect(r.series).toHaveLength(11);
    expect(r.series[0]).toEqual({ year: 0, balance: 5000 });
    expect(r.series[r.series.length - 1].year).toBe(10);
  });

  it("uses the default annual return when none is provided", () => {
    const withDefault = projectBalance({
      startingBalance: 1000,
      monthlyContribution: 50,
      consistencyPct: 100,
      years: 5,
    });
    const withExplicit = projectBalance({
      startingBalance: 1000,
      monthlyContribution: 50,
      consistencyPct: 100,
      annualReturnPct: 7.5,
      years: 5,
    });
    expect(withDefault.finalBalance).toBe(withExplicit.finalBalance);
  });
});
