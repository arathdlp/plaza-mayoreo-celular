"use client";

import AnimatedMailIcon from "@/components/auth/AnimatedMailIcon";
import SuccessCheckBurst from "@/components/auth/SuccessCheckBurst";
import { textMuted } from "@/lib/design-system";
import { isEmailNotConfirmedError, resendSignupConfirmation } from "@/lib/auth-email";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  email: string;
  password: string;
  loginHref: string;
};

export default function VerifyEmailPending({ email, password, loginHref }: Props) {
  const router = useRouter();
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [resendOk, setResendOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleResend() {
    setError(null);
    setResendOk(false);
    setResendLoading(true);
    const supabase = createClient();
    const result = await resendSignupConfirmation(supabase, email);
    setResendLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResendOk(true);
  }

  async function handleAlreadyVerified() {
    setError(null);
    setCheckLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setCheckLoading(false);

    if (!signError) {
      setVerified(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push(loginHref), 1800);
      return;
    }

    if (isEmailNotConfirmedError(signError)) {
      setError("Tu correo aún no está verificado. Revisa tu bandeja o spam y vuelve a intentar.");
      return;
    }

    setError(
      signError.message === "Invalid login credentials"
        ? "No pudimos verificar la cuenta. Confirma tu correo o revisa tus datos."
        : signError.message,
    );
  }

  if (verified) {
    return (
      <div className="py-4">
        <SuccessCheckBurst
          title="¡Correo verificado!"
          description="Redirigiendo al inicio de sesión…"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <AnimatedMailIcon />

      <div>
        <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">¡Revisa tu correo!</h2>
        <p className={`mt-3 text-sm leading-relaxed ${textMuted}`}>
          Te enviamos un link de verificación a{" "}
          <span className="font-semibold text-[#111827]">{email}</span>. Haz click en el link para
          activar tu cuenta.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {resendOk ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-emerald-700"
        >
          Correo reenviado. Revisa tu bandeja de entrada.
        </motion.p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading}
          className="flex h-12 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#111827] transition hover:border-[#0066FF]/40 hover:text-[#0066FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendLoading ? "Reenviando…" : "Reenviar correo"}
        </button>
        <button
          type="button"
          onClick={handleAlreadyVerified}
          disabled={checkLoading}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition hover:bg-[#3385ff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkLoading ? "Comprobando…" : "Ya verifiqué, iniciar sesión"}
        </button>
        <Link
          href={loginHref}
          className="text-sm font-medium text-gray-500 transition-colors hover:text-[#0066FF]"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
