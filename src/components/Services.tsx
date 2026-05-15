"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  {
    title: "Desbloqueos y Liberaciones",
    description:
      "Liberamos tu equipo para cualquier compañía con proceso seguro y respaldo.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
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
  return (
    <section
      id="servicios"
      className="border-t border-zinc-200/80 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Servicios
            </h2>
            <p className="mt-3 text-lg font-normal text-zinc-600">
              Soluciones técnicas para tu negocio o uso personal.
            </p>
          </div>
        </ScrollReveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {services.map((s, index) => {
            const dark = (Math.floor(index / 2) + index) % 2 === 0;
            return (
              <li key={s.title} className="h-full">
                <ScrollReveal delayMs={index * 90} className="h-full">
                  <div
                    className={`flex h-full flex-col rounded-2xl border p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:shadow-[0_12px_40px_-8px_rgba(0,102,255,0.12)] ${
                      dark
                        ? "border-white/10 bg-gradient-to-br from-[#12121c] to-[#1a1a2e] text-white"
                        : "border-zinc-200/90 bg-zinc-50 text-black"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0066FF] shadow-md shadow-[#0066FF]/25">
                      {s.icon}
                    </div>
                    <h3
                      className={`mt-5 text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-black"}`}
                    >
                      {s.title}
                    </h3>
                    <p
                      className={`mt-3 flex-1 leading-relaxed ${dark ? "text-white/65" : "text-zinc-600"}`}
                    >
                      {s.description}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>

        <ScrollReveal delayMs={120}>
          <div
            id="capacitaciones"
            className="mt-12 scroll-mt-24 rounded-2xl border border-[#0066FF]/30 bg-gradient-to-br from-[#0a1628] to-[#12121c] p-8 shadow-[0_8px_32px_-8px_rgba(0,102,255,0.2)] sm:p-10"
          >
            <h3 className="text-xl font-semibold tracking-tight text-white">Capacitaciones</h3>
            <p className="mt-3 max-w-2xl font-normal leading-relaxed text-white/70">
              Cursos prácticos de reparación, microsoldadura y atención al cliente para que lleves tu
              taller al siguiente nivel.
            </p>
            <Link
              href="#contacto"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-xl active:scale-[0.97]"
            >
              Solicitar información
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
