"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

const GROUPS = [
  { value: "ESSENTIALS", label: "Essentials" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "SAVINGS_AND_DEBT", label: "Savings & Debt" },
] as const;

export function AddCategory() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]["value"]>("ESSENTIALS");
  const [planned, setPlanned] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 py-3.5 text-sm font-semibold text-navy/60"
      >
        <Plus size={16} /> Add category
      </button>
    );
  }

  async function submit() {
    setLoading(true);
    await fetch("/api/budget/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, group, monthlyPlanned: Number(planned) || 0 }),
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setPlanned("");
    router.refresh();
  }

  return (
    <Card className="rise-in">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-lg text-navy">New category</p>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-navy/40">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="Name" htmlFor="cat-name">
          <TextInput id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Groceries" />
        </Field>
        <Field label="Group" htmlFor="cat-group">
          <select
            id="cat-group"
            value={group}
            onChange={(e) => setGroup(e.target.value as typeof group)}
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Monthly planned" htmlFor="cat-planned">
          <DollarInput id="cat-planned" value={planned} onChange={(e) => setPlanned(e.target.value)} placeholder="450" />
        </Field>
      </div>
      <Button onClick={submit} disabled={loading || !name} className="w-full mt-5" size="lg">
        {loading ? "Adding…" : "Add category"}
      </Button>
    </Card>
  );
}
