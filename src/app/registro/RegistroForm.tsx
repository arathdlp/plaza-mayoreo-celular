"use client";

import VerifyEmailPending from "@/components/auth/VerifyEmailPending";
import AuthShell, { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import { getAuthEmailRedirectUrl } from "@/lib/auth-email";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function safeNext(path: string | null) {
  if (!path?.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

export default function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const loginHref =
    next !== "/dashboard" ? `/login?next=${encodeURIComponent(next)}` : "/login";

  const [step, setStep] = useState<"form" | "verify">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const trimmedEmail = email.trim();
    const { data, error: signError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirectUrl(),
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }

    if (data.session && data.user?.email_confirmed_at) {
      router.push(next);
      router.refresh();
      return;
    }

    setRegisteredEmail(trimmedEmail);
    setStep("verify");
  }

  if (step === "verify") {
    return (
      <AuthShell title="Crear cuenta" subtitle="Un último paso para activar tu cuenta.">
        <VerifyEmailPending
          email={registeredEmail}
          password={password}
          loginHref={loginHref}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Completa tus datos para comprar y seguir tus pedidos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}
        <div>
          <label htmlFor="reg-name" className={authLabelClass}>
            Nombre completo
          </label>
          <input
            id="reg-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={authFieldClass}
            placeholder="Nombre y apellidos"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className={authLabelClass}>
            Correo electrónico
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-phone" className={authLabelClass}>
            Teléfono
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={authFieldClass}
            placeholder="443 540 2474"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className={authLabelClass}>
            Contraseña
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <label htmlFor="reg-confirm" className={authLabelClass}>
            Confirmar contraseña
          </label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authFieldClass}
            placeholder="Repite la contraseña"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-[#0066FF] transition-colors duration-300 hover:text-[#4d94ff]"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
