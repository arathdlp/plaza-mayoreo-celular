import HeaderClient from "@/components/HeaderClient";
import type { HeaderProfile } from "@/components/HeaderProfileMenu";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: HeaderProfile | null = null;
  let isAdmin = false;

  if (user?.id) {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("nombre, email, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (cliente) {
      profile = {
        nombre: (cliente.nombre as string) || "Usuario",
        email: (cliente.email as string) || user.email || "",
        isAdmin: Boolean(cliente.is_admin),
      };
      isAdmin = profile.isAdmin;
    } else if (user.email) {
      profile = {
        nombre: user.email.split("@")[0] ?? "Usuario",
        email: user.email,
        isAdmin: false,
      };
    }
  }

  return <HeaderClient profile={profile} isAdmin={isAdmin} />;
}
