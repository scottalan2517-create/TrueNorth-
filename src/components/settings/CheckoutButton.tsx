"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CheckoutButton({
  product,
  label,
  variant = "primary",
}: {
  product: "STARTER" | "COMPLETE" | "PLUS" | "PLUS_ANNUAL";
  label: string;
  variant?: "primary" | "gold" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Checkout isn't available right now.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <Button onClick={go} disabled={loading} variant={variant} className="w-full">
        {loading ? "Redirecting…" : label}
      </Button>
      {error && <p className="text-xs text-red mt-2 text-center">{error}</p>}
    </div>
  );
}
