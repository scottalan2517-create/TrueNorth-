import Link from "next/link";
import { Compass } from "@/components/ui/Compass";
import { LinkButton } from "@/components/ui/Button";
import { TIERS, PLUS } from "@/lib/tiers";
import { Check, X } from "lucide-react";

const PRIORITY_STATES = [
  { dot: "bg-red", name: "Stabilize & Attack Debt", desc: "Emergency + debt" },
  { dot: "bg-red", name: "Survival — build buffer", desc: "No safety net" },
  { dot: "bg-gold", name: "Pay Debt", desc: "High interest" },
  { dot: "bg-gold", name: "Stabilize", desc: "Almost there" },
  { dot: "bg-[#4F8F63]", name: "Invest", desc: "Growth zone" },
];

const PAINS = [
  {
    icon: "📊",
    title: "Your dashboard is passive",
    body: "Net worth trackers, spending charts, pie graphs. They show the past. You still have to figure out the present — alone.",
  },
  {
    icon: "🤷",
    title: "You don't know your priority",
    body: "Should you pay debt or invest? Build an emergency fund or contribute to retirement? Every source says something different.",
  },
  {
    icon: "🔄",
    title: "Systems die after 60 days",
    body: "Not because they're broken — because there's no ritual. No habit. No reason to come back next month.",
  },
  {
    icon: "🧠",
    title: "You carry it in your head",
    body: "The mental load of tracking everything is exhausting. TrueNorth offloads the decisions so you only think about what matters.",
  },
];

const ENGINES = [
  {
    num: "01",
    title: "Projection Engine",
    body: "Compound interest with a reality check. Set your contribution and a consistency factor — see exactly where you'll be in 5 and 10 years.",
    demo: "$50,000 · $500/mo · 85% consistency → $103k in 5 years",
  },
  {
    num: "02",
    title: "Priority Engine",
    body: "A decision tree that puts you in exactly one bucket: Stabilize & Attack Debt → Survival → Pay Debt → Stabilize → Invest. Every bucket has a clear next move.",
    demo: "Updates instantly the moment your numbers change.",
  },
  {
    num: "03",
    title: "Action Panel",
    body: "Reads your surplus and your priority, then allocates every dollar. No guesswork, no spreadsheets — just \"put $800 here.\"",
    demo: '"All $800 to highest interest debt" — that\'s your monthly order.',
  },
  {
    num: "04",
    title: "Fragility Score",
    body: "Emergency fund health at a glance. Fragile → Stable → Strong. One number tells you how safe you actually are.",
    demo: "3+ months of essentials = Strong. Under 1 month = your first priority.",
  },
];

const FAQS = [
  {
    q: "What do I actually get?",
    a: "A real account in the TrueNorth web app — sign up, answer a few questions, and your dashboard is live in about three minutes. Nothing to install, works from your phone.",
  },
  {
    q: "Do I have to link my bank accounts?",
    a: "No. Every number in TrueNorth is one you type in yourself, once a month, during your Money Date. No account-aggregation service ever sees your balances.",
  },
  {
    q: "How long does it take to set up?",
    a: "About three minutes for the initial onboarding. Then fifteen minutes once a month for your Money Date.",
  },
  {
    q: "Is this financial advice?",
    a: "No. TrueNorth is an educational tool. The formulas reflect standard personal finance principles — pay high-interest debt first, build an emergency fund, invest consistently — but we're not financial advisors. Your decisions are your own.",
  },
];

