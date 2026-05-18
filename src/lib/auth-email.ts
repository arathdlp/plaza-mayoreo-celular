import { getSiteBaseUrl } from "@/lib/mercadopago";
import type { SupabaseClient } from "@supabase/supabase-js";

export const AUTH_EMAIL_VERIFIED_PATH = "/verificado";

/** URL de redirección tras confirmar el correo (Supabase Auth → Redirect URLs). */
export function getAuthEmailRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${AUTH_EMAIL_VERIFIED_PATH}`;
  }
  return `${getSiteBaseUrl()}${AUTH_EMAIL_VERIFIED_PATH}`;
}

export function isEmailNotConfirmedError(error: { message?: string; code?: string }): boolean {
  if (error.code === "email_not_confirmed") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    m.includes("email not confirmed") ||
    m.includes("correo no confirmado") ||
    m.includes("email not verified") ||
    m.includes("correo no verificado")
  );
}

export async function resendSignupConfirmation(
  supabase: SupabaseClient,
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: "Ingresa un correo válido." };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmed,
    options: {
      emailRedirectTo: getAuthEmailRedirectUrl(),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
