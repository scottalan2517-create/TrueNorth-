"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Trash2 } from "lucide-react";
import { Card, MonoLabel } from "@/components/ui/Card";

export function DebtRow({
  id,
  name,
  balance,
  apr,
  minPayment,
  isTarget,
  monthsToPayoff,
}: {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  isTarget: boolean;
  monthsToPayoff: number;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!confirm(`Remove ${name}?`)) return;
    setRemoving(true);
    await fetch(`/api/debt/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card className={clsx("rise-in", isTarget && "border-gold/40 bg-gold/[0.04]")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {isTarget && <MonoLabel className="text-gold block mb-1">Attack this one</MonoLabel>}
          <p className="font-semibold text-navy">{name}</p>
          <p className="text-navy/50 text-xs mt-0.5">
            {apr.toFixed(1)}% APR · ${minPayment.toLocaleString()}/mo minimum
          </p>
        </div>
        <button onClick={remove} disabled={removing} className="text-navy/25 hover:text-red p-1" aria-label="Remove debt">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="font-mono text-lg text-navy">${balance.toLocaleString()}</p>
        <p className="text-xs text-navy/45">
          {monthsToPayoff >= 480 ? "480+ mo" : `${monthsToPayoff} mo to payoff`}
        </p>
      </div>
    </Card>
  );
}
