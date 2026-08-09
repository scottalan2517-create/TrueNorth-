import { requireUser } from "@/lib/auth";
import { Card, MonoLabel } from "@/components/ui/Card";
import { CheckoutButton } from "@/components/settings/CheckoutButton";
import { PlusPricingCard } from "@/components/settings/PlusPricingCard";
import { TIERS } from "@/lib/tiers";
import { Check } from "lucide-react";

export default async function UpgradePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Plans</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">Pick your path</h1>
      </div>

      {(["STARTER", "COMPLETE"] as const).map((id) => {
        const tier = TIERS[id];
        const owned = user.tier === id || (id === "STARTER" && user.tier === "COMPLETE");
        return (
          <Card key={id} className={id === "COMPLETE" ? "border-gold/40" : undefined}>
            <MonoLabel className="text-gold">{id === "COMPLETE" ? "Most complete" : "Starter"}</MonoLabel>
            <p className="font-display text-xl text-navy mt-1">{tier.name}</p>
            <p className="text-navy/50 text-sm mt-1">{tier.tagline}</p>
            <p className="font-display text-3xl text-navy mt-3">
              ${tier.price}
              <span className="text-sm text-navy/40 font-sans"> {tier.priceSuffix}</span>
            </p>
            <ul className="flex flex-col gap-2 mt-4 mb-5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-navy/70">
                  <Check size={15} className="text-gold shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {owned && user.tier === id ? (
              <p className="text-center text-sm font-semibold text-navy/40">Your current plan</p>
            ) : (
              <CheckoutButton product={id} label={`Get ${tier.name.replace("TrueNorth ", "")}`} variant={id === "COMPLETE" ? "gold" : "outline"} />
            )}
          </Card>
        );
      })}

      <PlusPricingCard plusActive={user.plusActive} canBuy={!!user.tier} />

      <p className="text-center text-xs text-navy/35 font-mono">
        Educational use only · Not financial, investment, or tax advice
      </p>
    </div>
  );
}
