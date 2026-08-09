import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFinancialState } from "@/lib/financial-state";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/tiers";
import { MoneyDateWizard } from "./money-date-wizard";
import { MoneyDateHistory } from "@/components/money-date/MoneyDateHistory";
import { UpsellEmptyState } from "@/components/ui/UpsellEmptyState";

export default async function MoneyDatePage() {
  const user = await requireUser();
  if (!user.tier) redirect("/settings/upgrade");
  const [state, logs] = await Promise.all([
    getFinancialState(user.id),
    db.moneyDateLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">The Money Date</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">15 minutes, once a month.</h1>
      </div>

      <MoneyDateWizard
        latest={
          state.latest
            ? {
                cash: state.latest.cash,
                investments: state.latest.investments,
                retirement: state.latest.retirement,
                realEstate: state.latest.realEstate,
                otherAssets: state.latest.otherAssets,
                creditCardDebt: state.latest.creditCardDebt,
                studentLoanDebt: state.latest.studentLoanDebt,
                mortgageDebt: state.latest.mortgageDebt,
                autoLoanDebt: state.latest.autoLoanDebt,
                otherDebt: state.latest.otherDebt,
              }
            : null
        }
        priority={state.priority}
        actionItems={state.actionItems}
        logCount={logs.length}
      />

      {hasFeature(user, "money_date_history") ? (
        <MoneyDateHistory logs={logs} />
      ) : (
        <UpsellEmptyState
          title="Your story, twelve sentences a year"
          body="TrueNorth Complete keeps your full Money Date history — every entry, a running streak, all in one place."
        />
      )}
    </div>
  );
}
