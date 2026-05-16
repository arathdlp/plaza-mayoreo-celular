"use client";

import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal, { staggerContainer, staggerItem } from "@/components/ScrollReveal";

function IconMapPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBadge() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeadset() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <path
        d="M3 11v2a4 4 0 0 0 4 4h1M21 11v2a4 4 0 0 1-4 4h-1M7 11V9a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const items = [
  {
    title: "Envío con tracking en tiempo real",
    text: "Sigue tu pedido en vivo por GPS, estilo Rappi, hasta la puerta de tu negocio.",
    icon: <IconMapPin />,
  },
  {
    title: "Pagos seguros",
    text: "Procesamos pagos con estándares modernos para que compres con tranquilidad.",
    icon: <IconShield />,
  },
  {
    title: "Garantía en productos",
    text: "Refacciones y accesorios con respaldo para que inviertas con confianza.",
    icon: <IconBadge />,
  },
  {
    title: "Soporte técnico",
    text: "Equipo listo para resolver dudas de compatibilidad e instalación.",
    icon: <IconHeadset />,
  },
] as const;

export default function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Por qué elegirnos
            </h2>
            <p className="mt-3 text-lg font-medium text-gray-600">
              La experiencia que esperas de un partner tecnológico serio.
            </p>
          </div>
        </ScrollReveal>

        <motion.ul
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
        >
          {items.map((item) => (
            <motion.li key={item.title} variants={reduceMotion ? undefined : staggerItem} className="h-full">
              <motion.div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.1)] transition-all duration-[600ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(17,24,39,0.14)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/8">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">{item.text}</p>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
