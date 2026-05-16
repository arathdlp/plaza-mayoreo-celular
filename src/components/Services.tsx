"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import ScrollReveal, { staggerContainer, staggerItem } from "@/components/ScrollReveal";

const iconClass = "text-[#0066FF]";

const services = [
  {
    title: "Desbloqueos y Liberaciones",
    description:
      "Liberamos tu equipo para cualquier compañía con proceso seguro y respaldo.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="M7 11V8a5 5 0 0 1 9.9-1"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.65" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Instalaciones a Domicilio",
    description:
      "Pantallas, baterías y accesorios instalados donde tú estés en Morelia.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Reparaciones",
    description:
      "Diagnóstico claro y reparación profesional de placas, carga, audio y más.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="m14.7 6.3 1.4 1.4L8.8 15H7v-1.8l7.7-7.7ZM4 20h16"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Asesorías Técnicas",
    description:
      "Te orientamos en compra de refacciones, compatibilidad y mantenimiento.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="M12 3C7 3 3 6.5 3 11c0 2.5 1.2 4.7 3 6v4l4-2c1 .3 2 .5 3 .5 5 0 9-3.5 9-8s-4-8.5-9-8.5Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export default function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="servicios"
      className="border-t border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Servicios</h2>
            <p className="mt-3 text-lg font-medium text-gray-600">
              Soluciones técnicas para tu negocio o uso personal.
            </p>
          </div>
        </ScrollReveal>

        <motion.ul
          className="mt-10 grid gap-5 sm:grid-cols-2"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
        >
          {services.map((s) => (
            <motion.li key={s.title} variants={reduceMotion ? undefined : staggerItem} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 transition-shadow duration-[600ms] ease-out hover:shadow-[0_12px_40px_-12px_rgba(17,24,39,0.1)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-[#0066FF]/5">
                  {s.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-gray-900">{s.title}</h3>
                <p className="mt-3 flex-1 font-medium leading-relaxed text-gray-600">{s.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <ScrollReveal delayMs={120}>
          <div
            id="capacitaciones"
            className="mt-12 scroll-mt-24 rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10"
          >
            <h3 className="text-xl font-bold tracking-tight text-gray-900">Capacitaciones</h3>
            <p className="mt-3 max-w-2xl font-medium leading-relaxed text-gray-600">
              Cursos prácticos de reparación, microsoldadura y atención al cliente para que lleves tu
              taller al siguiente nivel.
            </p>
            <Link
              href="#contacto"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-bold text-white shadow-md shadow-[#0066FF]/20 transition-colors duration-[600ms] ease-out hover:bg-[#3385ff] active:scale-[0.98]"
            >
              Solicitar información
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
