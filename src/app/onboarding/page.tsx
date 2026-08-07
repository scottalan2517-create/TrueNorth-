"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "@/components/ui/Compass";
import { DollarInput, Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { computeFragility } from "@/lib/engines/fragility";
import { computePriority } from "@/lib/engines/priority";
import { clsx } from "clsx";

type DebtType = "CREDIT_CARD" | "STUDENT_LOAN" | "AUTO_LOAN" | "MORTGAGE" | "PERSONAL_LOAN" | "OTHER";

interface DraftDebt {
  name: string;
  type: DebtType;
  balance: number;
  apr: number;
  minPayment: number;
}

const DEBT_TYPE_LABEL: Record<DebtType, string> = {
  CREDIT_CARD: "Credit card",
  STUDENT_LOAN: "Student loan",
  AUTO_LOAN: "Auto loan",
  MORTGAGE: "Mortgage",
  PERSONAL_LOAN: "Personal loan",
  OTHER: "Other",
};

const STEP_COUNT = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState("");
  const [essentials, setEssentials] = useState("");
  const [cash, setCash] = useState("");
  const [hasDebt, setHasDebt] = useState<boolean | null>(null);
  const [debts, setDebts] = useState<DraftDebt[]>([]);
  const [investments, setInvestments] = useState("");
  const [retirement, setRetirement] = useState("");
  const [realEstate, setRealEstate] = useState("");
  const [otherAssets, setOtherAssets] = useState("");

  const n = (v: string) => Number(v) || 0;

  const fragility = useMemo(
    () => computeFragility(n(cash), n(essentials)),
    [cash, essentials],
  );
  const priority = useMemo(
    () =>
      computePriority({
        liquidCash: n(cash),
        monthlyEssentialSpend: n(essentials),
        hasHighInterestDebt: debts.some((d) => d.apr >= 8 && d.balance > 0),
      }),
    [cash, essentials, debts],
  );

  function next() {
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function addDebt() {
    setDebts((d) => [...d, { name: "", type: "CREDIT_CARD", balance: 0, apr: 0, minPayment: 0 }]);
  }
  function updateDebt(i: number, patch: Partial<DraftDebt>) {
    setDebts((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeDebt(i: number) {
    setDebts((d) => d.filter((_, idx) => idx !== i));
  }

  async function finish() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyTakeHomeIncome: n(income),
        monthlyEssentialSpend: n(essentials),
        cash: n(cash),
        investments: n(investments),
        retirement: n(retirement),
        realEstate: n(realEstate),
        otherAssets: n(otherAssets),
        debts: debts
          .filter((d) => d.name.trim() && d.balance > 0)
          .map((d) => ({ ...d, balance: Number(d.balance), apr: Number(d.apr), minPayment: Number(d.minPayment) })),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <div className="px-6 pt-6 flex items-center gap-3">
        {step > 0 && (
          <button onClick={back} className="text-navy/40 text-sm font-medium" aria-label="Back">
            ← Back
          </button>
        )}
        <div className="flex-1 flex gap-1.5 ml-auto">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-gold" : "bg-navy/10",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md w-full mx-auto">
        {step === 0 && (
          <div className="rise-in flex flex-col items-center text-center gap-4">
            <Compass size={44} />
            <h1 className="font-display text-3xl text-navy leading-tight">
              Three minutes.
              <br />
              Then you’ll know exactly where you stand.
            </h1>
            <p className="text-navy/60 leading-relaxed">
              A handful of numbers — nothing linked, nothing shared. TrueNorth turns them into
              your priority, your emergency-fund health, and your next move.
            </p>
            <Button size="lg" onClick={next} className="w-full mt-4">
              Let’s go →
            </Button>
          </div>
        )}

        {step === 1 && (
          <StepShell
            key="income"
            title="What's your monthly take-home pay?"
            subtitle="After taxes. Round numbers are fine."
          >
            <Field label="Monthly take-home income" htmlFor="income">
              <DollarInput
                id="income"
                autoFocus
                placeholder="6,200"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </Field>
            <Button size="lg" onClick={next} disabled={!income} className="w-full mt-6">
              Continue →
            </Button>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            key="essentials"
            title="What does it cost to keep the lights on?"
            subtitle="Rent or mortgage, utilities, groceries, insurance, minimum debt payments — the non-negotiables."
          >
            <Field label="Monthly essential spend" htmlFor="essentials">
              <DollarInput
                id="essentials"
                autoFocus
                placeholder="3,800"
                value={essentials}
                onChange={(e) => setEssentials(e.target.value)}
              />
            </Field>
            <Button size="lg" onClick={next} disabled={!essentials} className="w-full mt-6">
              Continue →
            </Button>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            key="cash"
            title="How much do you have in cash savings right now?"
            subtitle="Checking, savings, anything you could access this week. This is your safety net."
          >
            <Field label="Liquid cash" htmlFor="cash">
              <DollarInput
                id="cash"
                autoFocus
                placeholder="4,500"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
              />
            </Field>
            <Button size="lg" onClick={next} disabled={!cash} className="w-full mt-6">
              Continue →
            </Button>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            key="debt-toggle"
            title="Any debt outside a mortgage?"
            subtitle="Credit cards, student loans, auto loans, personal loans."
          >
            <div className="flex gap-3">
              <Button
                variant={hasDebt === true ? "primary" : "outline"}
                onClick={() => {
                  setHasDebt(true);
                  if (debts.length === 0) addDebt();
                }}
                className="flex-1"
              >
                Yes
              </Button>
              <Button
                variant={hasDebt === false ? "primary" : "outline"}
                onClick={() => {
                  setHasDebt(false);
                  setDebts([]);
                }}
                className="flex-1"
              >
                No
              </Button>
            </div>

            {hasDebt && (
              <div className="flex flex-col gap-4 mt-6">
                {debts.map((debt, i) => (
                  <div key={i} className="rounded-xl border border-navy/10 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <select
                        value={debt.type}
                        onChange={(e) => updateDebt(i, { type: e.target.value as DebtType })}
                        className="text-sm font-medium text-navy bg-transparent border-none focus:outline-none"
                      >
                        {Object.entries(DEBT_TYPE_LABEL).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeDebt(i)}
                        className="text-xs text-navy/40 hover:text-red"
                      >
                        Remove
                      </button>
                    </div>
                    <TextInput
                      placeholder="Name (e.g. Chase Sapphire)"
                      value={debt.name}
                      onChange={(e) => updateDebt(i, { name: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <DollarInput
                        placeholder="Balance"
                        value={debt.balance || ""}
                        onChange={(e) => updateDebt(i, { balance: Number(e.target.value) })}
                      />
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="APR"
                          value={debt.apr || ""}
                          onChange={(e) => updateDebt(i, { apr: Number(e.target.value) })}
                          className="w-full rounded-xl border border-navy/15 py-3 pl-3 pr-6 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold/50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 text-sm">%</span>
                      </div>
                      <DollarInput
                        placeholder="Min/mo"
                        value={debt.minPayment || ""}
                        onChange={(e) => updateDebt(i, { minPayment: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ))}
                <button onClick={addDebt} className="text-sm font-medium text-gold self-start">
                  + Add another debt
                </button>
              </div>
            )}

            <Button size="lg" onClick={next} disabled={hasDebt === null} className="w-full mt-6">
              Continue →
            </Button>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            key="networth"
            title="What else do you have?"
            subtitle="Rough numbers. You can refine these every month in the Money Date."
          >
            <div className="flex flex-col gap-3">
              <Field label="Investments (brokerage, etc.)" htmlFor="investments">
                <DollarInput id="investments" placeholder="0" value={investments} onChange={(e) => setInvestments(e.target.value)} />
              </Field>
              <Field label="Retirement (401k, IRA)" htmlFor="retirement">
                <DollarInput id="retirement" placeholder="0" value={retirement} onChange={(e) => setRetirement(e.target.value)} />
              </Field>
              <Field label="Real estate equity" htmlFor="realEstate">
                <DollarInput id="realEstate" placeholder="0" value={realEstate} onChange={(e) => setRealEstate(e.target.value)} />
              </Field>
              <Field label="Other assets" htmlFor="otherAssets">
                <DollarInput id="otherAssets" placeholder="0" value={otherAssets} onChange={(e) => setOtherAssets(e.target.value)} />
              </Field>
            </div>
            <Button size="lg" onClick={next} className="w-full mt-6">
              Show me where I stand →
            </Button>
          </StepShell>
        )}

        {step === 6 && (
          <div className="rise-in flex flex-col gap-6">
            <div className="text-center">
              <p className="mono-label text-gold mb-2">Your Priority Engine says</p>
              <h1 className="font-display text-3xl text-navy leading-tight">{priority.title}</h1>
              <p className="text-navy/60 mt-2">{priority.reason}</p>
            </div>

            <div className="rounded-2xl bg-navy p-5 text-cream">
              <p className="mono-label text-gold mb-1">Fragility Score</p>
              <p className="font-display text-2xl">{fragility.label}</p>
              <p className="text-cream/60 text-sm mt-1">
                {fragility.months.toFixed(1)} months of essentials covered
              </p>
            </div>

            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="mono-label text-navy/40 mb-1">Next move</p>
              <p className="text-navy">{priority.nextMove}</p>
            </div>

            {error && <p className="text-sm text-red text-center">{error}</p>}

            <Button size="lg" onClick={finish} disabled={loading} className="w-full">
              {loading ? "Setting up your dashboard…" : "Enter TrueNorth →"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rise-in flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-navy leading-snug">{title}</h1>
        {subtitle && <p className="text-navy/55 mt-2 text-sm leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
