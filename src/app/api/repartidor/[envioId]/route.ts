import { parseEnvioId, validarTokenRepartidor } from "@/lib/envio-repartidor";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ envioId: string }> },
) {
  const { envioId: raw } = await context.params;
  const envioId = parseEnvioId(raw);
  if (!envioId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const token = new URL(request.url).searchParams.get("token");
  const result = await validarTokenRepartidor(envioId, token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ envio: result.envio });
}
