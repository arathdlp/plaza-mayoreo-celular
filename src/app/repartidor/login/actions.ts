"use server";

import { loginRepartidor } from "@/lib/repartidor-auth";
import { setRepartidorSession } from "@/lib/repartidor-session";
import { redirect } from "next/navigation";

export async function loginRepartidorAction(
  formData: FormData,
): Promise<{ ok: false; error: string } | { ok: true }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await loginRepartidor(email, password);
  if (!res.ok) {
    return { ok: false as const, error: res.error };
  }

  await setRepartidorSession({
    id: res.repartidor.id,
    nombre: res.repartidor.nombre,
    email: res.repartidor.email,
  });

  redirect("/repartidor/dashboard");
  return { ok: true as const };
}

export async function logoutRepartidorAction() {
  const { clearRepartidorSession } = await import("@/lib/repartidor-session");
  await clearRepartidorSession();
  redirect("/repartidor/login");
}
