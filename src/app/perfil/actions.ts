"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PerfilStats = {
  totalPedidos: number;
  totalFavoritos: number;
  createdAt: string | null;
};

export async function obtenerPerfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado." };

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("nombre, email, telefono, direccion, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !cliente) {
    return { ok: false as const, error: "No se encontró tu perfil." };
  }

  const [{ count: pedidos }, { count: favoritos }] = await Promise.all([
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("cliente_id", user.id),
    supabase.from("favoritos").select("id", { count: "exact", head: true }).eq("cliente_id", user.id),
  ]);

  const stats: PerfilStats = {
    totalPedidos: pedidos ?? 0,
    totalFavoritos: favoritos ?? 0,
    createdAt: (cliente.created_at as string) ?? null,
  };

  return {
    ok: true as const,
    perfil: {
      nombre: cliente.nombre as string,
      email: cliente.email as string,
      telefono: cliente.telefono as string,
      direccion: (cliente.direccion as string | null) ?? "",
    },
    stats,
  };
}

export async function actualizarPerfil(input: {
  nombre: string;
  telefono: string;
  direccion: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado." };

  const nombre = input.nombre.trim();
  const telefono = input.telefono.trim();
  const direccion = input.direccion.trim();

  if (!nombre || !telefono) {
    return { ok: false as const, error: "Nombre y teléfono son obligatorios." };
  }

  const { error } = await supabase
    .from("clientes")
    .update({ nombre, telefono, direccion: direccion || null })
    .eq("id", user.id);

  if (error) {
    return { ok: false as const, error: "No se pudo guardar el perfil." };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
