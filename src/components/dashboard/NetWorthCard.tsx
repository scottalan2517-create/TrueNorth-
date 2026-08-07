import Link from "next/link";
import { Card, MonoLabel } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/ui/Sparkline";

export function NetWorthCard({
  netWorth,
  totalAssets,
  totalDebts,
  history,
}: {
  netWorth: number;
  totalAssets: number;
  totalDebts: number;
  history: number[];
}) {
  return (
    <Link href="/net-worth" className="block">
      <Card className="rise-in active:scale-[0.99] transition-transform">
        <div className="flex items-start justify-between">
          <div>
            <MonoLabel className="text-navy/40">Net Worth</MonoLabel>
            <AnimatedNumber
              value={netWorth}
              className="block font-display text-3xl text-navy mt-1"
            />
          </div>
          {history.length > 1 && <Sparkline points={history} />}
        </div>
        <div className="flex gap-5 mt-4 pt-4 border-t border-navy/8">
          <div>
            <p className="text-xs text-navy/40">Assets</p>
            <p className="font-mono text-sm text-navy/80">${totalAssets.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-navy/40">Debts</p>
            <p className="font-mono text-sm text-red">${totalDebts.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
