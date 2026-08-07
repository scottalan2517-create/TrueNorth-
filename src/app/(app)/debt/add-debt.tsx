"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

const TYPES = [
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "STUDENT_LOAN", label: "Student loan" },
  { value: "AUTO_LOAN", label: "Auto loan" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "PERSONAL_LOAN", label: "Personal loan" },
  { value: "OTHER", label: "Other" },
] as const;

export function AddDebt() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("CREDIT_CARD");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPayment, setMinPayment] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 py-3.5 text-sm font-semibold text-navy/60"
      >
        <Plus size={16} /> Add debt
      </button>
    );
  }

  async function submit() {
    setLoading(true);
    await fetch("/api/debt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        balance: Number(balance) || 0,
        apr: Number(apr) || 0,
        minPayment: Number(minPayment) || 0,
      }),
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setBalance("");
    setApr("");
    setMinPayment("");
    router.refresh();
  }

  return (
    <Card className="rise-in">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-lg text-navy">New debt</p>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-navy/40">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="Name" htmlFor="debt-name">
          <TextInput id="debt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chase Sapphire" />
        </Field>
        <Field label="Type" htmlFor="debt-type">
          <select
            id="debt-type"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Balance" htmlFor="debt-balance">
            <DollarInput id="debt-balance" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </Field>
          <Field label="APR %" htmlFor="debt-apr">
            <TextInput id="debt-apr" inputMode="decimal" value={apr} onChange={(e) => setApr(e.target.value)} />
          </Field>
          <Field label="Min/mo" htmlFor="debt-min">
            <DollarInput id="debt-min" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} />
          </Field>
        </div>
      </div>
      <Button onClick={submit} disabled={loading || !name} className="w-full mt-5" size="lg">
        {loading ? "Adding…" : "Add debt"}
      </Button>
    </Card>
  );
}
