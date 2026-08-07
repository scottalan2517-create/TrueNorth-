import Link from "next/link";
import { Settings, CalendarHeart } from "lucide-react";
import { Compass } from "@/components/ui/Compass";

export function TopBar({ firstName }: { firstName?: string | null }) {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-navy/8">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3.5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Compass size={22} />
          <span className="font-display text-lg text-navy leading-none">TrueNorth</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/money-date"
            className="p-2 rounded-full text-navy/50 hover:text-gold hover:bg-navy/5"
            aria-label="Start Money Date"
          >
            <CalendarHeart size={19} />
          </Link>
          <Link
            href="/settings"
            className="p-2 rounded-full text-navy/50 hover:text-gold hover:bg-navy/5"
            aria-label="Settings"
          >
            <Settings size={19} />
          </Link>
        </div>
      </div>
      {firstName && (
        <div className="sr-only">Signed in as {firstName}</div>
      )}
    </header>
  );
}
