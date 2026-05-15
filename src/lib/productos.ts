import { createClient } from "@/lib/supabase/server";
import {
  type CategoriaProducto,
  canonicalizarCategoria,
  type Producto,
} from "@/types/producto";

type ProductoRow = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  precio: number | string;
  imagen_url: string | null;
  descripcion?: string | null;
  stock?: number | null;
};

const SELECT_BASE =
  "id, nombre, marca, modelo, categoria, precio, imagen_url";
const SELECT_FULL = `${SELECT_BASE}, descripcion, stock`;

function mapProductoRow(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    marca: row.marca,
    modelo: row.modelo,
    categoria: canonicalizarCategoria(row.categoria) as CategoriaProducto,
    precio: typeof row.precio === "string" ? parseFloat(row.precio) : row.precio,
    imagen_url: row.imagen_url,
    descripcion: row.descripcion ?? null,
    stock: row.stock != null ? Number(row.stock) : null,
  };
}

function isMissingColumnError(message: string) {
  return (
    message.includes("descripcion") ||
    message.includes("stock") ||
    message.includes("column") ||
    message.includes("does not exist")
  );
}

export async function getProductosActivos(): Promise<Producto[]> {
  const supabase = await createClient();

  const full = await supabase
    .from("productos")
    .select(SELECT_FULL)
    .eq("activo", true)
    .order("nombre", { ascending: true });

  const { data, error } =
    full.error && isMissingColumnError(full.error.message)
      ? await supabase
          .from("productos")
          .select(SELECT_BASE)
          .eq("activo", true)
          .order("nombre", { ascending: true })
      : full;

  if (error) {
    console.error("[getProductosActivos]", error.message);
    throw new Error("No se pudieron cargar los productos.");
  }

  return (data as ProductoRow[]).map(mapProductoRow);
}

export async function getProductoById(id: number): Promise<Producto | null> {
  const supabase = await createClient();

  const full = await supabase
    .from("productos")
    .select(SELECT_FULL)
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();

  const { data, error } =
    full.error && isMissingColumnError(full.error.message)
      ? await supabase
          .from("productos")
          .select(SELECT_BASE)
          .eq("id", id)
          .eq("activo", true)
          .maybeSingle()
      : full;

  if (error) {
    console.error("[getProductoById]", error.message);
    return null;
  }

  if (!data) return null;
  return mapProductoRow(data as ProductoRow);
}

export function parseProductoId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}
