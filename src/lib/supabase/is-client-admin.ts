import { createClient } from "@/lib/supabase/server";

function coerceAdmin(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "true" || s === "t" || s === "1";
  }
  return false;
}

/** true si la sesión actual tiene clientes.is_admin (RPC security definer o lectura propia). */
export async function isCurrentUserClientAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return false;

  const rpc = await supabase.rpc("app_user_is_admin");
  if (!rpc.error && rpc.data !== null && rpc.data !== undefined) {
    if (coerceAdmin(rpc.data)) return true;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return false;
  return coerceAdmin(data.is_admin);
}
