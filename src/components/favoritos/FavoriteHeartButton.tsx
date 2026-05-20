"use client";

import { useFavoritos } from "@/hooks/useFavoritos";
import { appToast } from "@/lib/toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
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
    if (wasActive) appToast.favoritoQuitado();
    else appToast.favoritoAgregado();
    if (!wasActive && !reduceMotion) {
      setBurst(true);
      setPulseKey((k) => k + 1);
      window.setTimeout(() => setBurst(false), 550);
    }
  }

  return (
    <motion.button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={active}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      className={`pointer-events-auto absolute right-2 top-2 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200/70 transition-colors duration-200 hover:text-[#0066FF] sm:right-3 sm:top-3 ${className}`}
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
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#0066FF]"
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
          className="pointer-events-none absolute inset-0 rounded-full bg-[#0066FF]/20"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          aria-hidden
        />
      ) : null}

      <motion.span
        aria-hidden
        className="relative z-[1] flex items-center justify-center"
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
        <Heart
          className="h-5 w-5"
          fill={active ? "#0066FF" : "none"}
          stroke={active ? "#0066FF" : "currentColor"}
          strokeWidth={2}
        />
      </motion.span>
    </motion.button>
  );
}
