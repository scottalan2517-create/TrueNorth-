"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass } from "@/components/ui/Compass";
import { TextInput, Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-navy flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rise-in">
        <div className="flex flex-col items-center gap-3 mb-10">
          <Compass size={40} />
          <h1 className="font-display text-2xl text-cream">TrueNorth</h1>
          <p className="mono-label text-gold-soft">Decision Engine</p>
        </div>

        {!token ? (
          <p className="text-center text-cream/60 text-sm leading-relaxed">
            This reset link is missing its token.{" "}
            <Link href="/forgot-password" className="text-gold-soft font-medium">
              Request a new one
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="text-cream/60 text-sm mb-6 text-center leading-relaxed">
              Choose a new password for your account.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="New password" htmlFor="password" hint="At least 8 characters" dark>
                <TextInput
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dark
                />
              </Field>
              <Field label="Confirm password" htmlFor="confirm" dark>
                <TextInput
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  dark
                />
              </Field>
              {error && <p className="text-sm text-red-soft">{error}</p>}
              <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full mt-2">
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-cream/50 mt-8">
          <Link href="/login" className="text-gold-soft font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
