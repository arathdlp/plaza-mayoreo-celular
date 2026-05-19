import { ENVIOS_DB_SELECT, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";

export function parseEnvioId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function validarTokenRepartidor(envioId: number, token: string | null) {
  if (!token?.trim()) return { ok: false as const, error: "Token requerido." };
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false as const, error: "Servidor no configurado." };

  const { data, error } = await supabase
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("id", envioId)
    .eq("token", token.trim())
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, error: "Enlace inválido o expirado." };
  }

  const row = data as unknown as EnvioDbRow;
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("direccion_entrega")
    .eq("id", row.pedido_id)
    .maybeSingle();

  const envio: EnvioRow = mapEnvioFromDb(row, {
    direccionEntrega: (pedido?.direccion_entrega as string | undefined) ?? null,
  });

  return { ok: true as const, envio };
}

export async function registrarUbicacionRepartidor(
  envioId: number,
  token: string,
  lat: number,
  lng: number,
) {
  const auth = await validarTokenRepartidor(envioId, token);
  if (!auth.ok) return auth;

  if (auth.envio.estado === "entregado") {
    return { ok: false as const, error: "El envío ya fue entregado." };
  }
  if (auth.envio.estado !== "en_camino") {
    return { ok: false as const, error: "Inicia la entrega primero." };
  }

  const supabase = createServiceRoleClient()!;
  const { error: insErr } = await supabase.from("ubicaciones_envio").insert({
    envio_id: envioId,
    lat,
    lng,
  });
  if (insErr) {
    console.error("[ubicacion envio]", insErr.message);
    return { ok: false as const, error: "No se pudo guardar la ubicación." };
  }

  const { error: updErr } = await supabase
    .from("envios")
    .update({ lat_actual: lat, lng_actual: lng })
    .eq("id", envioId);

  if (updErr) {
    return { ok: false as const, error: "No se pudo actualizar el envío." };
  }
  return { ok: true as const };
}

export async function actualizarEstadoRepartidor(
  envioId: number,
  token: string,
  estado: EstadoEnvio,
  coords?: { lat: number; lng: number },
) {
  const auth = await validarTokenRepartidor(envioId, token);
  if (!auth.ok) return auth;

  const supabase = createServiceRoleClient()!;
  const patch: Record<string, unknown> = { estado };

  if (estado === "en_camino" && coords) {
    patch.lat_actual = coords.lat;
    patch.lng_actual = coords.lng;
  }
  if (estado === "entregado" && coords) {
    patch.lat_actual = coords.lat;
    patch.lng_actual = coords.lng;
  }

  const { error } = await supabase.from("envios").update(patch).eq("id", envioId);
  if (error) {
    return { ok: false as const, error: "No se pudo actualizar el estado." };
  }

  if (coords && (estado === "en_camino" || estado === "entregado")) {
    await supabase.from("ubicaciones_envio").insert({
      envio_id: envioId,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return { ok: true as const };
}
