import { Card, MonoLabel } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import type { ProjectionResult } from "@/lib/engines/projection";

export function ProjectionTeaser({
  projection,
  monthlyContribution,
  consistencyPct,
}: {
  projection: ProjectionResult;
  monthlyContribution: number;
  consistencyPct: number;
}) {
  return (
    <Card className="rise-in">
      <MonoLabel className="text-navy/40">Projection Engine · 5 Years</MonoLabel>
      <div className="flex items-end justify-between mt-2">
        <p className="font-display text-3xl text-navy">
          ${Math.round(projection.finalBalance).toLocaleString()}
        </p>
        <Sparkline points={projection.series.map((p) => p.balance)} color="#12233B" />
      </div>
      <p className="text-navy/50 text-xs mt-3 leading-relaxed">
        At ${monthlyContribution.toLocaleString()}/mo and {consistencyPct}% consistency —
        the realistic number, not the fantasy one.
      </p>
    </Card>
  );
}
