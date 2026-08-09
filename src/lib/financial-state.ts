import { db } from "@/lib/db";
import { computeFragility } from "@/lib/engines/fragility";
import { computePriority } from "@/lib/engines/priority";
import { computeActionPlan } from "@/lib/engines/action";
import { projectBalance } from "@/lib/engines/projection";

export async function getFinancialState(userId: string) {
  const [profile, snapshots, debts, goals, lastMoneyDate, moneyDateCount, budgetCategoryCount] = await Promise.all([
    db.financialProfile.findUnique({ where: { userId } }),
    db.netWorthSnapshot.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    db.debtAccount.findMany({ where: { userId, balance: { gt: 0 } }, orderBy: { sortOrder: "asc" } }),
    db.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    db.moneyDateLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    db.moneyDateLog.count({ where: { userId } }),
    db.budgetCategory.count({ where: { userId } }),
  ]);

  const latest = snapshots[snapshots.length - 1] ?? null;

  const income = profile?.monthlyTakeHomeIncome ?? 0;
  const essentials = profile?.monthlyEssentialSpend ?? 0;
  const cash = latest?.cash ?? 0;
  const highInterestAprCutoff = profile?.highInterestAprCutoff ?? 8;
  const payoffStrategy = profile?.payoffStrategy ?? "AVALANCHE";
  const consistencyPct = profile?.defaultConsistencyPct ?? 85;

  const fragility = computeFragility(cash, essentials);
  const hasHighInterestDebt = debts.some((d) => d.apr >= highInterestAprCutoff);
  const priority = computePriority({
    liquidCash: cash,
    monthlyEssentialSpend: essentials,
    hasHighInterestDebt,
  });

  const monthlySurplus = Math.max(0, income - essentials);
  const topGoal = goals.find((g) => g.currentAmount < g.targetAmount);

  const actionItems = computeActionPlan({
    monthlySurplus,
    stage: priority.stage,
    debts: debts.map((d) => ({ id: d.id, name: d.name, balance: d.balance, apr: d.apr })),
    fragilityDollarsToTarget: fragility.dollarsToTarget,
    highInterestAprCutoff,
    payoffStrategy,
    topGoal: topGoal
      ? { id: topGoal.id, name: topGoal.name, remaining: topGoal.targetAmount - topGoal.currentAmount }
      : undefined,
  });

  const investAmount = actionItems.find((i) => i.label === "Invest")?.amount ?? 0;
  const investableStart = (latest?.investments ?? 0) + (latest?.retirement ?? 0);
  const projection5yr = projectBalance({
    startingBalance: investableStart,
    monthlyContribution: investAmount || monthlySurplus * 0.5,
    consistencyPct,
    years: 5,
  });

  const netWorthHistory = snapshots.map(netWorthOf);
  const totalAssets = latest
    ? latest.cash + latest.investments + latest.retirement + latest.realEstate + latest.otherAssets
    : 0;
  const totalDebts = latest
    ? latest.creditCardDebt + latest.studentLoanDebt + latest.mortgageDebt + latest.autoLoanDebt + latest.otherDebt
    : 0;

  const daysSinceLastMoneyDate = lastMoneyDate
    ? Math.floor((Date.now() - lastMoneyDate.date.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    profile,
    latest,
    snapshots,
    debts,
    goals,
    fragility,
    priority,
    actionItems,
    monthlySurplus,
    projection5yr,
    consistencyPct,
    investAmount: investAmount || monthlySurplus * 0.5,
    netWorth: totalAssets - totalDebts,
    totalAssets,
    totalDebts,
    netWorthHistory,
    daysSinceLastMoneyDate,
    sprintProgress: {
      loggedMoneyDate: moneyDateCount >= 1,
      setGoal: goals.length >= 1,
      builtBudget: budgetCategoryCount >= 1,
      refreshedTwice: snapshots.length >= 2,
    },
  };
}

function netWorthOf(s: {
  cash: number;
  investments: number;
  retirement: number;
  realEstate: number;
  otherAssets: number;
  creditCardDebt: number;
  studentLoanDebt: number;
  mortgageDebt: number;
  autoLoanDebt: number;
  otherDebt: number;
}) {
  const assets = s.cash + s.investments + s.retirement + s.realEstate + s.otherAssets;
  const debtsTotal = s.creditCardDebt + s.studentLoanDebt + s.mortgageDebt + s.autoLoanDebt + s.otherDebt;
  return assets - debtsTotal;
}
