"use client";

import ConfettiBurst from "@/components/auth/ConfettiBurst";
import SuccessCheckBurst from "@/components/auth/SuccessCheckBurst";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type EmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

export default function VerificadoView() {
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function confirmFromUrl() {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "",
      );

      const token_hash = params.get("token_hash") ?? hashParams.get("token_hash");
      const type = (params.get("type") ?? hashParams.get("type")) as EmailOtpType | null;
      const code = params.get("code");

      try {
        if (token_hash && type) {
          await supabase.auth.verifyOtp({ token_hash, type });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        /* sesión puede establecerse vía hash automáticamente */
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        if (!cancelled) setSuccess(true);
        await supabase.auth.signOut();
      } else if (
        hashParams.get("access_token") ||
        params.get("verified") === "1"
      ) {
        if (!cancelled) setSuccess(true);
        await supabase.auth.signOut();
      }

      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, "", "/verificado");
      }

      if (!cancelled) setReady(true);
    }

    void confirmFromUrl();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginButton = (
    <Link
      href="/login"
      className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition hover:bg-[#3385ff]"
    >
      Iniciar sesión
    </Link>
  );

  if (!ready) {
    return (
      <AuthShell title="Verificando…" subtitle="Un momento mientras confirmamos tu correo.">
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0066FF]/30 border-t-[#0066FF]" />
        </div>
      </AuthShell>
    );
  }

  return (
    <>
      <ConfettiBurst active={success} />
      <AuthShell
        title={success ? "¡Listo!" : "Verificación"}
        subtitle={
          success
            ? undefined
            : "Si acabas de confirmar tu correo, ya puedes iniciar sesión."
        }
      >
        <div className="relative py-2">
          {success ? (
            <SuccessCheckBurst
              title="¡Email verificado!"
              description="Ya puedes iniciar sesión con tu cuenta."
              size="lg"
            />
          ) : (
            <SuccessCheckBurst
              title="Cuenta lista"
              description="Tu enlace de verificación fue procesado. Si aún no puedes entrar, espera un momento e intenta de nuevo."
            />
          )}
          {loginButton}
        </div>
      </AuthShell>
    </>
  );
}
