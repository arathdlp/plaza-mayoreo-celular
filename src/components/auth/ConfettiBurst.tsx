"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#0066FF", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

type Props = {
  active?: boolean;
};

export default function ConfettiBurst({ active = true }: Props) {
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 420,
        y: 120 + Math.random() * 280,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.35,
        duration: 1.1 + Math.random() * 0.8,
        color: COLORS[i % COLORS.length]!,
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  if (!active || reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-[38%] rounded-sm"
          style={{
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.6, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
