import { getRecomendacionesCarrito } from "@/lib/recomendaciones";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { marca?: string; modelo?: string; categoriasExcluir?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ productos: [] });
  }

  const productos = await getRecomendacionesCarrito({
    marca: body.marca ?? "",
    modelo: body.modelo ?? "",
    categoriasExcluir: body.categoriasExcluir ?? [],
    limite: 8,
  });

  return NextResponse.json({ productos });
}
