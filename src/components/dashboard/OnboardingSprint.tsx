import Link from "next/link";
import { Check } from "lucide-react";
import { Card, MonoLabel } from "@/components/ui/Card";
import { clsx } from "clsx";

interface SprintProgress {
  loggedMoneyDate: boolean;
  setGoal: boolean;
  builtBudget: boolean;
  refreshedTwice: boolean;
}

const STEPS: { key: keyof SprintProgress; label: string; href: string }[] = [
  { key: "builtBudget", label: "Build your first budget category", href: "/budget" },
  { key: "setGoal", label: "Set your first goal", href: "/goals" },
  { key: "loggedMoneyDate", label: "Log your first Money Date", href: "/money-date" },
  { key: "refreshedTwice", label: "Come back and refresh your numbers", href: "/net-worth" },
];

export function OnboardingSprint({ progress }: { progress: SprintProgress }) {
  const done = STEPS.filter((s) => progress[s.key]).length;
  if (done === STEPS.length) return null;

  return (
    <Card className="rise-in">
      <div className="flex items-baseline justify-between mb-1">
        <MonoLabel className="text-navy/40">Your First 30 Days</MonoLabel>
        <span className="mono-label text-navy/40">
          {done}/{STEPS.length}
        </span>
      </div>
      <p className="text-navy/50 text-xs mb-3">The habit is the point, not any one number.</p>
      <div className="flex flex-col divide-y divide-navy/8">
        {STEPS.map((step) => {
          const complete = progress[step.key];
          return (
            <Link
              key={step.key}
              href={step.href}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  complete ? "bg-gold border-gold" : "border-navy/20",
                )}
              >
                {complete && <Check size={12} className="text-navy-deep" strokeWidth={3} />}
              </span>
              <span className={clsx("text-sm", complete ? "text-navy/40 line-through" : "text-navy")}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
