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

/** PostgREST suele limitar filas por respuesta (~1000); paginamos hasta traer todo el catálogo activo. */
const PAGE_SIZE = 1000;

async function fetchProductosActivosRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selectColumns: string,
): Promise<ProductoRow[]> {
  const rows: ProductoRow[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("productos")
      .select(selectColumns)
      .eq("activo", true)
      .order("nombre", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data ?? []) as unknown as ProductoRow[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

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

  try {
    const rows = await fetchProductosActivosRows(supabase, SELECT_FULL);
    return rows.map(mapProductoRow);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!isMissingColumnError(message)) {
      console.error("[getProductosActivos]", message);
      throw new Error("No se pudieron cargar los productos.");
    }
    const rows = await fetchProductosActivosRows(supabase, SELECT_BASE);
    return rows.map(mapProductoRow);
  }
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
