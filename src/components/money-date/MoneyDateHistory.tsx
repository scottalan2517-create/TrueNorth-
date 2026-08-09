import { format } from "date-fns";
import { Card, MonoLabel } from "@/components/ui/Card";
import { computeStreak } from "@/lib/money-date-streak";

const STAGE_LABEL: Record<string, string> = {
  STABILIZE_AND_ATTACK_DEBT: "Stabilize + Debt",
  SURVIVAL: "Survival",
  PAY_DEBT: "Pay Debt",
  STABILIZE: "Stabilize",
  INVEST: "Invest",
};

interface LogEntry {
  id: string;
  date: Date;
  priorityStage: string;
  note: string;
}

export function MoneyDateHistory({ logs }: { logs: LogEntry[] }) {
  const streak = computeStreak(logs.map((l) => l.date));

  if (logs.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-navy/50 text-sm">
          Your first entry will show up here after your next Money Date.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <MonoLabel className="text-navy/40">History</MonoLabel>
        {streak > 0 && (
          <span className="mono-label text-gold">
            {streak} month{streak === 1 ? "" : "s"} running
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <Card key={log.id} className="py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-navy">{format(log.date, "MMMM yyyy")}</p>
                <p className="text-navy/60 text-sm mt-1 leading-relaxed">{log.note}</p>
              </div>
              <span className="mono-label text-navy/35 shrink-0 whitespace-nowrap">
                {STAGE_LABEL[log.priorityStage] ?? log.priorityStage}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
