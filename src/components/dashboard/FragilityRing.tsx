import type { FragilityResult } from "@/lib/engines/fragility";
import type { PriorityResult } from "@/lib/engines/priority";

const BAND_COLOR: Record<FragilityResult["band"], string> = {
  FRAGILE: "#A8322B",
  STABLE: "#C9962E",
  STRONG: "#4F8F63",
};

// The ring itself only ever tells the truth about cash runway — it doesn't
// go red just because debt went up. But that creates a blind spot: cash can
// look "Strong" while something else (high-interest debt, no buffer) needs
// attention. The accent halo is a second, honest signal layered around the
// outside for exactly that case. It only appears when it adds information
// the ring doesn't already show — i.e. priority is worse than the ring's
// own band implies — so an already-red ring doesn't get a redundant red
// halo, and a genuinely all-clear ring stays clean.
const ACCENT_COLOR: Record<PriorityResult["severity"], string> = {
  red: "#A8322B",
  amber: "#C9962E",
  green: "",
};
const SEVERITY_RANK: Record<PriorityResult["severity"], number> = { green: 0, amber: 1, red: 2 };
const BAND_RANK: Record<FragilityResult["band"], number> = { STRONG: 0, STABLE: 1, FRAGILE: 2 };

export function FragilityRing({
  fragility,
  accentSeverity,
}: {
  fragility: FragilityResult;
  accentSeverity?: PriorityResult["severity"];
}) {
  const size = 100;
  const stroke = 8;
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, fragility.months / fragility.targetMonths || 0);
  const dash = circumference * pct;
  const color = BAND_COLOR[fragility.band];

  const accentR = r + 7;
  const showAccent = accentSeverity != null && SEVERITY_RANK[accentSeverity] > BAND_RANK[fragility.band];
  const accentColor = showAccent ? ACCENT_COLOR[accentSeverity] : null;
  const accentCircumference = 2 * Math.PI * accentR;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        {accentColor && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={accentR}
            stroke={accentColor}
            strokeWidth={2}
            strokeOpacity={0.55}
            strokeDasharray={`${accentCircumference * 0.75} ${accentCircumference}`}
            strokeLinecap="round"
            fill="none"
            className="transition-[stroke] duration-700 ease-out"
          />
        )}
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
        {accentColor && (
          <p className="text-xs mt-1" style={{ color: accentColor }}>
            Cash isn&rsquo;t the whole picture — check your priority below
          </p>
        )}
      </div>
    </div>
  );
}
