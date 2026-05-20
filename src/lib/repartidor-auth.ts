import bcrypt from "bcryptjs";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type RepartidorRow = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  activo: boolean;
  created_at: string;
};

const SALT_ROUNDS = 10;

export async function hashRepartidorPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyRepartidorPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function loginRepartidor(
  email: string,
  password: string,
): Promise<{ ok: true; repartidor: RepartidorRow } | { ok: false; error: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Servidor no configurado." };

  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("repartidores")
    .select("id, nombre, telefono, email, password_hash, activo, created_at")
    .eq("email", normalized)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  if (!data.activo) {
    return { ok: false, error: "Tu cuenta está desactivada. Contacta al administrador." };
  }

  const valid = await verifyRepartidorPassword(password, data.password_hash as string);
  if (!valid) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  return {
    ok: true,
    repartidor: {
      id: data.id as string,
      nombre: data.nombre as string,
      telefono: data.telefono as string,
      email: data.email as string,
      activo: Boolean(data.activo),
      created_at: data.created_at as string,
    },
  };
}

export async function listRepartidoresActivos(): Promise<
  Pick<RepartidorRow, "id" | "nombre" | "telefono" | "email">[]
> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("repartidores")
    .select("id, nombre, telefono, email")
    .eq("activo", true)
    .order("nombre");

  return (data ?? []) as Pick<RepartidorRow, "id" | "nombre" | "telefono" | "email">[];
}
