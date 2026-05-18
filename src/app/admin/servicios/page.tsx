import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import ServiciosAdminCliente from "@/app/admin/servicios/ServiciosAdminCliente";
import type { SolicitudAdminRow } from "@/app/admin/servicios/types";
import { pageMetadata } from "@/lib/seo";
import type { EstadoSolicitud, TipoServicio } from "@/types/servicio";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Admin · Servicios",
  description: "Solicitudes de servicio técnico y cambio de estado.",
  path: "/admin/servicios",
  noindex: true,
});

export default async function AdminServiciosPage() {
  const r = await getAdminSupabase();
  if (!r.ok) {
    redirect("/dashboard");
  }

  const { data, error } = await r.supabase
    .from("solicitudes_servicio")
    .select(
      "id, nombre, telefono, email, tipo_servicio, marca_equipo, modelo_equipo, estado, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/servicios]", error.message);
  }

  const solicitudes: SolicitudAdminRow[] = (data ?? []).map((row) => ({
    id: row.id as number,
    nombre: row.nombre as string,
    telefono: row.telefono as string,
    email: row.email as string,
    tipo_servicio: row.tipo_servicio as TipoServicio,
    marca_equipo: (row.marca_equipo as string | null) ?? null,
    modelo_equipo: (row.modelo_equipo as string | null) ?? null,
    estado: row.estado as EstadoSolicitud,
    created_at: row.created_at as string,
  }));

  return (
    <main className="relative px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Operaciones</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Servicios</h1>
          <p className="mt-2 text-sm text-gray-500">
            Solicitudes enviadas desde la página pública. Actualiza el estado de seguimiento.
          </p>
        </div>

        <ServiciosAdminCliente initialSolicitudes={solicitudes} loadError={!!error} />
      </div>
    </main>
  );
}
