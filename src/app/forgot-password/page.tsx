"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass } from "@/components/ui/Compass";
import { TextInput, Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-dvh bg-navy flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rise-in">
        <div className="flex flex-col items-center gap-3 mb-10">
          <Compass size={40} />
          <h1 className="font-display text-2xl text-cream">TrueNorth</h1>
          <p className="mono-label text-gold-soft">Decision Engine</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-cream text-lg font-display mb-2">Check your email</p>
            <p className="text-cream/60 text-sm leading-relaxed">
              If an account exists for <span className="text-cream">{email}</span>, a reset link is on
              its way. It&rsquo;s good for one hour.
            </p>
          </div>
        ) : (
          <>
            <p className="text-cream/60 text-sm mb-6 text-center leading-relaxed">
              Enter your email and we&rsquo;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Email" htmlFor="email" dark>
                <TextInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dark
                />
              </Field>
              {error && <p className="text-sm text-red-soft">{error}</p>}
              <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full mt-2">
                {loading ? "Sending…" : "Send reset link"}
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
