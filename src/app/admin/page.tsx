import Link from "next/link";

export default function AdminHomePage() {
  const card =
    "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-all hover:border-[#0066FF]/35 hover:bg-[#0066FF]/[0.07]";

  return (
    <main className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Panel</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Administración</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/55">
          Gestiona el catálogo y el ciclo de vida de los pedidos. Solo usuarios autorizados pueden ver esta sección.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Link href="/admin/productos" className={card}>
            <h2 className="text-xl font-semibold text-white">Productos</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Ver todos los productos, alta y edición en modal, y activar o desactivar en catálogo público.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0066FF] group-hover:underline">
              Ir a productos →
            </span>
          </Link>

          <Link href="/admin/pedidos" className={card}>
            <h2 className="text-xl font-semibold text-white">Pedidos</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Listado global de pedidos con cliente, total y método de pago. Actualiza el estado del envío.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0066FF] group-hover:underline">
              Ir a pedidos →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
