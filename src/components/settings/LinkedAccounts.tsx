"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import { Landmark, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LinkedAccountRow {
  id: string;
  name: string;
  mask: string | null;
  currentBalance: number | null;
}

interface PlaidItemRow {
  id: string;
  institutionName: string | null;
  status: string;
  accounts: LinkedAccountRow[];
}

export function LinkedAccounts({ items }: { items: PlaidItemRow[] }) {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      setBusy(true);
      const res = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicToken, institutionName: metadata.institution?.name }),
      });
      setBusy(false);
      setLinkToken(null);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't link that account.");
        return;
      }
      router.refresh();
    },
    onExit: () => setLinkToken(null),
  });

  async function startLink() {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/plaid/link-token", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Bank sync isn't available right now.");
      return;
    }
    setLinkToken(data.linkToken);
  }

  // usePlaidLink only becomes `ready` once the token propagates — open the
  // Link modal exactly once when that happens, not on every render.
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  async function syncNow() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/plaid/sync", { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sync failed.");
      return;
    }
    router.refresh();
  }

  async function disconnect(plaidItemId: string) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/plaid/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plaidItemId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't disconnect.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-navy/50 leading-relaxed">
        Optional. Nothing here replaces your Money Date — it&rsquo;s a shortcut to skip the typing.
        Off by default; your numbers stay manual unless you connect an account.
      </p>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-navy/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Landmark size={15} className="text-navy/40" />
                  <span className="text-sm font-semibold text-navy">
                    {item.institutionName ?? "Linked bank"}
                  </span>
                  {item.status !== "ACTIVE" && (
                    <span className="text-xs text-red">needs reconnecting</span>
                  )}
                </div>
                <button
                  onClick={() => disconnect(item.id)}
                  disabled={busy}
                  aria-label="Disconnect"
                  className="text-navy/35 p-1"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {item.accounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-navy/65">
                      {a.name}
                      {a.mask && <span className="text-navy/35"> ····{a.mask}</span>}
                    </span>
                    <span className="font-mono text-navy">
                      {a.currentBalance != null
                        ? `$${a.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={syncNow} disabled={busy} className="w-full">
            <RefreshCw size={14} /> Sync now
          </Button>
        </div>
      )}

      <Button variant="outline" onClick={startLink} disabled={busy} className="w-full">
        {busy ? "Working…" : items.length > 0 ? "Link another account" : "Link a bank (optional)"}
      </Button>
      {error && <p className="text-xs text-red text-center">{error}</p>}
    </div>
  );
}
