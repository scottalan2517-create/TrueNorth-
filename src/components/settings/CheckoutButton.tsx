"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";

export function CheckoutButton({
  product,
  label,
  variant = "primary",
  defaultEmail,
  dark,
}: {
  product: "STARTER" | "COMPLETE" | "PLUS" | "PLUS_ANNUAL";
  label: string;
  variant?: "primary" | "gold" | "outline";
  defaultEmail?: string;
  dark?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPreorder, setNeedsPreorder] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [preorderSaving, setPreorderSaving] = useState(false);
  const [preorderDone, setPreorderDone] = useState(false);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });
    setLoading(false);
    if (res.status === 501) {
      setNeedsPreorder(true);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setError(data.error ?? "Checkout isn't available right now.");
      return;
    }
    window.location.href = data.url;
  }

  async function submitPreorder(e: React.FormEvent) {
    e.preventDefault();
    setPreorderSaving(true);
    setError(null);
    const res = await fetch("/api/preorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product }),
    });
    setPreorderSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setPreorderDone(true);
  }

  if (preorderDone) {
    return (
      <p className={clsx("text-center text-sm font-semibold", dark ? "text-cream/80" : "text-navy/70")}>
        You&rsquo;re on the list — we&rsquo;ll email you the second checkout is live.
      </p>
    );
  }

  if (needsPreorder) {
    return (
      <form onSubmit={submitPreorder} className="flex flex-col gap-2">
        <p className={clsx("text-xs text-center", dark ? "text-cream/60" : "text-navy/55")}>
          Checkout is being finalized before launch — reserve your spot and we&rsquo;ll email you the
          moment it&rsquo;s live.
        </p>
        <TextInput
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dark={dark}
        />
        {error && <p className="text-xs text-red mt-1 text-center">{error}</p>}
        <Button type="submit" disabled={preorderSaving} variant={variant} className="w-full">
          {preorderSaving ? "Reserving…" : "Reserve my spot"}
        </Button>
      </form>
    );
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
