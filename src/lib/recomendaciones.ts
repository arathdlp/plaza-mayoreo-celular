import { createClient } from "@/lib/supabase/server";
import { canonicalizarCategoria, type CategoriaProducto, type Producto } from "@/types/producto";

function mapRow(row: {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  precio: number | string;
  imagen_url: string | null;
  stock?: number | null;
}): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    marca: row.marca,
    modelo: row.modelo,
    categoria: canonicalizarCategoria(row.categoria) as CategoriaProducto,
    precio: typeof row.precio === "string" ? parseFloat(row.precio) : row.precio,
    imagen_url: row.imagen_url,
    stock: row.stock != null ? Number(row.stock) : null,
  };
}

export async function getRecomendacionesCarrito(input: {
  marca: string;
  modelo: string;
  categoriasExcluir: string[];
  limite?: number;
}): Promise<Producto[]> {
  const supabase = await createClient();
  const marca = input.marca.trim();
  const modelo = input.modelo.trim();
  if (!marca || !modelo) return [];

  const exclude = new Set(
    input.categoriasExcluir.map((c) => canonicalizarCategoria(c).toLowerCase()),
  );

  let query = supabase
    .from("productos")
    .select("id, nombre, marca, modelo, categoria, precio, imagen_url, stock")
    .eq("activo", true)
    .gt("stock", 0)
    .ilike("marca", marca)
    .ilike("modelo", modelo)
    .limit(input.limite ?? 12);

  const { data, error } = await query;
  if (error) {
    console.error("[recomendaciones]", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => mapRow(row as Parameters<typeof mapRow>[0]))
    .filter((p) => !exclude.has(p.categoria.toLowerCase()))
    .slice(0, input.limite ?? 8);
}

export async function getProductosDestacados(limite = 8): Promise<Producto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, marca, modelo, categoria, precio, imagen_url, stock")
    .eq("activo", true)
    .gt("stock", 0)
    .limit(40);

  if (error || !data?.length) return [];

  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limite).map((row) => mapRow(row as Parameters<typeof mapRow>[0]));
}
