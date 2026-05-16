"use client";

import { useFavoritos } from "@/hooks/useFavoritos";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type FavoriteHeartButtonProps = {
  productoId: number;
  className?: string;
};

const BURST_ANGLES = [0, 60, 120, 180, 240, 300];

export default function FavoriteHeartButton({
  productoId,
  className = "",
}: FavoriteHeartButtonProps) {
  const { esFavorito, toggle } = useFavoritos();
  const active = esFavorito(productoId);
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const wasActive = active;
    await toggle(productoId);
    if (!wasActive && !reduceMotion) {
      setBurst(true);
      setPulseKey((k) => k + 1);
      window.setTimeout(() => setBurst(false), 550);
    }
  }

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={active}
      className={`pointer-events-auto absolute right-2 top-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-colors duration-200 hover:text-red-500 sm:right-3 sm:top-3 ${className}`}
      onClick={handleClick}
    >
      <AnimatePresence>
        {burst && !reduceMotion
          ? BURST_ANGLES.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * 14;
              const y = Math.sin(rad) * 14;
              return (
                <motion.span
                  key={deg}
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-red-400"
                  initial={{ opacity: 0.9, scale: 0.4, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.2, x, y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  aria-hidden
                />
              );
            })
          : null}
      </AnimatePresence>

      {active && !reduceMotion ? (
        <motion.span
          key={pulseKey}
          className="pointer-events-none absolute inset-0 rounded-full bg-red-400/25"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          aria-hidden
        />
      ) : null}

      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden
        className="relative z-[1]"
        initial={false}
        animate={
          reduceMotion
            ? { scale: 1 }
            : active
              ? { scale: [1.3, 1] }
              : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <path
          d="M12 20.25l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5 4 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18 3 20 5 20 7.5c0 3.78-3.4 6.86-8.55 11.43L12 20.25z"
          fill={active ? "#ef4444" : "none"}
          stroke={active ? "#ef4444" : "currentColor"}
          strokeWidth="1.75"
        />
      </motion.svg>
    </button>
  );
}
