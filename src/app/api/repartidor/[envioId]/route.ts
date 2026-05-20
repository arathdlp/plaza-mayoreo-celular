import { getRepartidorContext, parseEnvioId } from "@/lib/envio-repartidor";
import { getRepartidorSession } from "@/lib/repartidor-session";
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
  const session = await getRepartidorSession();
  const result = await getRepartidorContext(envioId, token, session?.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json(result.data);
}
