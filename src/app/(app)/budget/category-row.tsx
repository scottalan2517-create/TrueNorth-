"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export function CategoryRow({
  id,
  name,
  planned,
  actual,
  month,
}: {
  id: string;
  name: string;
  planned: number;
  actual: number;
  month: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(actual || ""));
  const [saving, setSaving] = useState(false);

  const pct = planned > 0 ? Math.min(1.3, (Number(value) || 0) / planned) : 0;
  const over = planned > 0 && (Number(value) || 0) > planned;

  async function save() {
    setSaving(true);
    await fetch("/api/budget/actuals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: id, month, amount: Number(value) || 0 }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-navy">{name}</p>
        <div className="flex items-center gap-1 font-mono text-sm">
          <span className="text-navy/35">$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            inputMode="decimal"
            disabled={saving}
            className="w-16 text-right bg-transparent border-b border-navy/20 focus:border-gold focus:outline-none"
          />
          <span className="text-navy/35">/ ${planned.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-navy/8 overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", over ? "bg-red" : "bg-gold")}
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}
