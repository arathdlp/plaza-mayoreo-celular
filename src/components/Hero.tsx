import Link from "next/link";

function HeroIllustration() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md select-none"
      aria-hidden
    >
      <div className="absolute inset-[8%] rounded-[2.5rem] bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-transform duration-500 ease-out hover:scale-[1.02]" />
      <div className="absolute inset-[14%] rounded-[2rem] bg-black shadow-inner" />
      <div className="absolute inset-[18%] rounded-[1.75rem] bg-gradient-to-b from-[#0066FF]/20 to-transparent" />
      <div className="absolute left-1/2 top-[22%] h-[52%] w-[3px] -translate-x-1/2 rounded-full bg-zinc-800/80" />
      <div className="absolute bottom-[26%] left-1/2 h-14 w-14 -translate-x-1/2 rounded-full border-2 border-zinc-600/50" />
      <div
        className="absolute -right-2 top-1/4 h-16 w-16 rounded-2xl bg-[#0066FF] opacity-90 shadow-lg shadow-[#0066FF]/25 transition-transform duration-700 ease-out"
        style={{ animation: "pmc-float 6s ease-in-out infinite" }}
      />
      <div
        className="absolute -left-4 bottom-1/4 h-12 w-12 rounded-xl bg-white shadow-md ring-1 ring-black/5 transition-transform duration-700 ease-out"
        style={{ animation: "pmc-float 7s ease-in-out infinite reverse" }}
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-white px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,102,255,0.12),transparent)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div
          className="max-w-xl"
          style={{ animation: "pmc-fade-up 0.6s ease-out both" }}
        >
          <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Todo para tu Celular en un Solo Lugar
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600 sm:text-xl">
            Accesorios, reparaciones y servicios con entrega rápida en Morelia
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#productos"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0052cc] active:scale-[0.98]"
            >
              Ver Productos
            </Link>
            <Link
              href="#servicios"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium text-black transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
            >
              Solicitar Servicio
            </Link>
          </div>
        </div>
        <div
          className="flex justify-center lg:justify-end"
          style={{ animation: "pmc-fade-up 0.7s ease-out 0.1s both" }}
        >
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
