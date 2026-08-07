"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Billing portal isn't available right now.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <Button onClick={go} disabled={loading} variant="outline" className="w-full">
        {loading ? "Redirecting…" : "Manage billing"}
      </Button>
      {error && <p className="text-xs text-red mt-2 text-center">{error}</p>}
    </div>
  );
}
