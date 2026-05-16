import { createClient } from "@/lib/supabase/server";
import {
  type CategoriaFiltro,
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

export type ListProductosActivosResult = {
  items: Producto[];
  total: number;
  page: number;
  perPage: number;
};

/** Texto seguro para usar dentro de filtros ilike (evita comodines y separadores de `.or()`). */
function sanitizeSearchForIlike(q: string): string {
  return q
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

async function fetchProductosActivosPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selectColumns: string,
  opts: { page: number; perPage: number; q: string; categoria: CategoriaFiltro },
): Promise<{ rows: ProductoRow[]; total: number }> {
  const from = (opts.page - 1) * opts.perPage;
  const to = from + opts.perPage - 1;
  const search = sanitizeSearchForIlike(opts.q);

  let qb = supabase.from("productos").select(selectColumns, { count: "exact" }).eq("activo", true);

  if (opts.categoria !== "todos") {
    qb = qb.eq("categoria", opts.categoria);
  }

  if (search.length > 0) {
    const pat = `%${search}%`;
    qb = qb.or(`nombre.ilike.${pat},marca.ilike.${pat},modelo.ilike.${pat}`);
  }

  const { data, error, count } = await qb.order("nombre", { ascending: true }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data ?? []) as unknown as ProductoRow[],
    total: count ?? 0,
  };
}

/** Catálogo activo con paginación y filtros (para `/productos`). */
export async function listProductosActivosPaginated(args: {
  page: number;
  perPage?: number;
  q?: string;
  categoria?: CategoriaFiltro;
}): Promise<ListProductosActivosResult> {
  const perPage = args.perPage ?? 20;
  const page = Math.max(1, Math.floor(args.page));
  const categoria = args.categoria ?? "todos";
  const q = args.q ?? "";

  const supabase = await createClient();

  try {
    const { rows, total } = await fetchProductosActivosPage(supabase, SELECT_FULL, {
      page,
      perPage,
      q,
      categoria,
    });
    return { items: rows.map(mapProductoRow), total, page, perPage };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!isMissingColumnError(message)) {
      console.error("[listProductosActivosPaginated]", message);
      throw new Error("No se pudieron cargar los productos.");
    }
    const { rows, total } = await fetchProductosActivosPage(supabase, SELECT_BASE, {
      page,
      perPage,
      q,
      categoria,
    });
    return { items: rows.map(mapProductoRow), total, page, perPage };
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
