import Link from "next/link";

const services = [
  {
    title: "Desbloqueos y Liberaciones",
    description:
      "Liberamos tu equipo para cualquier compañía con proceso seguro y respaldo.",
  },
  {
    title: "Instalaciones a Domicilio",
    description:
      "Pantallas, baterías y accesorios instalados donde tú estés en Morelia.",
  },
  {
    title: "Reparaciones",
    description:
      "Diagnóstico claro y reparación profesional de placas, carga, audio y más.",
  },
  {
    title: "Asesorías Técnicas",
    description:
      "Te orientamos en compra de refacciones, compatibilidad y mantenimiento.",
  },
] as const;

export default function Services() {
  return (
    <section
      id="servicios"
      className="border-t border-zinc-100 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Servicios
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            Soluciones técnicas para tu negocio o uso personal.
          </p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.title}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-8 transition-all duration-300 hover:border-[#0066FF]/25 hover:bg-white hover:shadow-sm"
            >
              <h3 className="text-xl font-semibold tracking-tight text-black">
                {s.title}
              </h3>
              <p className="mt-3 leading-relaxed text-zinc-600">{s.description}</p>
            </li>
          ))}
        </ul>

        <div
          id="capacitaciones"
          className="mt-12 scroll-mt-24 rounded-2xl border border-[#0066FF]/20 bg-gradient-to-br from-[#0066FF]/5 to-transparent p-8 sm:p-10"
        >
          <h3 className="text-xl font-semibold tracking-tight text-black">
            Capacitaciones
          </h3>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Cursos prácticos de reparación, microsoldadura y atención al cliente para
            que lleves tu taller al siguiente nivel.
          </p>
          <Link
            href="#contacto"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-medium text-white transition-transform duration-200 hover:bg-[#0052cc] active:scale-[0.98]"
          >
            Solicitar información
          </Link>
        </div>
      </div>
    </section>
  );
}
