"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const TITLE_WORDS = [
  { text: "Todo", accent: false },
  { text: "para", accent: false },
  { text: "tu", accent: false },
  { text: "Celular", accent: true },
] as const;

const WORD_STAGGER = 0.15;
const TITLE_END_DELAY = TITLE_WORDS.length * WORD_STAGGER + 0.35;

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
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
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

  return (
    <section
      id="inicio"
      className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="flex flex-wrap items-baseline justify-center gap-x-[0.28em] gap-y-1">
          {TITLE_WORDS.map((word, index) => (
            <motion.span
              key={word.text}
              className={`text-6xl font-extrabold leading-[1.05] tracking-tight lg:text-8xl ${
                word.accent ? "text-[#0066FF]" : "text-[#111827]"
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * WORD_STAGGER,
                ease: EASE_OUT,
              }}
            >
              {word.text}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-xl font-medium leading-relaxed text-[#6B7280]"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: TITLE_END_DELAY,
            ease: EASE_OUT,
          }}
        >
          Refacciones, reparaciones y servicios con entrega en Morelia
        </motion.p>

        <HeroTicker />

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: TITLE_END_DELAY + 0.25,
            ease: EASE_OUT,
          }}
        >
          <Link
            href="#productos"
            className="inline-flex items-center justify-center rounded-full bg-[#0066FF] px-8 py-4 text-base font-bold text-white shadow-md shadow-[#0066FF]/20 transition-colors duration-300 ease-out hover:bg-[#3385ff] active:scale-[0.98]"
          >
            Ver Productos
          </Link>
          <Link
            href="#servicios"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-bold text-[#111827] transition-all duration-300 ease-out hover:bg-gray-50 active:scale-[0.98]"
          >
            Solicitar Servicio
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
