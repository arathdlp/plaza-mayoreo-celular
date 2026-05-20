"use client";

import { loginRepartidorAction } from "@/app/repartidor/login/actions";
import { useActionState } from "react";

type LoginState = { ok: boolean; error: string };

const initial: LoginState = { ok: true, error: "" };

export default function RepartidorLoginForm() {
  const [state, action, pending] = useActionState(
    async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
      const res = await loginRepartidorAction(formData);
      if (res && "error" in res && res.ok === false) {
        return { ok: false, error: res.error };
      }
      return initial;
    },
    initial,
  );

  return (
    <form action={action} className="mx-auto w-full max-w-sm space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="text-xs font-semibold text-gray-600">Correo</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#0066FF] py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
