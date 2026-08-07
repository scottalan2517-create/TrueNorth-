import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-2xl border border-navy/8 bg-white p-5", className)}
      {...props}
    />
  );
}

export function DarkCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gold/15 bg-linear-to-b from-[#17294a] to-[#0d1a2e] p-5 text-cream",
        className,
      )}
      {...props}
    />
  );
}

export function MonoLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx("mono-label", className)} {...props} />;
}
