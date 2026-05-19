import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createClient as createSupabaseJs, type SupabaseClient } from "@supabase/supabase-js";

function parseAdminEmails(): string[] {
  return (
    process.env.ADMIN_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

/** PostgREST puede devolver boolean, null, o en casos raros string/número. */
function coerceIsAdmin(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "true" || s === "t" || s === "1" || s === "yes" || s === "on";
  }
  return false;
}

type ClienteAdminRow = { is_admin: unknown };

async function fetchClienteAdmin(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  email: string | undefined,
): Promise<{ row: ClienteAdminRow | null; errorMessage: string | null }> {
  const byId = await supabase
    .from("clientes")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (byId.error) {
    return { row: null, errorMessage: byId.error.message };
  }

  if (byId.data) {
    return { row: byId.data as ClienteAdminRow, errorMessage: null };
  }

  if (email?.trim()) {
    const byEmail = await supabase
      .from("clientes")
      .select("is_admin")
      .ilike("email", email.trim())
      .maybeSingle();

    if (byEmail.error) {
      return { row: null, errorMessage: byEmail.error.message };
    }
    return { row: (byEmail.data as ClienteAdminRow) ?? null, errorMessage: null };
  }

  return { row: null, errorMessage: null };
}

/**
 * Lee is_admin desde public.clientes para auth.uid().
 * Prioridad: RPC security definer (misma lógica que RLS); si falla, SELECT directo.
 */
async function resolveDbAdminFromClientes(
  sessionClient: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  email: string | undefined,
): Promise<boolean> {
  const rpc = await sessionClient.rpc("app_user_is_admin");
  if (!rpc.error && rpc.data !== null && rpc.data !== undefined) {
    return coerceIsAdmin(rpc.data);
  }
  if (rpc.error) {
    console.warn("[getAdminSupabase] rpc app_user_is_admin:", rpc.error.message);
  }

  const { row, errorMessage } = await fetchClienteAdmin(sessionClient, userId, email);
  if (errorMessage) {
    console.error("[getAdminSupabase] clientes:", errorMessage);
  }
  return coerceIsAdmin(row?.is_admin);
}

export type AdminGateResult =
  | { ok: true; supabase: SupabaseClient }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "misconfigured" };

export async function getAdminSupabase(): Promise<AdminGateResult> {
  const sessionClient = await createServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user?.id) {
    return { ok: false, reason: "unauthenticated" };
  }

  const listed =
    user.email != null && parseAdminEmails().includes(user.email.toLowerCase());

  const dbAdmin = await resolveDbAdminFromClientes(sessionClient, user.id, user.email ?? undefined);

  if (!listed && !dbAdmin) {
    return { ok: false, reason: "forbidden" };
  }

  if (dbAdmin) {
    return { ok: true, supabase: sessionClient };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, reason: "misconfigured" };
  }

  const svc = createSupabaseJs(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { ok: true, supabase: svc };
}

/**
 * Verifica acceso admin y devuelve cliente con service role (sin RLS).
 * Usar en listados y mutaciones del panel admin.
 */
export async function getAdminServiceSupabase(): Promise<AdminGateResult> {
  const gate = await getAdminSupabase();
  if (!gate.ok) return gate;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error(
      "[getAdminServiceSupabase] SUPABASE_SERVICE_ROLE_KEY no configurada; no se puede omitir RLS.",
    );
    return { ok: false, reason: "misconfigured" };
  }

  return { ok: true, supabase };
}
