export const CATEGORIAS_PRODUCTO = [
  "Pantalla",
  "Bateria",
  "Tapa Trasera",
  "Placa de Carga",
  "Accesorio",
  "Celular",
] as const;

export type CategoriaProducto = (typeof CATEGORIAS_PRODUCTO)[number];

/** Comparación exacta en mayúsculas tras canonicalizar espacios Unicode / formato invisible (CSV/Excel). */
export function categoriasEquivalentes(a: string, b: string): boolean {
  return canonicalizarCategoria(a) === canonicalizarCategoria(b);
}

/**
 * Igualdad humana con la BD (mayúsculas intactas): NFC + cualquier separador Unicode (Zs)
 * como espacio normal + quitar formato invisible + colapsar espacios internos.
 */
export function canonicalizarCategoria(raw: string): string {
  if (!raw) return "";
  return raw
    .normalize("NFC")
    .replace(/[\u200b-\u200d\ufeff\u2060\u034f]/g, "")
    .replace(/\p{Z}+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export type Producto = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: CategoriaProducto;
  precio: number;
  imagen_url: string | null;
  descripcion?: string | null;
  stock?: number | null;
};

export type CategoriaFiltro = "todos" | CategoriaProducto;
