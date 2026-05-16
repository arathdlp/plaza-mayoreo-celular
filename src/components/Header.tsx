import { isCurrentUserClientAdmin } from "@/lib/supabase/is-client-admin";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const isAdmin = await isCurrentUserClientAdmin();
  return <HeaderClient isAdmin={isAdmin} />;
}
