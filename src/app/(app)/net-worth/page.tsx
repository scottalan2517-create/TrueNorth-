import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFinancialState } from "@/lib/financial-state";
import { Card, MonoLabel } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/ui/Sparkline";
import { SnapshotForm } from "@/components/forms/SnapshotForm";
import { format } from "date-fns";

export default async function NetWorthPage() {
  const user = await requireUser();
  if (!user.tier) redirect("/settings/upgrade");
  const state = await getFinancialState(user.id);
  const { snapshots, latest } = state;

  const rows = [...snapshots].reverse();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Net Worth</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">
          <AnimatedNumber value={state.netWorth} />
        </h1>
      </div>

      {state.netWorthHistory.length > 1 && (
        <Card className="rise-in">
          <div className="flex items-center justify-between">
            <MonoLabel className="text-navy/40">Trend</MonoLabel>
            <Sparkline points={state.netWorthHistory} width={180} height={48} />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="rise-in">
          <MonoLabel className="text-navy/40">Assets</MonoLabel>
          <p className="font-mono text-xl text-navy mt-1">${state.totalAssets.toLocaleString()}</p>
        </Card>
        <Card className="rise-in">
          <MonoLabel className="text-navy/40">Debts</MonoLabel>
          <p className="font-mono text-xl text-red mt-1">${state.totalDebts.toLocaleString()}</p>
        </Card>
      </div>

      <SnapshotForm
        latest={
          latest
            ? {
                cash: latest.cash,
                investments: latest.investments,
                retirement: latest.retirement,
                realEstate: latest.realEstate,
                otherAssets: latest.otherAssets,
                creditCardDebt: latest.creditCardDebt,
                studentLoanDebt: latest.studentLoanDebt,
                mortgageDebt: latest.mortgageDebt,
                autoLoanDebt: latest.autoLoanDebt,
                otherDebt: latest.otherDebt,
              }
            : null
        }
      />

      <div>
        <MonoLabel className="text-navy/40 mb-2 block">History</MonoLabel>
        <div className="flex flex-col gap-2">
          {rows.map((s, i) => {
            const nw =
              s.cash + s.investments + s.retirement + s.realEstate + s.otherAssets -
              (s.creditCardDebt + s.studentLoanDebt + s.mortgageDebt + s.autoLoanDebt + s.otherDebt);
            const prev = rows[i + 1];
            const prevNw = prev
              ? prev.cash + prev.investments + prev.retirement + prev.realEstate + prev.otherAssets -
                (prev.creditCardDebt + prev.studentLoanDebt + prev.mortgageDebt + prev.autoLoanDebt + prev.otherDebt)
              : null;
            const delta = prevNw === null ? null : nw - prevNw;
            return (
              <Card key={s.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-navy">{format(s.date, "MMMM yyyy")}</p>
                  {s.note && <p className="text-xs text-navy/45 mt-0.5">{s.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-navy">${nw.toLocaleString()}</p>
                  {delta !== null && (
                    <p className={`text-xs mt-0.5 ${delta >= 0 ? "text-[#4F8F63]" : "text-red"}`}>
                      {delta >= 0 ? "+" : ""}
                      {delta.toLocaleString()}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
