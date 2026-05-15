export const CATEGORIAS_PRODUCTO = [
  "Pantalla",
  "Bateria",
  "Tapa Trasera",
  "Placa de Carga",
  "Accesorio",
  "Celular",
] as const;

export type CategoriaProducto = (typeof CATEGORIAS_PRODUCTO)[number];

/** Para igualdad exacta (case-sensitive) a pesar de NBSP / BOM / caracteres invisibles típicos de CSV/Excel. */
export function categoriasEquivalentes(a: string, b: string): boolean {
  return canonicalizarCategoria(a) === canonicalizarCategoria(b);
}

export function canonicalizarCategoria(raw: string): string {
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff\u2060]/g, "")
    .trim();
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
