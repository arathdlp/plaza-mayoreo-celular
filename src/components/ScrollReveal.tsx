"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  /** 0–1, fraction of element visible before triggering */
  threshold?: number;
};

export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`pmc-reveal ${visible ? "pmc-reveal-visible" : ""} ${className}`}
      style={
        visible
          ? ({ transitionDelay: `${delayMs}ms` } satisfies CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
