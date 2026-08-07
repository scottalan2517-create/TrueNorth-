"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

const KINDS = [
  { value: "EMERGENCY_FUND", label: "Emergency Fund" },
  { value: "DEBT_PAYOFF", label: "Debt Payoff" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CUSTOM", label: "Custom" },
] as const;

export function AddGoal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("SAVINGS");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 py-3.5 text-sm font-semibold text-navy/60"
      >
        <Plus size={16} /> Add goal
      </button>
    );
  }

  async function submit() {
    setLoading(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        kind,
        targetAmount: Number(target) || 0,
        currentAmount: Number(current) || 0,
      }),
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setTarget("");
    setCurrent("");
    router.refresh();
  }

  return (
    <Card className="rise-in">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-lg text-navy">New goal</p>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-navy/40">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="Name" htmlFor="goal-name">
          <TextInput id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wedding fund" />
        </Field>
        <Field label="Type" htmlFor="goal-kind">
          <select
            id="goal-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Target" htmlFor="goal-target">
            <DollarInput id="goal-target" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <Field label="Already saved" htmlFor="goal-current">
            <DollarInput id="goal-current" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
        </div>
      </div>
      <Button onClick={submit} disabled={loading || !name || !target} className="w-full mt-5" size="lg">
        {loading ? "Adding…" : "Add goal"}
      </Button>
    </Card>
  );
}
