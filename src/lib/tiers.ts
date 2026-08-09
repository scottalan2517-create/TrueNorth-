// Tier structure, faithful to the original TrueNorth pricing and inclusions,
// translated into real feature depth for the web app rather than flags on
// identical screens.

export type TierId = "STARTER" | "COMPLETE";

export interface TierDef {
  id: TierId;
  name: string;
  price: number;
  priceSuffix: string;
  tagline: string;
  features: string[];
}

export const TIERS: Record<TierId, TierDef> = {
  STARTER: {
    id: "STARTER",
    name: "TrueNorth Starter",
    price: 49,
    priceSuffix: "one-time",
    tagline: "The full decision engine.",
    features: [
      "All four engines — Priority, Action, Projection, Fragility",
      "Net worth tracking",
      "Debt payoff planner (avalanche & snowball)",
      "3 pre-built projection scenarios",
      "Monthly Money Date ritual",
      "Lifetime access — no subscription",
    ],
  },
  COMPLETE: {
    id: "COMPLETE",
    name: "TrueNorth Complete",
    price: 129,
    priceSuffix: "one-time",
    tagline: "Everything, plus the tools that make it stick.",
    features: [
      "Everything in Starter",
      "Full budgeting module — categories, planned vs. actual",
      "Goals module with progress tracking",
      "Guided 30-day onboarding sprint",
      "Full Money Date history & trendlines",
      "CSV export",
      "Lifetime access — no subscription",
    ],
  },
};

export const PLUS = {
  name: "TrueNorth Plus",
  price: 19,
  priceSuffix: "/mo",
  tagline: "Not a budget. A decision engine.",
  features: [
    "Ongoing updates as they ship",
    "New modules & engine upgrades",
    "Money Date reminders",
    "Member-only templates & extras",
    "Priority support & requests",
  ],
};

export type Feature =
  | "budget"
  | "goals"
  | "csv_export"
  | "csv_import"
  | "onboarding_sprint"
  | "money_date_history"
  | "reminders"
  | "changelog";

const COMPLETE_FEATURES = new Set<Feature>([
  "budget",
  "goals",
  "csv_export",
  "csv_import",
  "onboarding_sprint",
  "money_date_history",
]);
const PLUS_FEATURES = new Set<Feature>(["reminders", "changelog"]);

export function hasFeature(
  user: { tier: TierId | null; plusActive: boolean },
  feature: Feature,
): boolean {
  if (PLUS_FEATURES.has(feature)) return user.plusActive;
  if (COMPLETE_FEATURES.has(feature)) return user.tier === "COMPLETE";
  return user.tier === "STARTER" || user.tier === "COMPLETE";
}
