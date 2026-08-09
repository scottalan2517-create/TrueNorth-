"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Card, MonoLabel } from "@/components/ui/Card";
import { simulatePayoff, type PayoffDebtInput } from "@/lib/engines/payoff";
import { projectBalance } from "@/lib/engines/projection";

type Strategy = "AVALANCHE" | "SNOWBALL";
type Mode = "debt" | "invest";

interface Props {
  debts: PayoffDebtInput[];
  payoffStrategy: Strategy;
  investableStart: number;
  consistencyPct: number;
  monthlySurplus: number;
}

function monthsToText(months: number) {
  if (months >= 480) return "480+ mo";
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}yr` : `${years}yr ${rest}mo`;
}

export function PlaygroundClient({ debts, payoffStrategy, investableStart, consistencyPct, monthlySurplus }: Props) {
  const hasDebt = debts.length > 0;
  const [mode, setMode] = useState<Mode>(hasDebt ? "debt" : "invest");
  const baseline = Math.max(100, Math.round(monthlySurplus));
  const max = Math.max(500, baseline * 3);
  const [amount, setAmount] = useState(baseline);

  const presets = useMemo(
    () => [
      { label: "Conservative", value: Math.round(baseline * 0.5) },
      { label: "Steady", value: baseline },
      { label: "Aggressive", value: Math.round(baseline * 1.5) },
    ],
    [baseline],
  );

  const payoffAtZero = useMemo(() => simulatePayoff(debts, 0, payoffStrategy), [debts, payoffStrategy]);
  const payoffAtAmount = useMemo(() => simulatePayoff(debts, amount, payoffStrategy), [debts, payoffStrategy, amount]);

  const projection5 = useMemo(
    () => projectBalance({ startingBalance: investableStart, monthlyContribution: amount, consistencyPct, years: 5 }),
    [investableStart, amount, consistencyPct],
  );
  const projection10 = useMemo(
    () => projectBalance({ startingBalance: investableStart, monthlyContribution: amount, consistencyPct, years: 10 }),
    [investableStart, amount, consistencyPct],
  );

  return (
    <div className="flex flex-col gap-4">
      {hasDebt && (
        <div className="flex rounded-xl bg-navy/5 p-1">
          <button
            onClick={() => setMode("debt")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
              mode === "debt" ? "bg-white text-navy shadow-sm" : "text-navy/45",
            )}
          >
            Debt payoff
          </button>
          <button
            onClick={() => setMode("invest")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
              mode === "invest" ? "bg-white text-navy shadow-sm" : "text-navy/45",
            )}
          >
            Investing
          </button>
        </div>
      )}

      <Card>
        <div className="flex items-baseline justify-between mb-3">
          <MonoLabel className="text-navy/40">
            Extra {mode === "debt" ? "toward debt" : "invested"} / month
          </MonoLabel>
          <span className="font-display text-2xl text-navy">${amount.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={max}
          step={25}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex gap-2 mt-3">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setAmount(p.value)}
              className={clsx(
                "flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors",
                amount === p.value ? "border-gold bg-gold/10 text-navy" : "border-navy/15 text-navy/50",
              )}
            >
              {p.label}
              <span className="block font-mono font-normal mt-0.5">${p.value.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </Card>

      {mode === "debt" ? (
        <Card>
          <MonoLabel className="text-navy/40 mb-3 block">If you keep this up</MonoLabel>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-navy/45">At minimums only</p>
              <p className="font-display text-xl text-navy/40">{monthsToText(payoffAtZero.monthsToDebtFree)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-navy/45">At ${amount}/mo extra</p>
              <p className="font-display text-2xl text-navy">{monthsToText(payoffAtAmount.monthsToDebtFree)}</p>
            </div>
          </div>
          <p className="text-navy/50 text-xs mt-3 leading-relaxed">
            Saves roughly ${Math.max(0, Math.round(payoffAtZero.totalInterestPaid - payoffAtAmount.totalInterestPaid)).toLocaleString()} in interest versus minimums only.
          </p>
        </Card>
      ) : (
        <Card>
          <MonoLabel className="text-navy/40 mb-3 block">If you keep this up</MonoLabel>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy/45">5 years</p>
              <p className="font-display text-xl text-navy">${Math.round(projection5.finalBalance).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-navy/45">10 years</p>
              <p className="font-display text-xl text-navy">${Math.round(projection10.finalBalance).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-navy/50 text-xs mt-3 leading-relaxed">
            Assumes {consistencyPct}% consistency and a 7.5% average annual return — the realistic number, not the fantasy one.
          </p>
        </Card>
      )}
    </div>
  );
}
