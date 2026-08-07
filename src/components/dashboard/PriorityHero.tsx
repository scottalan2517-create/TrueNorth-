import { clsx } from "clsx";
import { DarkCard } from "@/components/ui/Card";
import { PRIORITY_STAGE_ORDER, type PriorityResult } from "@/lib/engines/priority";

const SEVERITY_DOT: Record<PriorityResult["severity"], string> = {
  red: "bg-red",
  amber: "bg-gold",
  green: "bg-[#4F8F63]",
};

const STAGE_SHORT: Record<string, string> = {
  STABILIZE_AND_ATTACK_DEBT: "Stabilize + Debt",
  SURVIVAL: "Survival",
  PAY_DEBT: "Pay Debt",
  STABILIZE: "Stabilize",
  INVEST: "Invest",
};

export function PriorityHero({ priority }: { priority: PriorityResult }) {
  const currentIndex = PRIORITY_STAGE_ORDER.indexOf(priority.stage);

  return (
    <DarkCard className="rise-in">
      <p className="mono-label text-gold mb-3">Your Priority Right Now</p>

      <div className="flex items-start gap-3 mb-3">
        <span className={clsx("mt-2.5 h-2.5 w-2.5 rounded-full shrink-0 needle-settle", SEVERITY_DOT[priority.severity])} />
        <h2 className="font-display text-[1.65rem] leading-tight text-cream">{priority.title}</h2>
      </div>

      <p className="text-cream/65 text-[0.95rem] leading-relaxed mb-5">{priority.reason}</p>

      {/* Stepper */}
      <div className="flex items-center mb-5">
        {PRIORITY_STAGE_ORDER.map((stage, i) => (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div
              className={clsx(
                "h-2 w-2 rounded-full shrink-0 transition-colors",
                i === currentIndex ? "bg-gold scale-150" : i < currentIndex ? "bg-gold/50" : "bg-cream/15",
              )}
            />
            {i < PRIORITY_STAGE_ORDER.length - 1 && (
              <div className={clsx("h-px flex-1 mx-1", i < currentIndex ? "bg-gold/40" : "bg-cream/10")} />
            )}
          </div>
        ))}
      </div>
      <p className="mono-label text-cream/35 mb-5 -mt-3">{STAGE_SHORT[priority.stage]}</p>

      <div className="rounded-xl bg-black/20 p-4">
        <p className="mono-label text-gold-soft mb-1.5">Next move</p>
        <p className="text-cream text-sm leading-relaxed">{priority.nextMove}</p>
      </div>
    </DarkCard>
  );
}
