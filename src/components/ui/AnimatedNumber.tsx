"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  prefix = "$",
  decimals = 0,
  durationMs = 900,
  className,
}: {
  value: number;
  prefix?: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveDuration = reducedMotion ? 0 : durationMs;

    fromRef.current = display;
    startRef.current = null;
    let raf: number;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = effectiveDuration === 0 ? 1 : Math.min(1, elapsed / effectiveDuration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(fromRef.current + (value - fromRef.current) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  const isNegative = display < 0;
  const formatted = Math.abs(display).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {isNegative ? "-" : ""}
      {prefix}
      {formatted}
    </span>
  );
}
