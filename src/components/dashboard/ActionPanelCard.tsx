import { Card, MonoLabel } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { ActionItem } from "@/lib/engines/action";

export function ActionPanelCard({ items, surplus }: { items: ActionItem[]; surplus: number }) {
  return (
    <Card className="rise-in">
      <div className="flex items-baseline justify-between mb-4">
        <MonoLabel className="text-navy/40">This Month&rsquo;s Action</MonoLabel>
        <span className="font-mono text-xs text-navy/40">
          ${surplus.toLocaleString()} surplus
        </span>
      </div>

      <div className="flex flex-col divide-y divide-navy/8">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
            <div className="pr-4">
              <p className="font-semibold text-navy text-sm">{item.label}</p>
              <p className="text-navy/50 text-xs mt-0.5">{item.detail}</p>
            </div>
            <AnimatedNumber
              value={item.amount}
              className="font-mono font-semibold text-navy text-lg shrink-0"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
