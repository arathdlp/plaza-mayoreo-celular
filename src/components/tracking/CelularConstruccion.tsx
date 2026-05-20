"use client";

import type { EstadoEnvio } from "@/types/envio";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle } from "lucide-react";

type Props = {
  estado: EstadoEnvio | "preparando" | "asignado";
  className?: string;
};

const BLUE = "#0066FF";
const PENDING = "#E5E7EB";

function levelForEstado(estado: Props["estado"]): number {
  if (estado === "entregado") return 5;
  if (estado === "llegando") return 4;
  if (estado === "en_camino") return 3;
  if (estado === "preparando" || estado === "asignado") return 2;
  return 1;
}

function draw(level: number, minLevel: number, reduceMotion: boolean) {
  const done = level >= minLevel;
  return {
    stroke: done ? BLUE : PENDING,
    initial: reduceMotion ? false : { pathLength: done ? 0 : 1, opacity: 0.7 },
    animate: { pathLength: 1, opacity: done ? 1 : 0.45 },
    transition: { duration: done ? 0.75 : 0.2, ease: "easeOut" as const },
  };
}

export default function CelularConstruccion({ estado, className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const level = levelForEstado(estado);

  return (
    <div className={`relative mx-auto aspect-[2/3] w-full max-w-[220px] ${className}`}>
      <svg viewBox="0 0 200 300" className="h-full w-full" role="img" aria-label="Estado visual del pedido">
        <motion.rect
          x="36"
          y="16"
          width="128"
          height="268"
          rx="24"
          fill="none"
          strokeWidth="7"
          {...draw(level, 1, Boolean(reduceMotion))}
        />
        <motion.rect
          x="50"
          y="42"
          width="100"
          height="190"
          rx="12"
          fill={level >= 2 ? `${BLUE}14` : "transparent"}
          strokeWidth="5"
          {...draw(level, 2, Boolean(reduceMotion))}
        />
        <motion.path
          d="M60 244h80"
          fill="none"
          strokeLinecap="round"
          strokeWidth="6"
          {...draw(level, 2, Boolean(reduceMotion))}
        />
        <motion.rect
          x="64"
          y="78"
          width="72"
          height="116"
          rx="12"
          fill="none"
          strokeWidth="5"
          {...draw(level, 3, Boolean(reduceMotion))}
        />
        <motion.path
          d="M86 92h28M82 180h36"
          fill="none"
          strokeLinecap="round"
          strokeWidth="5"
          {...draw(level, 3, Boolean(reduceMotion))}
        />
        <motion.circle
          cx="126"
          cy="68"
          r="12"
          fill={level >= 4 ? `${BLUE}18` : "transparent"}
          strokeWidth="5"
          {...draw(level, 4, Boolean(reduceMotion))}
        />
        <motion.circle
          cx="144"
          cy="68"
          r="4"
          fill={level >= 4 ? BLUE : PENDING}
          initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: level >= 4 ? 1 : 0.35 }}
          transition={{ duration: 0.35 }}
        />
        <motion.path
          d="M29 88v42M171 96v52M171 166v34"
          fill="none"
          strokeLinecap="round"
          strokeWidth="6"
          {...draw(level, 4, Boolean(reduceMotion))}
        />
      </svg>

      {level >= 5 ? (
        <motion.div
          initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
          animate={{ scale: [1, 1.08, 1], opacity: 1 }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-white p-3 shadow-xl ring-1 ring-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-500" strokeWidth={2.2} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
