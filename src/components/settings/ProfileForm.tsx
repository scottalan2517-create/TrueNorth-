"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";

export function ProfileForm({
  income,
  essentials,
  highInterestAprCutoff,
  defaultConsistencyPct,
}: {
  income: number;
  essentials: number;
  highInterestAprCutoff: number;
  defaultConsistencyPct: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    monthlyTakeHomeIncome: String(income),
    monthlyEssentialSpend: String(essentials),
    highInterestAprCutoff: String(highInterestAprCutoff),
    defaultConsistencyPct: String(defaultConsistencyPct),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyTakeHomeIncome: Number(values.monthlyTakeHomeIncome) || 0,
        monthlyEssentialSpend: Number(values.monthlyEssentialSpend) || 0,
        highInterestAprCutoff: Number(values.highInterestAprCutoff) || 0,
        defaultConsistencyPct: Number(values.defaultConsistencyPct) || 0,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Monthly take-home income" htmlFor="p-income">
        <DollarInput
          id="p-income"
          value={values.monthlyTakeHomeIncome}
          onChange={(e) => setValues((v) => ({ ...v, monthlyTakeHomeIncome: e.target.value }))}
        />
      </Field>
      <Field label="Monthly essential spend" htmlFor="p-essentials">
        <DollarInput
          id="p-essentials"
          value={values.monthlyEssentialSpend}
          onChange={(e) => setValues((v) => ({ ...v, monthlyEssentialSpend: e.target.value }))}
        />
      </Field>
      <Field label="High-interest APR cutoff" htmlFor="p-apr" hint="Debt at or above this rate counts as high-interest">
        <TextInput
          id="p-apr"
          inputMode="decimal"
          value={values.highInterestAprCutoff}
          onChange={(e) => setValues((v) => ({ ...v, highInterestAprCutoff: e.target.value }))}
        />
      </Field>
      <Field label="Default consistency %" htmlFor="p-consistency" hint="Used by the Projection Engine as a reality check">
        <TextInput
          id="p-consistency"
          inputMode="decimal"
          value={values.defaultConsistencyPct}
          onChange={(e) => setValues((v) => ({ ...v, defaultConsistencyPct: e.target.value }))}
        />
      </Field>
      <Button onClick={save} disabled={saving} className="mt-1">
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}
