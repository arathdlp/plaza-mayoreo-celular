"use client";

import { btnPrimary, btnSecondary, cardStatic, textMuted, textSubtle } from "@/lib/design-system";
import { useCarrito } from "@/hooks/useCarrito";
import { formatoPesos } from "@/lib/format";
import { SPRING_SOFT } from "@/lib/motion-landing";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export type PedidoConfirmadoData = {
  id: number;
  total: number;
  metodo_pago: string | null;
};

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function AnimatedCheck({ reduceMotion }: { reduceMotion: boolean }) {
  const size = 88;
  const r = 36;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <motion.div
      className="relative mx-auto flex h-[88px] w-[88px] items-center justify-center"
      initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING_SOFT}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M28 46 L40 58 L60 34"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </motion.div>
  );
}

function Confetti({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        delay: (i % 10) * 0.08,
        duration: 2.2 + (i % 5) * 0.35,
        size: 5 + (i % 4),
        color: i % 3 === 0 ? "#EAB308" : i % 3 === 1 ? "#0066FF" : "#FBBF24",
      })),
    [],
  );

  if (reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: "-8px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0vh", "95vh"],
            opacity: [0, 1, 1, 0],
            rotate: [0, 180 + (p.id % 4) * 90],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: 0,
          }}
        />
      ))}
    </motion.div>
  );
}

export default function PedidoConfirmadoView({ pedido }: { pedido: PedidoConfirmadoData }) {
  const reduceMotion = useReducedMotion();
  const { vaciar, listo } = useCarrito();

  useEffect(() => {
    if (listo) {
      vaciar();
    }
  }, [listo, vaciar]);

  return (
    <main className="relative flex min-h-[70vh] flex-1 items-center justify-center overflow-hidden bg-white px-4 py-16 sm:px-6 lg:py-24">
      <Confetti reduceMotion={!!reduceMotion} />

      <div className="relative z-[1] w-full max-w-md text-center">
        <AnimatedCheck reduceMotion={!!reduceMotion} />

        <motion.h1
          className="mt-8 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { ...SPRING_SOFT, delay: 0.45 }
          }
        >
          ¡Pedido realizado!
        </motion.h1>

        <motion.p
          className={`mt-3 text-sm ${textMuted}`}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
        >
          Te enviamos un correo con los detalles de tu pedido
        </motion.p>

        <motion.div
          className={`mt-8 ${cardStatic} p-6 text-left sm:p-7`}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <dl className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <dt className={`text-xs font-bold uppercase tracking-[0.14em] ${textSubtle}`}>Pedido</dt>
              <dd className="text-lg font-bold tabular-nums text-[#111827]">#{pedido.id}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <dt className={`text-xs font-bold uppercase tracking-[0.14em] ${textSubtle}`}>Total</dt>
              <dd className="text-xl font-bold tabular-nums text-[#0066FF]">{formatoPesos(pedido.total)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <dt className={`text-xs font-bold uppercase tracking-[0.14em] ${textSubtle}`}>Método de pago</dt>
              <dd className="text-sm font-semibold text-[#111827]">{etiquetaMetodo(pedido.metodo_pago)}</dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.8 }}
        >
          <Link href="/pedidos" className={`h-12 px-8 text-sm ${btnPrimary}`}>
            Ver mis pedidos
          </Link>
          <Link href="/productos" className={`h-12 px-8 text-sm ${btnSecondary}`}>
            Seguir comprando
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
