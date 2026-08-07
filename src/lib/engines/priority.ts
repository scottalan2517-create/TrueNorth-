import { computeFragility, FRAGILITY_STARTER_MONTHS, FRAGILITY_FULL_MONTHS } from "./fragility";

// Engine 02 — Priority Engine.
// A decision tree that puts you in exactly one bucket. Every bucket has a
// clear next move. Order, in ascending order of financial health:
//   Stabilize & Attack Debt -> Survival -> Pay Debt -> Stabilize -> Invest

export type PriorityStage =
  | "STABILIZE_AND_ATTACK_DEBT"
  | "SURVIVAL"
  | "PAY_DEBT"
  | "STABILIZE"
  | "INVEST";

export interface PriorityResult {
  stage: PriorityStage;
  title: string;
  reason: string;
  nextMove: string;
  severity: "red" | "amber" | "green";
}

const STAGE_COPY: Record<PriorityStage, Omit<PriorityResult, "stage">> = {
  STABILIZE_AND_ATTACK_DEBT: {
    title: "Stabilize & Attack Debt",
    reason: "No safety net, and high-interest debt is compounding against you.",
    nextMove: "Split every extra dollar between a starter buffer and your highest-interest balance.",
    severity: "red",
  },
  SURVIVAL: {
    title: "Survival — Build Buffer",
    reason: "No safety net. One surprise expense away from a setback.",
    nextMove: `Direct all surplus to cash until you clear ${FRAGILITY_STARTER_MONTHS} month of essentials.`,
    severity: "red",
  },
  PAY_DEBT: {
    title: "Pay Debt",
    reason: "You have a starter buffer, but high-interest debt is still costing you.",
    nextMove: "Send every extra dollar to your highest-interest balance.",
    severity: "amber",
  },
  STABILIZE: {
    title: "Stabilize",
    reason: "Debt is under control. Your buffer isn't full-strength yet.",
    nextMove: `Keep building cash until you reach ${FRAGILITY_FULL_MONTHS} months of essentials.`,
    severity: "amber",
  },
  INVEST: {
    title: "Invest",
    reason: "Buffer is strong and no high-interest debt is working against you.",
    nextMove: "Put your surplus to work — investing, goals, or accelerating low-interest debt.",
    severity: "green",
  },
};

export interface PriorityInput {
  liquidCash: number;
  monthlyEssentialSpend: number;
  hasHighInterestDebt: boolean;
}

export function computePriority({
  liquidCash,
  monthlyEssentialSpend,
  hasHighInterestDebt,
}: PriorityInput): PriorityResult {
  const { months } = computeFragility(liquidCash, monthlyEssentialSpend);

  let stage: PriorityStage;
  if (months < FRAGILITY_STARTER_MONTHS) {
    stage = hasHighInterestDebt ? "STABILIZE_AND_ATTACK_DEBT" : "SURVIVAL";
  } else if (hasHighInterestDebt) {
    stage = "PAY_DEBT";
  } else if (months < FRAGILITY_FULL_MONTHS) {
    stage = "STABILIZE";
  } else {
    stage = "INVEST";
  }

  return { stage, ...STAGE_COPY[stage] };
}

export const PRIORITY_STAGE_ORDER: PriorityStage[] = [
  "STABILIZE_AND_ATTACK_DEBT",
  "SURVIVAL",
  "PAY_DEBT",
  "STABILIZE",
  "INVEST",
];
