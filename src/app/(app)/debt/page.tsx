import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { simulatePayoff } from "@/lib/engines/payoff";
import { Card, MonoLabel } from "@/components/ui/Card";
import { StrategyToggle } from "./strategy-toggle";
import { DebtRow } from "./debt-row";
import { AddDebt } from "./add-debt";

export default async function DebtPage() {
  const user = await requireUser();
  if (!user.tier) redirect("/settings/upgrade");
  const [profile, debts] = await Promise.all([
    db.financialProfile.findUnique({ where: { userId: user.id } }),
    db.debtAccount.findMany({ where: { userId: user.id, balance: { gt: 0 } }, orderBy: { sortOrder: "asc" } }),
  ]);

  const strategy = profile?.payoffStrategy ?? "AVALANCHE";
  const income = profile?.monthlyTakeHomeIncome ?? 0;
  const essentials = profile?.monthlyEssentialSpend ?? 0;
  const extra = Math.max(0, income - essentials - debts.reduce((s, d) => s + d.minPayment, 0));

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const payoff = simulatePayoff(debts, extra, strategy);
  const targetId = payoff.order[0]?.id;
  const monthsById = new Map(payoff.order.map((o) => [o.id, o.monthsToPayoff]));

  const orderedDebts = [...debts].sort((a, b) => {
    const strategyKey = (d: typeof a) => (strategy === "AVALANCHE" ? -d.apr : d.balance);
    return strategyKey(a) - strategyKey(b);
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Total Debt</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">${totalBalance.toLocaleString()}</h1>
      </div>

      <StrategyToggle strategy={strategy} />

      {debts.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <MonoLabel className="text-navy/40">Debt-free in</MonoLabel>
            <p className="font-display text-xl text-navy mt-1">
              {payoff.monthsToDebtFree >= 480 ? "480+ mo" : `${payoff.monthsToDebtFree} mo`}
            </p>
          </Card>
          <Card>
            <MonoLabel className="text-navy/40">Extra applied</MonoLabel>
            <p className="font-mono text-xl text-navy mt-1">${Math.round(extra).toLocaleString()}/mo</p>
          </Card>
        </div>
      )}

      {debts.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-navy/50 text-sm">No debt on file. Add one below, or enjoy the silence.</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {orderedDebts.map((d) => (
          <DebtRow
            key={d.id}
            id={d.id}
            name={d.name}
            balance={d.balance}
            apr={d.apr}
            minPayment={d.minPayment}
            isTarget={d.id === targetId}
            monthsToPayoff={monthsById.get(d.id) ?? 0}
          />
        ))}
      </div>

      <AddDebt />
    </div>
  );
}
