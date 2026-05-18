import { cardInteractive } from "@/lib/design-system";
import Link from "next/link";

export default function AdminHomePage() {
  const card = `group block p-8 ${cardInteractive}`;

  return (
    <main className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Panel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Administración</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">
          Gestiona el catálogo y el ciclo de vida de los pedidos. Solo usuarios autorizados pueden ver esta sección.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/productos" className={card}>
            <h2 className="text-xl font-bold text-[#111827]">Productos</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Ver todos los productos, alta y edición en modal, y activar o desactivar en catálogo público.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0066FF] group-hover:underline">
              Ir a productos →
            </span>
          </Link>

          <Link href="/admin/pedidos" className={card}>
            <h2 className="text-xl font-bold text-[#111827]">Pedidos</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Listado global de pedidos con cliente, total y método de pago. Actualiza el estado del envío.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0066FF] group-hover:underline">
              Ir a pedidos →
            </span>
          </Link>

          <Link href="/admin/servicios" className={card}>
            <h2 className="text-xl font-bold text-[#111827]">Servicios</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Solicitudes de reparación, desbloqueo, instalación y asesoría desde el formulario público.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0066FF] group-hover:underline">
              Ir a servicios →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
