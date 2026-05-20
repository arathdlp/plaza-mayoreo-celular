import { loadPedidoTracking } from "@/lib/pedido-tracking";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id: raw } = await context.params;
  const pedidoId = Number.parseInt(raw, 10);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const token = new URL(request.url).searchParams.get("token");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await loadPedidoTracking(pedidoId, {
    userId: user?.id,
    token,
  });

  if (!result.ok) {
    const status =
      result.reason === "pedido_not_found"
        ? 404
        : result.reason === "no_envio"
          ? 404
          : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ envio: result.data.envio });
}
