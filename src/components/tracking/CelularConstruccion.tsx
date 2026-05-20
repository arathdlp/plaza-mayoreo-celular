"use client";

import type { EstadoEnvio } from "@/types/envio";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type CelularVisualEstado =
  | "pendiente"
  | "preparando"
  | "en_camino"
  | "llegando"
  | "entregado";

type Props = {
  visualEstado: CelularVisualEstado;
  className?: string;
};

const BLUE = "#0066FF";
const PENDING = "#E5E7EB";

/** Combina estado del pedido y del envío para la animación del celular. */
export function mapCelularVisualEstado(
  pedidoEstado: string | null | undefined,
  envioEstado: EstadoEnvio,
): CelularVisualEstado {
  if (envioEstado === "entregado") return "entregado";
  if (envioEstado === "llegando") return "llegando";
  if (envioEstado === "en_camino") return "en_camino";
  if (pedidoEstado === "preparando" || pedidoEstado === "asignado") return "preparando";
  if (pedidoEstado === "enviado") return "en_camino";
  return "pendiente";
}

function stageRank(estado: CelularVisualEstado): number {
  switch (estado) {
    case "pendiente":
      return 1;
    case "preparando":
      return 2;
    case "en_camino":
      return 3;
    case "llegando":
      return 4;
    case "entregado":
      return 5;
    default:
      return 1;
  }
}

export default function CelularConstruccion({ visualEstado, className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const [devEstado, setDevEstado] = useState<CelularVisualEstado | null>(null);
  const active = devEstado ?? visualEstado;
  const rank = stageRank(active);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[TRACKING] CelularConstruccion estado:", active);
    }
  }, [active]);

  const blue = (min: number) => (rank >= min ? BLUE : PENDING);
  const fillBlue = (min: number, alpha = "18") => (rank >= min ? `${BLUE}${alpha}` : "transparent");
  const visible = (min: number) => rank >= min;

  return (
    <div className={`relative mx-auto w-full max-w-[220px] ${className}`}>
      {process.env.NODE_ENV === "development" ? (
        <div className="mb-3 flex flex-wrap justify-center gap-1">
          {(["pendiente", "preparando", "en_camino", "llegando", "entregado"] as CelularVisualEstado[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDevEstado(s)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  active === s ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
      ) : null}

      <motion.svg
        key={active}
        viewBox="0 0 200 300"
        className="aspect-[2/3] h-auto w-full"
        role="img"
        aria-label={`Estado visual: ${active}`}
        initial={reduceMotion ? false : { opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <rect
          x="36"
          y="16"
          width="128"
          height="268"
          rx="24"
          fill="none"
          stroke={blue(1)}
          strokeWidth="7"
        />
        <rect
          x="50"
          y="42"
          width="100"
          height="190"
          rx="12"
          fill={fillBlue(2)}
          stroke={blue(2)}
          strokeWidth="5"
          opacity={visible(2) ? 1 : 0}
        />
        <path
          d="M60 244h80"
          fill="none"
          stroke={blue(2)}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={visible(2) ? 1 : 0}
        />
        <rect
          x="64"
          y="78"
          width="72"
          height="116"
          rx="12"
          fill={fillBlue(3, "22")}
          stroke={blue(3)}
          strokeWidth="5"
          opacity={visible(3) ? 1 : 0}
        />
        <path
          d="M86 92h28M82 180h36"
          fill="none"
          stroke={blue(3)}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={visible(3) ? 1 : 0}
        />
        <circle
          cx="126"
          cy="68"
          r="12"
          fill={fillBlue(4)}
          stroke={blue(4)}
          strokeWidth="5"
          opacity={visible(4) ? 1 : 0}
        />
        <circle
          cx="144"
          cy="68"
          r="4"
          fill={rank >= 4 ? BLUE : PENDING}
          opacity={visible(4) ? 1 : 0}
        />
        <path
          d="M29 88v42M171 96v52M171 166v34"
          fill="none"
          stroke={blue(4)}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={visible(4) ? (rank >= 5 ? 1 : 0.55) : 0}
        />
      </motion.svg>

      {rank >= 5 ? (
        <motion.div
          initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
          animate={{ scale: [1, 1.08, 1], opacity: 1 }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.2 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-white p-3 shadow-xl ring-1 ring-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-500" strokeWidth={2.2} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
