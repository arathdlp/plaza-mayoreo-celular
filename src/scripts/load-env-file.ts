import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SERVICE_KEY_ALIASES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
] as const;

/**
 * Parser tolerante: toma todo lo que sigue al primer "=" (JWT, URLs, etc.).
 */
export function parseEnvFileContent(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  const text = content.replace(/^\uFEFF/, "");

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("export ")) {
      line = line.slice(7).trim();
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1);

    value = parseEnvValue(value);
    if (key) env[key] = value;
  }

  return env;
}

function parseEnvValue(raw: string): string {
  let value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const quote = value[0];
    value = value.slice(1, -1);
    if (quote === '"') {
      value = value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return value;
  }

  const commentIndex = value.search(/\s+#/);
  if (commentIndex !== -1) {
    value = value.slice(0, commentIndex).trimEnd();
  }

  return value.trim();
}

export function loadEnvFiles(): string {
  const root = process.cwd();
  const envLocalPath = resolve(root, ".env.local");
  const envPath = resolve(root, ".env");

  let loadedFrom = "";

  if (existsSync(envLocalPath)) {
    applyEnvFile(readFileSync(envLocalPath, "utf-8"));
    loadedFrom = envLocalPath;
  } else if (existsSync(envPath)) {
    applyEnvFile(readFileSync(envPath, "utf-8"));
    loadedFrom = envPath;
  } else {
    console.error(
      `No se encontró .env.local en:\n  ${envLocalPath}\n` +
        "Crea el archivo con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  return loadedFrom;
}

function applyEnvFile(content: string) {
  const parsed = parseEnvFileContent(content);
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== "") {
      process.env[key] = value;
    }
  }
}

export function resolveServiceRoleKey(): string | undefined {
  for (const alias of SERVICE_KEY_ALIASES) {
    const value = process.env[alias]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function logEnvDiagnostics(loadedFrom: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = resolveServiceRoleKey();

  const serviceKeyLineFound = SERVICE_KEY_ALIASES.some((alias) =>
    process.env[alias] !== undefined,
  );

  console.log("--- Variables de entorno ---");
  console.log(`Archivo: ${loadedFrom}`);
  console.log(
    `NEXT_PUBLIC_SUPABASE_URL: ${
      url ? `OK (${url.length} caracteres) → ${url}` : "NO definida"
    }`,
  );
  console.log(
    `SUPABASE_SERVICE_ROLE_KEY: ${
      serviceKey
        ? `OK (${serviceKey.length} caracteres, prefijo: ${serviceKey.slice(0, 16)}…)`
        : serviceKeyLineFound
          ? "DEFINIDA pero vacía (revisa comillas o formato en .env.local)"
          : "NO definida (usa SUPABASE_SERVICE_ROLE_KEY=... en una sola línea)"
    }`,
  );

  if (!serviceKey) {
    const related = Object.keys(process.env).filter(
      (k) => k.startsWith("SUPABASE_") || k.startsWith("NEXT_PUBLIC_SUPABASE"),
    );
    if (related.length > 0) {
      console.log(`Claves Supabase en el entorno: ${related.join(", ")}`);
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
      console.log(
        "Nota: NEXT_PUBLIC_SUPABASE_ANON_KEY no sirve para importar; necesitas la service_role (secreta).",
      );
    }
  }
  console.log("----------------------------\n");
}
