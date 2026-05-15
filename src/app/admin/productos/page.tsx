import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import ProductosAdminCliente from "@/app/admin/productos/ProductosAdminCliente";
import type { ProductoAdminRow } from "@/app/admin/productos/types";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Productos | Plaza Mayoreo del Celular",
  description: "Gestión de catálogo.",
};

function num(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

export default async function AdminProductosPage() {
  const r = await getAdminSupabase();
  if (!r.ok) {
    redirect("/dashboard");
  }

  const { data, error } = await r.supabase
    .from("productos")
    .select("id, nombre, marca, modelo, categoria, precio, costo, activo, imagen_url, descripcion, stock")
    .order("id", { ascending: true });

  if (error) {
    console.error("[admin/productos]", error.message);
  }

  const productos: ProductoAdminRow[] = (data ?? []).map((row) => ({
    id: row.id as number,
    nombre: row.nombre as string,
    marca: row.marca as string,
    modelo: row.modelo as string,
    categoria: row.categoria as string,
    precio: num(row.precio as number | string),
    costo: num(row.costo as number | string),
    activo: !!row.activo,
    imagen_url: (row.imagen_url as string | null) ?? null,
    descripcion: (row.descripcion as string | null) ?? null,
    stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
  }));

  return (
    <main className="relative px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Catálogo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Productos</h1>
            <p className="mt-2 text-sm text-white/55">
              Alta, edición y control de visibilidad en la tienda (activo / inactivo).
            </p>
          </div>
        </div>

        <ProductosAdminCliente initialProductos={productos} loadError={!!error} />
      </div>
    </main>
  );
}
