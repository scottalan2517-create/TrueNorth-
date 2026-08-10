"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { DarkCard, MonoLabel } from "@/components/ui/Card";
import { CheckoutButton } from "@/components/settings/CheckoutButton";
import { PLUS } from "@/lib/tiers";
import { Check } from "lucide-react";

type Billing = "monthly" | "annual";

export function PlusPricingCard({
  plusActive,
  canBuy,
  email,
}: {
  plusActive: boolean;
  canBuy: boolean;
  email: string;
}) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const monthlyEquivalent = Math.round((PLUS.annualPrice / 12) * 100) / 100;

  return (
    <DarkCard>
      <MonoLabel className="text-gold">Add-on · requires Starter or Complete</MonoLabel>
      <p className="font-display text-xl text-cream mt-1">{PLUS.name}</p>
      <p className="text-cream/60 text-sm mt-1">{PLUS.tagline}</p>

      <div className="flex rounded-xl bg-white/5 p-1 mt-4">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={clsx(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
            billing === "monthly" ? "bg-white text-navy" : "text-cream/50",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBilling("annual")}
          className={clsx(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
            billing === "annual" ? "bg-white text-navy" : "text-cream/50",
          )}
        >
          Annual
          <span className="ml-1.5 rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold-soft">Save 17%</span>
        </button>
      </div>

      {billing === "monthly" ? (
        <p className="font-display text-3xl text-cream mt-4">
          ${PLUS.price}
          <span className="text-sm text-cream/50 font-sans"> {PLUS.priceSuffix}</span>
        </p>
      ) : (
        <div className="mt-4">
          <p className="font-display text-3xl text-cream">
            ${PLUS.annualPrice}
            <span className="text-sm text-cream/50 font-sans"> {PLUS.annualPriceSuffix}</span>
          </p>
          <p className="text-xs text-cream/45 mt-1">
            (${monthlyEquivalent.toFixed(2)}/mo, billed once a year)
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-2 mt-4 mb-5">
        {PLUS.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-cream/75">
            <Check size={15} className="text-gold shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {plusActive ? (
        <p className="text-center text-sm font-semibold text-cream/50">Active</p>
      ) : !canBuy ? (
        <p className="text-center text-sm text-cream/50">Buy Starter or Complete first</p>
      ) : (
        <CheckoutButton
          product={billing === "monthly" ? "PLUS" : "PLUS_ANNUAL"}
          label={billing === "monthly" ? "Add Plus" : "Add Plus — billed yearly"}
          variant="gold"
          defaultEmail={email}
          dark
        />
      )}
    </DarkCard>
  );
}
