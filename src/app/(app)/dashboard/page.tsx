import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFinancialState } from "@/lib/financial-state";
import { PriorityHero } from "@/components/dashboard/PriorityHero";
import { FragilityRing } from "@/components/dashboard/FragilityRing";
import { ActionPanelCard } from "@/components/dashboard/ActionPanelCard";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { ProjectionTeaser } from "@/components/dashboard/ProjectionTeaser";
import { MoneyDateCTA } from "@/components/dashboard/MoneyDateCTA";
import { DarkCard } from "@/components/ui/Card";
import { hasFeature } from "@/lib/tiers";
import { ArrowRight } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.tier) redirect("/settings/upgrade");
  const state = await getFinancialState(user.id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">
          {greeting()}
          {user.firstName ? `, ${user.firstName}` : ""}.
        </p>
        <h1 className="font-display text-xl text-navy mt-0.5">Here&rsquo;s where you stand.</h1>
      </div>

      <PriorityHero priority={state.priority} />

      <DarkCard>
        <FragilityRing fragility={state.fragility} />
      </DarkCard>

      <ActionPanelCard items={state.actionItems} surplus={state.monthlySurplus} />

      <NetWorthCard
        netWorth={state.netWorth}
        totalAssets={state.totalAssets}
        totalDebts={state.totalDebts}
        history={state.netWorthHistory}
      />

      <ProjectionTeaser
        projection={state.projection5yr}
        monthlyContribution={Math.round(state.investAmount)}
        consistencyPct={state.consistencyPct}
      />

      <MoneyDateCTA daysSinceLast={state.daysSinceLastMoneyDate} />

      {!hasFeature(user, "budget") && (
        <Link
          href="/settings/upgrade"
          className="rise-in flex items-center gap-4 rounded-2xl border border-navy/10 bg-navy/[0.03] p-4"
        >
          <div className="flex-1">
            <p className="font-semibold text-navy text-sm">Budgeting & Goals are Complete-only</p>
            <p className="text-navy/50 text-xs mt-0.5">
              Upgrade to plan every category and track goals against your priority.
            </p>
          </div>
          <ArrowRight size={16} className="text-navy/40 shrink-0" />
        </Link>
      )}
    </div>
  );
}
