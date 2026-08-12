import { Card, MonoLabel } from "@/components/ui/Card";
import { projectBalance } from "@/lib/engines/projection";

// Fixed, named reference points — deliberately NOT scaled to the user's own
// surplus (that's what the interactive Playground below is for). These
// answer "what does $X/mo look like for anyone," at a glance, no sliders.
const SCENARIOS = [
  { label: "Steady", contribution: 250, consistencyPct: 80 },
  { label: "Balanced", contribution: 500, consistencyPct: 85 },
  { label: "Aggressive", contribution: 1000, consistencyPct: 90 },
] as const;

export function ProjectionScenarios({ startingBalance }: { startingBalance: number }) {
  return (
    <Card>
      <MonoLabel className="text-navy/40 mb-1 block">Pre-built scenarios</MonoLabel>
      <p className="text-navy/50 text-xs mb-4 leading-relaxed">
        Three fixed reference points — not tied to your own numbers. For those, use the slider
        below.
      </p>
      <div className="flex flex-col divide-y divide-navy/6">
        {SCENARIOS.map((s) => {
          const p5 = projectBalance({ startingBalance, monthlyContribution: s.contribution, consistencyPct: s.consistencyPct, years: 5 });
          const p10 = projectBalance({ startingBalance, monthlyContribution: s.contribution, consistencyPct: s.consistencyPct, years: 10 });
          return (
            <div key={s.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-navy">{s.label}</p>
                <p className="text-xs text-navy/45 font-mono">
                  ${s.contribution}/mo · {s.consistencyPct}% consistency
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg text-navy">
                  ${Math.round(p5.finalBalance).toLocaleString()}
                </p>
                <p className="text-xs text-navy/40">
                  5yr · ${Math.round(p10.finalBalance).toLocaleString()} at 10yr
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
