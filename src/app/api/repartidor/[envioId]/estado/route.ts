import {
  actualizarEstadoRepartidor,
  httpStatusRepartidorError,
  parseEnvioId,
  tokenFromRepartidorRequest,
} from "@/lib/envio-repartidor";
import { getRepartidorSession } from "@/lib/repartidor-session";
import { ESTADOS_ENVIO, type EstadoEnvio } from "@/types/envio";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ envioId: string }> },
) {
  const { envioId: raw } = await context.params;
  const envioId = parseEnvioId(raw);
  if (!envioId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: { token?: string; estado?: string; lat?: number; lng?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.estado || !ESTADOS_ENVIO.includes(body.estado as EstadoEnvio)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const coords =
    Number.isFinite(body.lat) && Number.isFinite(body.lng)
      ? { lat: body.lat!, lng: body.lng! }
      : undefined;

  const accessToken = tokenFromRepartidorRequest(request, body);
  const session = await getRepartidorSession();
  const result = await actualizarEstadoRepartidor(
    envioId,
    accessToken,
    body.estado as EstadoEnvio,
    coords,
    session?.id,
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: httpStatusRepartidorError(result.error) },
    );
  }
  return NextResponse.json({
    ok: true,
    whatsappEntregado: "whatsappEntregado" in result ? result.whatsappEntregado : null,
  });
}
