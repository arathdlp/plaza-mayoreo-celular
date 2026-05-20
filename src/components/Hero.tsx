"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const TICKER_TEXT =
  "Pantallas · Baterías · Tapas Traseras · Placas de Carga · Accesorios · Celulares · ";

const EASE_OUT = [0, 0, 0.2, 1] as const;

function HeroTicker() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <p className="mt-14 text-center text-lg font-medium text-gray-300" aria-hidden>
        {TICKER_TEXT.replace(/ · $/, "")}
      </p>
    );
  }

  return (
    <div className="relative mt-14 w-full overflow-hidden border-y border-gray-100 py-5" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <motion.div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="shrink-0 px-8 text-lg font-medium tracking-wide text-gray-300"
          >
            {TICKER_TEXT.repeat(2)}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const titleDelay = reduceMotion ? 0 : 0.35;

  return (
    <section
      id="inicio"
      className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
          <motion.span
            className="block text-[#111827]"
            style={{ fontWeight: 800 }}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            Todo para tu
          </motion.span>
          <motion.span
            className="mt-1 block text-[#0066FF]"
            style={{ fontWeight: 800 }}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: EASE_OUT }}
          >
            Celular
          </motion.span>
        </h1>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-xl font-medium leading-relaxed text-[#6B7280] sm:text-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: titleDelay, ease: EASE_OUT }}
        >
          Refacciones, reparaciones y servicios con entrega en Morelia
        </motion.p>

        <HeroTicker />

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: titleDelay + 0.25, ease: EASE_OUT }}
        >
          <Link
            href="/productos"
            className="inline-flex items-center justify-center rounded-full bg-[#0066FF] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#3385ff] hover:shadow-xl active:scale-[0.98]"
          >
            Ver Productos
          </Link>
          <Link
            href="/servicios"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-bold text-[#111827] shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#0066FF]/30 hover:shadow-md active:scale-[0.98]"
          >
            Solicitar Servicio
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
