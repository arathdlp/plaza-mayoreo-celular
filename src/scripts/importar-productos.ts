/**
 * Importa productos al catálogo en Supabase.
 *
 * Uso:
 *   npm run importar-productos
 *   npm run importar-productos -- src/scripts/data/productos.json
 *
 * Variables en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (necesaria: RLS no permite INSERT con anon)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadEnvFiles,
  logEnvDiagnostics,
  resolveServiceRoleKey,
} from "./load-env-file";
import { productosEjemplo, type ProductoImport } from "./productos-ejemplo";

const loadedEnvPath = loadEnvFiles();
logEnvDiagnostics(loadedEnvPath);

const BATCH_SIZE = 100;

const CATEGORIAS_VALIDAS = new Set([
  "Pantalla",
  "Bateria",
  "Tapa Trasera",
  "Placa de Carga",
  "Accesorio",
  "Celular",
]);

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = resolveServiceRoleKey();

  if (!url || !serviceKey) {
    console.error(
      "Faltan variables en .env.local:\n" +
        `  NEXT_PUBLIC_SUPABASE_URL${url ? " OK" : " (vacía o ausente)"}\n` +
        `  SUPABASE_SERVICE_ROLE_KEY${serviceKey ? " OK" : " (vacía o ausente)"}\n\n` +
        "Formato recomendado (toda la key en una línea, con o sin comillas):\n" +
        '  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."\n\n' +
        "La service role key está en: Supabase → Project Settings → API → service_role",
    );
    process.exit(1);
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function loadProductosFromFile(filePath: string): ProductoImport[] {
  const absolute = resolve(process.cwd(), filePath);
  const raw = readFileSync(absolute, "utf-8");
  const data = JSON.parse(raw) as unknown;

  if (!Array.isArray(data)) {
    throw new Error(`El archivo debe contener un array JSON: ${absolute}`);
  }

  return data.map((item, index) => normalizeProducto(item, index));
}

function normalizeProducto(item: unknown, index: number): ProductoImport {
  if (!item || typeof item !== "object") {
    throw new Error(`Producto inválido en índice ${index}`);
  }

  const p = item as Record<string, unknown>;
  const nombre = String(p.nombre ?? "").trim();
  const marca = String(p.marca ?? "").trim();
  const modelo = String(p.modelo ?? "").trim();
  const categoria = String(p.categoria ?? "").trim();
  const costo = Number(p.costo);
  const precio = Number(p.precio);

  if (!nombre || !marca || !modelo || !categoria) {
    throw new Error(`Producto incompleto en índice ${index}: ${nombre || "(sin nombre)"}`);
  }
  if (!CATEGORIAS_VALIDAS.has(categoria)) {
    throw new Error(
      `Categoría inválida en índice ${index} (${nombre}): "${categoria}". ` +
        `Valores: ${[...CATEGORIAS_VALIDAS].join(", ")}`,
    );
  }
  if (Number.isNaN(costo) || Number.isNaN(precio) || costo < 0 || precio < 0) {
    throw new Error(`Costo/precio inválidos en índice ${index}: ${nombre}`);
  }

  return {
    nombre,
    marca,
    modelo,
    categoria: categoria as ProductoImport["categoria"],
    costo,
    precio,
  };
}

function resolveProductos(): ProductoImport[] {
  const fileArg = process.argv[2];
  if (fileArg) {
    console.log(`Leyendo catálogo desde: ${fileArg}`);
    return loadProductosFromFile(fileArg);
  }
  console.log(`Usando ${productosEjemplo.length} productos de ejemplo (productos-ejemplo.ts)`);
  return productosEjemplo;
}

async function importar() {
  const supabase = createSupabaseAdmin();
  const productos = resolveProductos();

  if (productos.length === 0) {
    console.log("No hay productos para importar.");
    return;
  }

  console.log(`Importando ${productos.length} productos en lotes de ${BATCH_SIZE}…`);

  let insertados = 0;
  let errores = 0;

  for (let i = 0; i < productos.length; i += BATCH_SIZE) {
    const lote = productos.slice(i, i + BATCH_SIZE).map((p) => ({
      nombre: p.nombre,
      marca: p.marca,
      modelo: p.modelo,
      categoria: p.categoria,
      costo: p.costo,
      precio: p.precio,
      activo: true,
    }));

    const { data, error } = await supabase.from("productos").insert(lote).select("id");

    if (error) {
      console.error(`Error en lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errores += lote.length;
      continue;
    }

    insertados += data?.length ?? lote.length;
    console.log(`  Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${data?.length ?? lote.length} insertados`);
  }

  console.log("\n--- Resumen ---");
  console.log(`Total procesados: ${productos.length}`);
  console.log(`Insertados:       ${insertados}`);
  if (errores > 0) {
    console.log(`Fallidos:         ${errores}`);
    process.exit(1);
  }
  console.log("Importación completada.");
}

importar().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
