import Link from "next/link";

const PARTICLES = Array.from({ length: 56 }, (_, i) => {
  const a = (i * 9301 + 49297) % 233280 / 233280;
  const b = (i * 49297 + 9301) % 233280 / 233280;
  return {
    left: `${5 + a * 90}%`,
    top: `${5 + b * 90}%`,
    size: 1 + (i % 3),
    delay: (i % 8) * 0.35,
    duration: 3.5 + (i % 4) * 0.8,
  };
});

function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,102,255,0.25) 0%, transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(0,102,255,0.15) 0%, transparent 40%)`,
        }}
      />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: 0.15 + (i % 4) * 0.08,
            animation: `pmc-twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function HeroPhoneVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[min(100%,380px)] select-none"
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0066FF]/25 blur-[80px]"
        style={{ animation: "pmc-float 8s ease-in-out infinite" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-[#0066FF]/15 blur-3xl"
        style={{ animation: "pmc-float 6s ease-in-out infinite reverse" }}
      />

      <div className="relative mx-auto aspect-[10/19] w-[78%] max-w-[280px]">
        <div
          className="absolute -inset-[3px] rounded-[2.85rem] opacity-90"
          style={{
            background: "linear-gradient(145deg, rgba(0,102,255,0.5), rgba(0,40,120,0.3), rgba(0,102,255,0.35))",
            boxShadow:
              "0 0 0 1px rgba(0,102,255,0.4), 0 24px 80px -12px rgba(0,102,255,0.45), 0 0 120px -20px rgba(0,102,255,0.35)",
          }}
        />

        <div
          className="relative h-full w-full overflow-hidden rounded-[2.65rem] p-[3px]"
          style={{
            background: "linear-gradient(160deg, #4a5568 0%, #1a1d24 40%, #0d0f14 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 8px rgba(0,0,0,0.5)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2.45rem] bg-black ring-1 ring-white/10">
            <div
              className="absolute inset-[2px] rounded-[2.35rem]"
              style={{
                background: `linear-gradient(165deg, #0c1220 0%, #050810 45%, #0a1628 100%)`,
              }}
            />
            <div
              className="absolute inset-x-4 top-3 flex justify-center"
              style={{ paddingTop: "6%" }}
            >
              <div className="h-7 w-[32%] rounded-full bg-black ring-1 ring-white/10 shadow-inner">
                <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-zinc-800/80" />
              </div>
            </div>
            <div
              className="absolute inset-x-3 bottom-3 top-[18%] rounded-2xl ring-1 ring-white/[0.07]"
              style={{
                background: `linear-gradient(180deg, rgba(0,102,255,0.12) 0%, rgba(0,30,80,0.4) 35%, #020308 90%)`,
                boxShadow: "inset 0 0 60px rgba(0,102,255,0.15)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[2.35rem] opacity-40"
              style={{
                background:
                  "linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.12) 48%, transparent 58%)",
              }}
            />
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-6">
              <span className="h-1 w-8 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        <div className="absolute -left-1 top-[22%] h-10 w-[3px] rounded-l-sm bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-sm" />
        <div className="absolute -left-1 top-[32%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-sm" />
        <div className="absolute -right-1 top-[28%] h-20 w-[3px] rounded-r-sm bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-sm" />
      </div>

      <div
        className="absolute -right-4 top-[12%] h-14 w-14 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0066FF] to-[#003d99] shadow-lg shadow-[#0066FF]/40"
        style={{ animation: "pmc-float 5.5s ease-in-out infinite" }}
      />
      <div
        className="absolute -left-6 bottom-[18%] h-11 w-11 rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm"
        style={{ animation: "pmc-float 6.5s ease-in-out infinite reverse" }}
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-black via-[#0a1628] to-[#0c2848] px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-32 lg:pt-24"
    >
      <HeroParticles />

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div
          className="max-w-xl text-white"
          style={{ animation: "pmc-fade-up 0.65s ease-out both" }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">
            Morelia · Mayoreo y retail
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
            Todo para tu Celular en un Solo Lugar
          </h1>
          <p className="mt-5 text-lg font-normal leading-relaxed text-white/70 sm:text-xl">
            Accesorios, reparaciones y servicios con entrega rápida en Morelia
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#productos"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/30 transition-all duration-300 ease-out hover:bg-[#3385ff] hover:shadow-xl hover:shadow-[#0066FF]/35 active:scale-[0.97]"
            >
              Ver Productos
            </Link>
            <Link
              href="#servicios"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 ease-out hover:border-white/35 hover:bg-white/10 active:scale-[0.97]"
            >
              Solicitar Servicio
            </Link>
          </div>
        </div>
        <div
          className="flex justify-center lg:justify-end"
          style={{ animation: "pmc-fade-up 0.75s ease-out 0.12s both" }}
        >
          <HeroPhoneVisual />
        </div>
      </div>
    </section>
  );
}
