"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    setDone(false);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setDone(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Current password" htmlFor="current-password">
        <TextInput
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </Field>
      <Field label="New password" htmlFor="new-password" hint="At least 8 characters">
        <TextInput
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Field>
      {error && <p className="text-xs text-red">{error}</p>}
      {done && <p className="text-xs text-[#4F8F63]">Password updated.</p>}
      <Button
        variant="outline"
        onClick={submit}
        disabled={saving || !currentPassword || newPassword.length < 8}
      >
        {saving ? "Saving…" : "Change password"}
      </Button>
    </div>
  );
}
