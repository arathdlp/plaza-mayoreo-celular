"use client";

import AuthShell, { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import { isEmailNotConfirmedError, resendSignupConfirmation } from "@/lib/auth-email";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function safeNext(path: string | null) {
  if (!path?.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendOk, setResendOk] = useState(false);

  async function handleResend() {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendOk(false);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signError) {
      if (isEmailNotConfirmedError(signError)) {
        setUnverified(true);
        setError(null);
        return;
      }
      setError(
        signError.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : signError.message,
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta para ver pedidos, carrito y más."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {unverified ? (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
          >
            <p className="font-semibold">Tu correo no está verificado</p>
            <p className="mt-1 leading-relaxed text-amber-800/90">
              Revisa tu bandeja de entrada o spam.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="mt-3 w-full rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {resendLoading ? "Reenviando…" : "Reenviar correo de verificación"}
            </button>
            {resendOk ? (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Correo reenviado. Revisa tu bandeja.
              </p>
            ) : null}
          </motion.div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className={authLabelClass}>
            Correo electrónico
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Contraseña
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Iniciar Sesión"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-[#0066FF] transition-colors duration-300 hover:text-[#4d94ff]"
        >
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
