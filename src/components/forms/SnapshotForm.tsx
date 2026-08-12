"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

const ASSET_FIELDS = [
  { key: "cash", label: "Cash (checking, savings)" },
  { key: "investments", label: "Investments (brokerage)" },
  { key: "retirement", label: "Retirement (401k, IRA)" },
  { key: "realEstate", label: "Real estate equity" },
  { key: "otherAssets", label: "Other assets" },
] as const;

const DEBT_FIELDS = [
  { key: "creditCardDebt", label: "Credit cards" },
  { key: "studentLoanDebt", label: "Student loans" },
  { key: "mortgageDebt", label: "Mortgage" },
  { key: "autoLoanDebt", label: "Auto loans" },
  { key: "otherDebt", label: "Other debt" },
] as const;

type FieldKey = (typeof ASSET_FIELDS)[number]["key"] | (typeof DEBT_FIELDS)[number]["key"];

export function SnapshotForm({
  latest,
  defaultOpen = false,
  hideToggle = false,
  onSaved,
  syncedTotals,
}: {
  latest: Record<FieldKey, number> | null;
  defaultOpen?: boolean;
  hideToggle?: boolean;
  onSaved?: () => void;
  /** From linked bank accounts (opt-in Plus perk) — a one-tap fill, never automatic. */
  syncedTotals?: { cash: number; investments: number };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>(() => {
    const init = {} as Record<FieldKey, string>;
    for (const f of [...ASSET_FIELDS, ...DEBT_FIELDS]) {
      init[f.key] = latest ? String(latest[f.key] ?? 0) : "";
    }
    return init;
  });
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 py-4 text-sm font-semibold text-navy/60 active:scale-[0.99] transition-transform"
      >
        <Plus size={16} /> Log this month&rsquo;s numbers
      </button>
    );
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v) || 0]));
    const res = await fetch("/api/net-worth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, note: note || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setOpen(false);
    router.refresh();
    onSaved?.();
  }

  return (
    <Card className="rise-in">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-lg text-navy">Refresh your numbers</p>
        {!hideToggle && (
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-navy/40">
            <X size={18} />
          </button>
        )}
      </div>

      <p className="mono-label text-navy/35 mb-2">Assets</p>
      {syncedTotals && (
        <button
          type="button"
          onClick={() =>
            setValues((v) => ({
              ...v,
              cash: String(syncedTotals.cash),
              investments: String(syncedTotals.investments),
            }))
          }
          className="mb-3 text-xs font-semibold text-gold text-left"
        >
          Fill cash &amp; investments from linked accounts →
        </button>
      )}
      <div className="flex flex-col gap-3 mb-5">
        {ASSET_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={f.key}>
            <DollarInput
              id={f.key}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>

      <p className="mono-label text-navy/35 mb-2">Debts</p>
      <div className="flex flex-col gap-3 mb-5">
        {DEBT_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={f.key}>
            <DollarInput
              id={f.key}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>

      <Field label="Note" htmlFor="note" hint="One sentence. Optional.">
        <TextInput id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Paid the card down $400" />
      </Field>

      {error && <p className="text-sm text-red mt-3">{error}</p>}

      <Button onClick={submit} disabled={loading} className="w-full mt-5" size="lg">
        {loading ? "Saving…" : "Save snapshot"}
      </Button>
    </Card>
  );
}
