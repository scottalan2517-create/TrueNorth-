"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export function StrategyToggle({ strategy }: { strategy: "AVALANCHE" | "SNOWBALL" }) {
  const router = useRouter();
  const [current, setCurrent] = useState(strategy);
  const [loading, setLoading] = useState(false);

  async function set(next: "AVALANCHE" | "SNOWBALL") {
    if (next === current || loading) return;
    setCurrent(next);
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoffStrategy: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex rounded-xl bg-navy/5 p-1">
      {(["AVALANCHE", "SNOWBALL"] as const).map((s) => (
        <button
          key={s}
          onClick={() => set(s)}
          className={clsx(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
            current === s ? "bg-white text-navy shadow-sm" : "text-navy/45",
          )}
        >
          {s === "AVALANCHE" ? "Avalanche" : "Snowball"}
        </button>
      ))}
    </div>
  );
}
