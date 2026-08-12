import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getFinancialState } from "@/lib/financial-state";
import { ProjectionScenarios } from "@/components/dashboard/ProjectionScenarios";
import { MonoLabel } from "@/components/ui/Card";
import { PlaygroundClient } from "./playground-client";

export default async function PlaygroundPage() {
  const user = await requireUser();
  if (!user.tier) redirect("/settings/upgrade");
  const state = await getFinancialState(user.id);

  const investableStart = (state.latest?.investments ?? 0) + (state.latest?.retirement ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Projection Engine</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">What if?</h1>
        <p className="text-navy/50 text-sm mt-1">
          Drag it. Nothing here is saved — this is just the engines answering a question.
        </p>
      </div>

      <ProjectionScenarios startingBalance={investableStart} />

      <div>
        <MonoLabel className="text-navy/40">Custom — your numbers</MonoLabel>
      </div>

      <PlaygroundClient
        debts={state.debts.map((d) => ({ id: d.id, name: d.name, balance: d.balance, apr: d.apr, minPayment: d.minPayment }))}
        payoffStrategy={state.profile?.payoffStrategy ?? "AVALANCHE"}
        investableStart={investableStart}
        consistencyPct={state.consistencyPct}
        monthlySurplus={state.monthlySurplus}
      />
    </div>
  );
}
