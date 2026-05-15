"use server";

import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import { revalidatePath } from "next/cache";

const ESTADOS = ["pendiente", "preparando", "enviado", "entregado"] as const;
export type EstadoPedidoAdmin = (typeof ESTADOS)[number];

async function db() {
  const r = await getAdminSupabase();
  if (!r.ok) throw new Error("Sin permiso de administración.");
  return r.supabase;
}

export async function actualizarEstadoPedido(pedidoId: number, estado: string) {
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    return { ok: false as const, error: "ID inválido." };
  }
  if (!ESTADOS.includes(estado as EstadoPedidoAdmin)) {
    return { ok: false as const, error: "Estado no válido." };
  }

  const supabase = await db();
  const { error } = await supabase.from("pedidos").update({ estado }).eq("id", pedidoId);

  if (error) {
    console.error("[admin actualizarEstadoPedido]", error.message);
    return { ok: false as const, error: "No se pudo actualizar el pedido." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/pedidos");
  return { ok: true as const };
}
