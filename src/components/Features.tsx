"use client";

import ScrollReveal from "@/components/ScrollReveal";

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
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#050508] via-[#0c1020] to-[#06060a] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,102,255,0.2), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Por qué elegirnos
          </h2>
          <p className="mt-3 max-w-xl text-lg font-normal text-white/55">
            La experiencia que esperas de un partner tecnológico serio.
          </p>
        </ScrollReveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.title} className="h-full">
              <ScrollReveal delayMs={index * 75} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ease-out hover:border-[#0066FF]/35 hover:bg-white/[0.09] hover:shadow-[0_16px_48px_-12px_rgba(0,102,255,0.15)]">
                  <div className="pmc-icon-animate flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/15 ring-1 ring-[#0066FF]/20 transition-transform duration-300 group-hover:scale-110 group-hover:ring-[#0066FF]/40">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-normal leading-relaxed text-white/60">{item.text}</p>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
