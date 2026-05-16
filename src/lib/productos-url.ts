import {
  CATEGORIAS_PRODUCTO,
  type CategoriaFiltro,
  type CategoriaProducto,
} from "@/types/producto";

export type ProductosListQuery = {
  page?: number;
  q?: string;
  categoria?: CategoriaFiltro;
};

/** Construye `/productos?...` para paginación y filtros (compartido cliente/servidor). */
export function productosListHref(opts: ProductosListQuery): string {
  const p = new URLSearchParams();
  if (opts.page != null && opts.page > 1) p.set("page", String(opts.page));
  const q = opts.q?.trim();
  if (q) p.set("q", q);
  if (opts.categoria && opts.categoria !== "todos") p.set("categoria", opts.categoria);
  const s = p.toString();
  return s ? `/productos?${s}` : "/productos";
}

export function parseProductosPageParam(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(s ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parseCategoriaFiltroParam(raw: string | string[] | undefined): CategoriaFiltro {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || s === "todos") return "todos";
  return CATEGORIAS_PRODUCTO.includes(s as CategoriaProducto) ? (s as CategoriaProducto) : "todos";
}

export function parseProductosSearchParam(raw: string | string[] | undefined): string {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return typeof s === "string" ? s : "";
}
