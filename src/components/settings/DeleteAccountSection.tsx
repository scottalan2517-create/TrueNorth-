"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-red">
        Delete account
      </button>
    );
  }

  async function confirmDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-navy/60">
        This permanently deletes your account and every number you&rsquo;ve entered — net
        worth history, debts, budget, goals, linked banks. There is no undo.
      </p>
      <Field label="Confirm your password" htmlFor="delete-password">
        <TextInput
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && <p className="text-xs text-red">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button onClick={confirmDelete} disabled={loading || !password} className="flex-1">
          {loading ? "Deleting…" : "Delete permanently"}
        </Button>
      </div>
    </div>
  );
}
