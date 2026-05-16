"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
