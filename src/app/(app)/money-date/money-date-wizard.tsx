"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { SnapshotForm } from "@/components/forms/SnapshotForm";
import { Button } from "@/components/ui/Button";
import { Card, DarkCard, MonoLabel } from "@/components/ui/Card";
import type { PriorityResult } from "@/lib/engines/priority";
import type { ActionItem } from "@/lib/engines/action";

const PHASES = ["Refresh", "Review & Decide", "Log"];

export function MoneyDateWizard({
  latest,
  priority,
  actionItems,
  logCount,
}: {
  latest: Record<string, number> | null;
  priority: PriorityResult;
  actionItems: ActionItem[];
  logCount: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submitLog() {
    if (!note.trim()) return;
    setLoading(true);
    await fetch("/api/money-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priorityStage: priority.stage, note: note.trim() }),
    });
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rise-in flex flex-col items-center text-center gap-4 py-10">
        <p className="font-display text-2xl text-navy">Logged.</p>
        <p className="text-navy/55 max-w-xs">
          That&rsquo;s entry {logCount + 1}. {logCount + 1 >= 12 ? "A full year told." : `${12 - logCount - 1} more tells the year’s story.`}
        </p>
        <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1.5">
        {PHASES.map((p, i) => (
          <div key={p} className={clsx("h-1 flex-1 rounded-full", i <= phase ? "bg-gold" : "bg-navy/10")} />
        ))}
      </div>
      <p className="mono-label text-navy/40">
        Phase {phase + 1} · {PHASES[phase]}
      </p>

      {phase === 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-navy/60 text-sm">
            Update your balances to today&rsquo;s numbers. One row, ~7 minutes.
          </p>
          <SnapshotForm latest={latest} defaultOpen hideToggle onSaved={() => setPhase(1)} />
          <button onClick={() => setPhase(1)} className="text-sm text-navy/40 self-center">
            Numbers haven&rsquo;t changed — skip
          </button>
        </div>
      )}

      {phase === 1 && (
        <div className="flex flex-col gap-4">
          <DarkCard>
            <MonoLabel className="text-gold mb-1">Your Priority</MonoLabel>
            <p className="font-display text-xl text-cream">{priority.title}</p>
            <p className="text-cream/60 text-sm mt-1">{priority.nextMove}</p>
          </DarkCard>
          <Card>
            <MonoLabel className="text-navy/40 mb-2 block">This Month&rsquo;s Action</MonoLabel>
            <div className="flex flex-col divide-y divide-navy/8">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <p className="text-sm text-navy">{item.label}</p>
                  <p className="font-mono text-sm font-semibold text-navy">${item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
          <Button onClick={() => setPhase(2)} size="lg">
            I&rsquo;ve decided — log it →
          </Button>
        </div>
      )}

      {phase === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-navy/60 text-sm">
            One sentence. &ldquo;March: paid the card down $400, raised contribution to $325.&rdquo;
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="This month I..."
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy placeholder:text-navy/35 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <Button onClick={submitLog} disabled={loading || !note.trim()} size="lg">
            {loading ? "Saving…" : "Finish Money Date"}
          </Button>
        </div>
      )}
    </div>
  );
}
