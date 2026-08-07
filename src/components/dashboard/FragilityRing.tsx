import type { FragilityResult } from "@/lib/engines/fragility";

const BAND_COLOR: Record<FragilityResult["band"], string> = {
  FRAGILE: "#A8322B",
  STABLE: "#C9962E",
  STRONG: "#4F8F63",
};

export function FragilityRing({ fragility }: { fragility: FragilityResult }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, fragility.months / fragility.targetMonths || 0);
  const dash = circumference * pct;
  const color = BAND_COLOR[fragility.band];

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div>
        <p className="mono-label text-gold mb-1">Fragility Score</p>
        <p className="font-display text-2xl text-cream leading-none">{fragility.label}</p>
        <p className="text-cream/55 text-sm mt-1.5">
          {fragility.months.toFixed(1)} of {fragility.targetMonths} months covered
        </p>
      </div>
    </div>
  );
}
