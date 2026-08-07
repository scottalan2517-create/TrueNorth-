"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, MonoLabel } from "@/components/ui/Card";

const KIND_LABEL: Record<string, string> = {
  EMERGENCY_FUND: "Emergency Fund",
  DEBT_PAYOFF: "Debt Payoff",
  SAVINGS: "Savings",
  CUSTOM: "Goal",
};

export function GoalCard({
  id,
  name,
  kind,
  targetAmount,
  currentAmount,
}: {
  id: string;
  name: string;
  kind: string;
  targetAmount: number;
  currentAmount: number;
}) {
  const router = useRouter();
  const [add, setAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const pct = Math.min(100, (currentAmount / targetAmount) * 100);
  const complete = currentAmount >= targetAmount;

  async function contribute() {
    const amount = Number(add);
    if (!amount) return;
    setSaving(true);
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentAmount: currentAmount + amount }),
    });
    setSaving(false);
    setAdd("");
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Remove ${name}?`)) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card className="rise-in">
      <div className="flex items-start justify-between">
        <div>
          <MonoLabel className="text-navy/40">{KIND_LABEL[kind] ?? "Goal"}</MonoLabel>
          <p className="font-display text-lg text-navy mt-0.5">{name}</p>
        </div>
        <button onClick={remove} className="text-navy/25 hover:text-red p-1" aria-label="Remove goal">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-3 h-2 rounded-full bg-navy/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="font-mono text-sm text-navy">${currentAmount.toLocaleString()}</p>
        <p className="font-mono text-sm text-navy/40">${targetAmount.toLocaleString()}</p>
      </div>

      {!complete && (
        <div className="flex gap-2 mt-3">
          <input
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            placeholder="Add $"
            inputMode="decimal"
            className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <button
            onClick={contribute}
            disabled={saving || !add}
            className="rounded-lg bg-navy/5 px-3 text-sm font-semibold text-navy"
          >
            Add
          </button>
        </div>
      )}
      {complete && <p className="text-xs text-[#4F8F63] font-medium mt-2">Goal reached.</p>}
    </Card>
  );
}
