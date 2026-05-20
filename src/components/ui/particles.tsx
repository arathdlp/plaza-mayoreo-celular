"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#0066FF", "#10B981", "#F59E0B"];

export function Particles({ count = 24 }: { count?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: `${(i * 23) % 100}%`,
            top: `${20 + ((i * 17) % 60)}%`,
            backgroundColor: COLORS[i % COLORS.length],
          }}
          initial={{ opacity: 0, scale: 0.5, y: 12 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.7], y: [-4, -42] }}
          transition={{ duration: 2.2, delay: (i % 8) * 0.12, repeat: Infinity, repeatDelay: 1.6 }}
        />
      ))}
    </div>
  );
}
