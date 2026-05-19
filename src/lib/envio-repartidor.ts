import { createServiceRoleClient } from "@/lib/supabase/service";
import type { EstadoEnvio } from "@/types/envio";

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
    .select(
      "id, pedido_id, tipo, estado, lat_actual, lng_actual, destino_lat, destino_lng, direccion_destino, repartidor_nombre, repartidor_telefono, paqueteria_empresa, numero_guia, tiempo_estimado_minutos, updated_at",
    )
    .eq("id", envioId)
    .eq("repartidor_token", token.trim())
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, error: "Enlace inválido o expirado." };
  }
  return { ok: true as const, envio: data };
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
