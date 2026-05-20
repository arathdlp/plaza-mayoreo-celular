"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  suffix?: string;
  className?: string;
};

export function NumberTicker({ value, suffix = "", className = "" }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const started = performance.now();
    const duration = 450;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(start + diff * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [display, value]);

  return (
    <span className={className}>
      {Math.max(0, Math.round(display))}
      {suffix}
    </span>
  );
}
