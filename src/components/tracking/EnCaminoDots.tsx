"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function EnCaminoDots({ label = "En camino" }: { label?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066FF]">
      {label}
      {!reduceMotion ? (
        <span className="inline-flex w-5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-[#0066FF]"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            >
              .
            </motion.span>
          ))}
        </span>
      ) : (
        <span aria-hidden>…</span>
      )}
    </span>
  );
}
