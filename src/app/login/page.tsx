"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass } from "@/components/ui/Compass";
import { TextInput, Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push(params.get("next") ?? "/dashboard");
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
          <Field label="Password" htmlFor="password" dark>
            <TextInput
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dark
            />
          </Field>
          {error && <p className="text-sm text-red-soft">{error}</p>}
          <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-cream/50 mt-8">
          New here?{" "}
          <Link href="/signup" className="text-gold-soft font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