export function LandingPage() {
  return (
    <div className="bg-cream text-navy">
      {/* NAV */}
      <nav className="sticky top-0 z-30 bg-navy border-b border-gold/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Compass size={26} />
            <span className="font-display text-lg text-cream leading-none">TrueNorth</span>
            <span className="mono-label text-gold-soft hidden sm:inline">Decision Engine</span>
          </div>
          <LinkButton href="/signup" variant="gold" size="md">
            Get TrueNorth →
          </LinkButton>
        </div>
      </nav>

      {/* HERO */}
      <header className="bg-navy text-cream pt-14 pb-16 px-5 relative overflow-hidden">
        <div className="mx-auto max-w-2xl">
          <p className="mono-label text-gold mb-4">Your Financial Decision Engine</p>
          <h1 className="font-display text-[2.3rem] leading-[1.08] mb-5">
            Not a tracker.
            <br />
            An <span className="text-gold-soft">operator&rsquo;s manual</span> for your money.
          </h1>
          <p className="text-cream/70 text-lg leading-relaxed mb-4 max-w-md">
            Most finance tools show what you&rsquo;ve already done. TrueNorth shows what to do
            next — with a priority engine, a dollar-by-dollar action plan, and a 15-minute
            monthly ritual.
          </p>
          <p className="mono-label text-gold-soft mb-8">
            ↳ 15 minutes a month · One page · Four engines
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <LinkButton href="/signup" size="lg">
              Get TrueNorth →
            </LinkButton>
            <LinkButton href="#how" variant="outline" size="lg">
              See how it works
            </LinkButton>
          </div>

          <div className="rounded-2xl border border-gold/15 bg-linear-to-b from-[#17294a] to-[#0d1a2e] p-6">
            <p className="mono-label text-gold mb-4">Your Priority Engine</p>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {PRIORITY_STATES.map((s) => (
                <div key={s.name} className="flex items-center gap-3 py-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <span className="font-semibold text-sm text-cream">{s.name}</span>
                  <span className="text-xs text-cream/50 ml-auto text-right">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <div className="bg-navy-deep text-cream/70 py-4 px-5">
        <div className="mx-auto max-w-5xl flex flex-wrap justify-center gap-x-7 gap-y-2 font-mono text-xs">
          <span>🧭 <b className="text-gold-soft">Not a tracker.</b> A decision engine.</span>
          <span>⚡ Works in <b className="text-gold-soft">15 minutes a month</b></span>
          <span>📊 Powered by <b className="text-gold-soft">4 interconnected engines</b></span>
          <span>🔒 <b className="text-gold-soft">You type every number</b> — nothing linked</span>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-lg mb-10">
            <p className="mono-label text-gold mb-3">The Problem</p>
            <h2 className="font-display text-3xl leading-tight mb-3">
              You&rsquo;ve tried tracking.
              <br />
              Now try <em className="not-italic text-red">deciding</em>.
            </h2>
            <p className="text-navy/60 text-lg leading-relaxed">
              Every finance app tracks what you spent. None of them tell you exactly what to do
              next — not in plain dollars and cents.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAINS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-navy/8 bg-white p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-display text-lg mb-1.5">{p.title}</h3>
                <p className="text-navy/55 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-navy text-cream py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-lg mb-10">
            <p className="mono-label text-gold mb-3">The Four Engines</p>
            <h2 className="font-display text-3xl leading-tight mb-3">How TrueNorth works</h2>
            <p className="text-cream/60 text-lg leading-relaxed">
              Four connected tools. One page. Enter your numbers once — the engines do the rest.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {ENGINES.map((e) => (
              <div
                key={e.num}
                className="rounded-2xl border border-gold/15 bg-linear-to-b from-[#17294a] to-[#0d1a2e] p-6"
              >
                <p className="mono-label text-gold mb-2">Engine {e.num}</p>
                <h3 className="font-display text-lg mb-2">{e.title}</h3>
                <p className="text-cream/65 text-sm leading-relaxed mb-3">{e.body}</p>
                <div className="rounded-lg bg-gold/10 p-3 font-mono text-xs text-gold-soft leading-relaxed">
                  {e.demo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <p className="mono-label text-gold mb-3 text-center">Before &amp; After</p>
          <h2 className="font-display text-3xl leading-tight mb-10 text-center">
            Every other tool vs. TrueNorth
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-navy/8 bg-white p-6">
              <span className="inline-block mono-label text-red bg-red/10 rounded-full px-3 py-1 mb-4">
                Every other tool
              </span>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Shows charts of what you already spent",
                  "Leaves you to figure out the priority",
                  "No dollar-by-dollar action plan",
                  "Gets abandoned within 2 months",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-navy/60 py-1 border-b border-navy/6 last:border-0">
                    <X size={15} className="text-red shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-navy text-cream p-6">
              <span className="inline-block mono-label text-gold-soft bg-gold/15 rounded-full px-3 py-1 mb-4">
                TrueNorth
              </span>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Shows what you should do today",
                  "Automatically prioritizes your next move",
                  "Tells you exact dollar amounts for each action",
                  "A 15-minute monthly habit, built into the system",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-cream/75 py-1 border-b border-white/8 last:border-0">
                    <Check size={15} className="text-gold-soft shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-navy text-cream py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-lg mx-auto mb-10">
            <p className="mono-label text-gold mb-3">Pricing</p>
            <h2 className="font-display text-3xl leading-tight mb-3">Pick your path</h2>
            <p className="text-cream/60 text-lg">
              Buy Starter or Complete once. Add Plus if you want ongoing updates.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-start">
            {(["STARTER", "COMPLETE"] as const).map((id) => {
              const tier = TIERS[id];
              const featured = id === "COMPLETE";
              return (
                <div
                  key={id}
                  className={`rounded-2xl border p-7 text-center ${featured ? "border-gold sm:scale-105 bg-linear-to-b from-[#17294a] to-[#0d1a2e]" : "border-gold/15 bg-linear-to-b from-[#17294a] to-[#0d1a2e]"}`}
                >
                  <p className="mono-label text-gold mb-2">{featured ? "Most Complete" : "Starter"}</p>
                  <h3 className="font-display text-xl mb-1">{tier.name}</h3>
                  <p className="font-display text-4xl text-gold-soft my-3">${tier.price}</p>
                  <p className="text-xs text-cream/50 mb-6">{tier.priceSuffix} · own it forever</p>
                  <ul className="flex flex-col gap-2 text-left mb-7">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-cream/70">
                        <Check size={14} className="text-gold-soft shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <LinkButton href="/signup" variant={featured ? "gold" : "outline"} className="w-full justify-center">
                    Get {tier.name.replace("TrueNorth ", "")} →
                  </LinkButton>
                </div>
              );
            })}

            <div className="rounded-2xl border border-gold/15 bg-navy-deep p-7 text-center sm:col-span-3 max-w-md sm:mx-auto w-full">
              <p className="mono-label text-gold mb-2">Add-on · requires Starter or Complete</p>
              <h3 className="font-display text-xl mb-1">{PLUS.name}</h3>
              <p className="font-display text-4xl text-gold-soft my-3">
                ${PLUS.price}
                <span className="text-base font-sans text-cream/50"> {PLUS.priceSuffix}</span>
              </p>
              <ul className="flex flex-col gap-2 text-left mb-7 max-w-xs mx-auto">
                {PLUS.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-cream/70">
                    <Check size={14} className="text-gold-soft shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <LinkButton href="/signup" variant="outline" className="w-full justify-center">
                Add Plus →
              </LinkButton>
            </div>
          </div>

          <p className="text-center text-xs text-cream/40 font-mono mt-8">
            Educational use only · Not financial, investment, or tax advice
          </p>
        </div>
      </section>

      {/* RITUAL */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mono-label text-gold mb-3">The Monthly Ritual</p>
          <h2 className="font-display text-3xl leading-tight mb-4">
            The Money Date
            <br />
            <span className="text-gold">15 minutes a month.</span>
          </h2>
          <p className="text-navy/60 text-lg leading-relaxed max-w-lg mx-auto mb-10">
            Most systems die in 60 days — not because they&rsquo;re broken, but because nobody
            built a habit around them. TrueNorth comes with a built-in ritual so simple it
            sticks.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { phase: "Phase 1 · ~7 min", title: "Refresh", body: "Update your balances to today's numbers. One screen, a handful of fields." },
              { phase: "Phase 2 · ~5 min", title: "Review & Decide", body: "Check your Priority. Did it change? Follow the Action Panel — it tells you exactly where the money goes." },
              { phase: "Phase 3 · ~3 min", title: "Log", body: "Write one sentence. \"March: paid the card down $400, raised contribution to $325.\" Twelve sentences a year tells your story." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-navy/8 bg-white p-6">
                <p className="mono-label text-gold mb-2">{s.phase}</p>
                <h4 className="font-display text-lg mb-1.5">{s.title}</h4>
                <p className="text-navy/55 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="bg-navy text-cream py-14 px-5 text-center">
        <blockquote className="mx-auto max-w-xl font-display italic text-xl text-cream/80 leading-relaxed">
          &ldquo;I built this because I was tired of money systems that looked impressive and got
          abandoned within a month. TrueNorth runs on one promise: fifteen minutes, once a month,
          and you always know where you stand.&rdquo;
          <span className="block not-italic font-sans text-sm text-gold-soft mt-5">
            — The TrueNorth team
          </span>
        </blockquote>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-2xl">
          <p className="mono-label text-gold mb-3 text-center">FAQ</p>
          <h2 className="font-display text-3xl leading-tight mb-10 text-center">
            Questions? We&rsquo;ve got answers.
          </h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-xl border border-navy/8 bg-white px-5 py-4">
                <summary className="font-semibold text-navy cursor-pointer list-none flex justify-between items-center gap-3">
                  {f.q}
                  <span className="text-gold text-xl shrink-0">+</span>
                </summary>
                <p className="text-navy/60 text-sm mt-3 pt-3 border-t border-navy/8 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-deep text-cream/60 py-10 px-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Compass size={20} />
          <span className="font-display text-base text-cream">TrueNorth</span>
        </div>
        <p className="text-sm mb-4">Your financial decision engine.</p>
        <p className="font-mono text-xs text-cream/40 mb-4">
          Educational use only · Not financial, investment, or tax advice
        </p>
        <Link href="/login" className="text-xs text-cream/40 underline">
          Already a member? Sign in
        </Link>
      </footer>
    </div>
  );
}
