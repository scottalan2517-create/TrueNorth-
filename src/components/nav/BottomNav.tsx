"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, TrendingUp, CreditCard, Wallet, Target } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/net-worth", label: "Net Worth", icon: TrendingUp },
  { href: "/debt", label: "Debt", icon: CreditCard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-gold/10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={clsx(active ? "text-gold" : "text-cream/40")}
              />
              <span className={clsx(active ? "text-gold" : "text-cream/40")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
