"use server";

import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import { CATEGORIAS_PRODUCTO } from "@/types/producto";
import { revalidatePath } from "next/cache";

async function db() {
  const r = await getAdminSupabase();
  if (!r.ok) throw new Error("Sin permiso de administración.");
  return r.supabase;
}

function parseMoney(v: string): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

function parseOptionalInt(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function crearProducto(form: FormData) {
  const nombre = String(form.get("nombre") ?? "").trim();
  const marca = String(form.get("marca") ?? "").trim();
  const modelo = String(form.get("modelo") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "").trim();
  const costo = parseMoney(String(form.get("costo") ?? ""));
  const precio = parseMoney(String(form.get("precio") ?? ""));
  const imagen_url = String(form.get("imagen_url") ?? "").trim() || null;
  const descripcion = String(form.get("descripcion") ?? "").trim() || null;
  const stockRaw = String(form.get("stock") ?? "");
  const activo = form.get("activo") === "on" || form.get("activo") === "true";

  if (!nombre || !marca || !modelo) {
    return { ok: false as const, error: "Nombre, marca y modelo son obligatorios." };
  }
  if (!CATEGORIAS_PRODUCTO.includes(categoria as (typeof CATEGORIAS_PRODUCTO)[number])) {
    return { ok: false as const, error: "Categoría no válida." };
  }
  if (!Number.isFinite(costo) || costo < 0 || !Number.isFinite(precio) || precio < 0) {
    return { ok: false as const, error: "Costo y precio deben ser números válidos ≥ 0." };
  }

  const stock = parseOptionalInt(stockRaw);

  const supabase = await db();
  const { error } = await supabase.from("productos").insert({
    nombre,
    marca,
    modelo,
    categoria,
    costo,
    precio,
    imagen_url,
    descripcion,
    stock,
    activo,
  });

  if (error) {
    console.error("[admin crearProducto]", error.message);
    return { ok: false as const, error: "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true as const };
}

export async function actualizarProducto(productoId: number, form: FormData) {
  if (!Number.isFinite(productoId) || productoId <= 0) {
    return { ok: false as const, error: "ID inválido." };
  }

  const nombre = String(form.get("nombre") ?? "").trim();
  const marca = String(form.get("marca") ?? "").trim();
  const modelo = String(form.get("modelo") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "").trim();
  const costo = parseMoney(String(form.get("costo") ?? ""));
  const precio = parseMoney(String(form.get("precio") ?? ""));
  const imagen_url = String(form.get("imagen_url") ?? "").trim() || null;
  const descripcion = String(form.get("descripcion") ?? "").trim() || null;
  const stockRaw = String(form.get("stock") ?? "");
  const activo = form.get("activo") === "on" || form.get("activo") === "true";

  if (!nombre || !marca || !modelo) {
    return { ok: false as const, error: "Nombre, marca y modelo son obligatorios." };
  }
  if (!CATEGORIAS_PRODUCTO.includes(categoria as (typeof CATEGORIAS_PRODUCTO)[number])) {
    return { ok: false as const, error: "Categoría no válida." };
  }
  if (!Number.isFinite(costo) || costo < 0 || !Number.isFinite(precio) || precio < 0) {
    return { ok: false as const, error: "Costo y precio deben ser números válidos ≥ 0." };
  }

  const stock = parseOptionalInt(stockRaw);

  const supabase = await db();
  const { error } = await supabase
    .from("productos")
    .update({
      nombre,
      marca,
      modelo,
      categoria,
      costo,
      precio,
      imagen_url,
      descripcion,
      stock,
      activo,
    })
    .eq("id", productoId);

  if (error) {
    console.error("[admin actualizarProducto]", error.message);
    return { ok: false as const, error: "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${productoId}`);
  return { ok: true as const };
}

export async function setProductoActivo(productoId: number, activo: boolean) {
  if (!Number.isFinite(productoId) || productoId <= 0) {
    return { ok: false as const, error: "ID inválido." };
  }

  const supabase = await db();
  const { error } = await supabase.from("productos").update({ activo }).eq("id", productoId);

  if (error) {
    console.error("[admin setProductoActivo]", error.message);
    return { ok: false as const, error: "No se pudo cambiar el estado." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${productoId}`);
  return { ok: true as const };
}
