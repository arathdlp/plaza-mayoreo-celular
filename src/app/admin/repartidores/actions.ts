"use server";

import { getAdminServiceSupabase } from "@/app/admin/_lib/supabase-admin";
import { hashRepartidorPassword } from "@/lib/repartidor-auth";
import { revalidatePath } from "next/cache";

export type RepartidorAdminRow = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  activo: boolean;
  created_at: string;
  entregasHoy: number;
  entregasSemana: number;
  entregasMes: number;
  totalEntregados: number;
};

async function db() {
  const r = await getAdminServiceSupabase();
  if (!r.ok) throw new Error("Sin permiso de administración.");
  return r.supabase;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function daysAgo(n: number) {
  const x = new Date();
  x.setDate(x.getDate() - n);
  return x.toISOString();
}

export async function listRepartidoresAdmin(): Promise<RepartidorAdminRow[]> {
  const supabase = await db();
  const { data: reps } = await supabase
    .from("repartidores")
    .select("id, nombre, telefono, email, activo, created_at")
    .order("nombre");

  if (!reps?.length) return [];

  const { data: envios } = await supabase
    .from("envios")
    .select("repartidor_id, estado, updated_at")
    .eq("estado", "entregado");

  const hoy = startOfDay();
  const semana = daysAgo(7);
  const mes = daysAgo(30);

  return reps.map((r) => {
    const mine = (envios ?? []).filter((e) => e.repartidor_id === r.id);
    const entregasHoy = mine.filter((e) => e.updated_at >= hoy).length;
    const entregasSemana = mine.filter((e) => e.updated_at >= semana).length;
    const entregasMes = mine.filter((e) => e.updated_at >= mes).length;
    return {
      id: r.id as string,
      nombre: r.nombre as string,
      telefono: r.telefono as string,
      email: r.email as string,
      activo: Boolean(r.activo),
      created_at: r.created_at as string,
      entregasHoy,
      entregasSemana,
      entregasMes,
      totalEntregados: mine.length,
    };
  });
}

export async function crearRepartidor(input: {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
}) {
  if (!input.nombre.trim() || !input.telefono.trim() || !input.email.trim() || !input.password) {
    return { ok: false as const, error: "Completa todos los campos." };
  }
  if (input.password.length < 6) {
    return { ok: false as const, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await db();
  const password_hash = await hashRepartidorPassword(input.password);

  const { error } = await supabase.from("repartidores").insert({
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    email: input.email.trim().toLowerCase(),
    password_hash,
    activo: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, error: "Ese correo ya está registrado." };
    }
    return { ok: false as const, error: "No se pudo crear el repartidor." };
  }

  revalidatePath("/admin/repartidores");
  return { ok: true as const };
}

export async function actualizarRepartidor(input: {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  password?: string;
}) {
  const supabase = await db();
  const patch: Record<string, unknown> = {
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    email: input.email.trim().toLowerCase(),
  };
  if (input.password?.trim()) {
    if (input.password.length < 6) {
      return { ok: false as const, error: "La contraseña debe tener al menos 6 caracteres." };
    }
    patch.password_hash = await hashRepartidorPassword(input.password);
  }

  const { error } = await supabase.from("repartidores").update(patch).eq("id", input.id);
  if (error) {
    return { ok: false as const, error: "No se pudo actualizar." };
  }

  revalidatePath("/admin/repartidores");
  return { ok: true as const };
}

export async function toggleRepartidorActivo(id: string, activo: boolean) {
  const supabase = await db();
  const { error } = await supabase.from("repartidores").update({ activo }).eq("id", id);
  if (error) return { ok: false as const, error: "No se pudo cambiar el estado." };
  revalidatePath("/admin/repartidores");
  return { ok: true as const };
}
