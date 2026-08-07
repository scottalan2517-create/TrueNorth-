import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  suffix?: ReactNode;
  children?: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-navy/80">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-navy/45">{hint}</p>}
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy placeholder:text-navy/35",
        "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

export function DollarInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 font-mono">
        $
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        className={clsx(
          "w-full rounded-xl border border-navy/15 bg-white py-3 pl-8 pr-4 text-base font-mono text-navy placeholder:text-navy/35",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/60",
          className,
        )}
        {...props}
      />
    </div>
  );
}
