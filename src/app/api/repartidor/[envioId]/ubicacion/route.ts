import {
  httpStatusRepartidorError,
  parseEnvioId,
  registrarUbicacionRepartidor,
  tokenFromRepartidorRequest,
} from "@/lib/envio-repartidor";
import { getRepartidorSession } from "@/lib/repartidor-session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ envioId: string }> },
) {
  const { envioId: raw } = await context.params;
  const envioId = parseEnvioId(raw);
  if (!envioId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: { token?: string; lat?: number; lng?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const lat = body.lat;
  const lng = body.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Coordenadas inválidas." }, { status: 400 });
  }

  const accessToken = tokenFromRepartidorRequest(request, body);
  console.log("[API UBICACION]", {
    id: envioId,
    token: accessToken,
    hasToken: Boolean(accessToken),
  });
  const session = await getRepartidorSession();
  const result = await registrarUbicacionRepartidor(
    envioId,
    accessToken,
    lat!,
    lng!,
    session?.id,
  );
  if (!result.ok) {
    console.log("[API UBICACION] Rechazada:", result.error);
    return NextResponse.json(
      { error: result.error },
      { status: httpStatusRepartidorError(result.error) },
    );
  }
  console.log("[API UBICACION] Guardada:", result);
  return NextResponse.json({ ok: true });
}
