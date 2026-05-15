"use client";

import { createClient } from "@/lib/supabase/client";
import AuthShell, { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegistroForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
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
    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
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
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setInfo(
      "Cuenta creada. Si tu proyecto requiere confirmar el correo, revisa tu bandeja de entrada para activar la cuenta.",
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
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}
        {info ? (
          <div className="rounded-xl border border-[#0066FF]/30 bg-[#0066FF]/10 px-4 py-3 text-sm text-white/90">
            {info}
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
            placeholder="443 123 4567"
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
      <p className="mt-8 text-center text-sm text-white/55">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0066FF] transition-colors duration-300 hover:text-[#4d94ff]"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
