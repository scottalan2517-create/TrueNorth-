import Link from "next/link";
import { CalendarHeart, ArrowRight } from "lucide-react";

export function MoneyDateCTA({ daysSinceLast }: { daysSinceLast: number | null }) {
  const due = daysSinceLast === null || daysSinceLast >= 28;

  return (
    <Link
      href="/money-date"
      className="rise-in flex items-center gap-4 rounded-2xl border border-gold/25 bg-gold/8 p-4 active:scale-[0.99] transition-transform"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
        <CalendarHeart size={19} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-navy text-sm">
          {due ? "Your Money Date is due" : "Money Date logged"}
        </p>
        <p className="text-navy/50 text-xs mt-0.5">
          {daysSinceLast === null
            ? "15 minutes to refresh, decide, and log."
            : due
              ? `It's been ${daysSinceLast} days — keep the streak alive.`
              : `Last one was ${daysSinceLast} days ago. Nice.`}
        </p>
      </div>
      <ArrowRight size={16} className="text-gold shrink-0" />
    </Link>
  );
}
