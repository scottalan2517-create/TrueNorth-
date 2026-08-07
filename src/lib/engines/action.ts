import type { PriorityStage } from "./priority";
import type { PayoffStrategy } from "@/generated/prisma/client";

// Engine 03 — Action Panel.
// Reads your surplus and priority, then allocates every dollar. No
// guesswork — just "put $X here."

export interface ActionDebt {
  id: string;
  name: string;
  balance: number;
  apr: number;
}

export interface ActionGoal {
  id: string;
  name: string;
  remaining: number;
}

export interface ActionItem {
  label: string;
  amount: number;
  detail: string;
}

export interface ActionInput {
  monthlySurplus: number;
  stage: PriorityStage;
  debts: ActionDebt[];
  fragilityDollarsToTarget: number;
  highInterestAprCutoff: number;
  payoffStrategy: PayoffStrategy;
  topGoal?: ActionGoal;
}

function pickTargetDebt(debts: ActionDebt[], strategy: PayoffStrategy): ActionDebt | undefined {
  if (debts.length === 0) return undefined;
  const sorted = [...debts].sort((a, b) =>
    strategy === "AVALANCHE" ? b.apr - a.apr : a.balance - b.balance,
  );
  return sorted[0];
}

export function computeActionPlan({
  monthlySurplus,
  stage,
  debts,
  fragilityDollarsToTarget,
  highInterestAprCutoff,
  payoffStrategy,
  topGoal,
}: ActionInput): ActionItem[] {
  const surplus = Math.max(0, monthlySurplus);
  if (surplus === 0) {
    return [
      {
        label: "No surplus this month",
        amount: 0,
        detail: "Income matched essentials exactly. Revisit your budget for room to move.",
      },
    ];
  }

  const highInterestDebts = debts.filter((d) => d.apr >= highInterestAprCutoff && d.balance > 0);
  const targetHighInterest = pickTargetDebt(highInterestDebts, payoffStrategy);
  const anyDebt = pickTargetDebt(
    debts.filter((d) => d.balance > 0),
    payoffStrategy,
  );

  switch (stage) {
    case "STABILIZE_AND_ATTACK_DEBT": {
      const toBuffer = Math.round(surplus * 0.6);
      const toDebt = surplus - toBuffer;
      const items: ActionItem[] = [
        {
          label: "Starter emergency fund",
          amount: toBuffer,
          detail: `Builds toward a ${Math.ceil(fragilityDollarsToTarget / Math.max(1, toBuffer))}-month runway.`,
        },
      ];
      if (targetHighInterest) {
        items.push({
          label: `${targetHighInterest.name} (${targetHighInterest.apr.toFixed(1)}% APR)`,
          amount: toDebt,
          detail: "Highest-interest balance — every dollar here stops compounding against you.",
        });
      } else {
        items[0].amount = surplus;
      }
      return items;
    }

    case "SURVIVAL":
      return [
        {
          label: "Emergency fund",
          amount: surplus,
          detail: `${Math.max(1, Math.ceil(fragilityDollarsToTarget / surplus))} more months at this pace to reach your starter buffer.`,
        },
      ];

    case "PAY_DEBT":
      if (!anyDebt) {
        return [
          {
            label: "Invest the surplus",
            amount: surplus,
            detail: "No debt on file — surplus is free to grow.",
          },
        ];
      }
      return [
        {
          label: `${anyDebt.name} (${anyDebt.apr.toFixed(1)}% APR)`,
          amount: surplus,
          detail:
            payoffStrategy === "AVALANCHE"
              ? "Highest interest rate first — the mathematically fastest payoff."
              : "Smallest balance first — quick wins that build momentum.",
        },
      ];

    case "STABILIZE":
      return [
        {
          label: "Emergency fund",
          amount: surplus,
          detail: `Closing the gap to a full ${Math.max(1, Math.ceil(fragilityDollarsToTarget / surplus))}-month reserve.`,
        },
      ];

    case "INVEST": {
      if (topGoal && topGoal.remaining > 0) {
        const toGoal = Math.round(surplus * 0.3);
        const toInvest = surplus - toGoal;
        return [
          { label: "Invest", amount: toInvest, detail: "Broad-market, long horizon." },
          {
            label: topGoal.name,
            amount: toGoal,
            detail: `$${topGoal.remaining.toLocaleString()} remaining.`,
          },
        ];
      }
      return [
        {
          label: "Invest",
          amount: surplus,
          detail: "No high-interest debt, buffer is strong — this is growth money.",
        },
      ];
    }
  }
}
