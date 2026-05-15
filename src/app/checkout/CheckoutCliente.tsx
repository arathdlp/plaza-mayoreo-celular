"use client";

import { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import { useCarrito } from "@/hooks/useCarrito";
import { formatoPesos } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { crearPedido } from "./actions";

function PlaceholderThumb() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#0a1628] to-[#12121c] text-[#0066FF]/35 sm:h-[72px] sm:w-[72px]"
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function CheckoutCliente() {
  const router = useRouter();
  const { lineas, totalPrecio, listo, vaciar } = useCarrito();

  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [cp, setCp] = useState("");
  const [metodoPago, setMetodoPago] = useState<"mercado_pago" | "contra_entrega">("contra_entrega");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoConfirmadoId, setPedidoConfirmadoId] = useState<number | null>(null);

  useEffect(() => {
    if (!listo) return;
    if (lineas.length === 0) {
      router.replace("/productos");
    }
  }, [listo, lineas.length, router]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setUserId(session?.user?.id ?? null);
      if (session?.user?.email) {
        setEmail(session.user.email);
      }

      const uid = session?.user?.id;
      if (uid) {
        const { data: cliente } = await supabase
          .from("clientes")
          .select("nombre,email,telefono")
          .eq("id", uid)
          .maybeSingle();
        if (!cancelled && cliente) {
          if (cliente.nombre) setNombre(cliente.nombre);
          if (cliente.email) setEmail(cliente.email);
          if (cliente.telefono) setTelefono(cliente.telefono);
        }
      }
      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("Debes iniciar sesión para confirmar tu pedido.");
      return;
    }

    const direccionEntrega = [
      `${calle.trim()} ${numero.trim()}`.trim(),
      `Col. ${colonia.trim()}`.trim(),
      `${ciudad.trim()}, CP ${cp.trim()}`,
    ].join("\n");

    setSubmitting(true);
    const result = await crearPedido({
      nombre,
      email,
      telefono,
      direccionEntrega,
      metodoPago,
      lineas: lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    vaciar();

    if (metodoPago === "mercado_pago") {
      const base = process.env.NEXT_PUBLIC_MERCADOPAGO_REDIRECT_URL?.trim();
      if (base) {
        try {
          const u = new URL(base);
          u.searchParams.set("external_reference", String(result.pedidoId));
          window.location.href = u.toString();
        } catch {
          window.location.href = `${base}?external_reference=${encodeURIComponent(String(result.pedidoId))}`;
        }
      } else {
        window.location.href = "https://www.mercadopago.com.mx/";
      }
      return;
    }

    setPedidoConfirmadoId(result.pedidoId);
  }

  if (!listo) {
    return (
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-56 rounded-lg bg-white/10" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[420px] rounded-2xl bg-white/10" />
            <div className="h-[320px] rounded-2xl bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  if (lineas.length === 0) {
    return null;
  }

  const bgShell = (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.18), transparent 55%)",
        }}
      />
    </>
  );

  if (pedidoConfirmadoId !== null) {
    return (
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
        {bgShell}
        <div className="relative mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.08] px-8 py-12 text-center shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-emerald-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400/90">
              Pedido registrado
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">¡Gracias por tu compra!</h1>
            <p className="mt-4 text-white/65">
              Tu número de pedido es{" "}
              <span className="font-semibold tabular-nums text-white">#{pedidoConfirmadoId}</span>. Pagarás al recibir
              tu pedido.
            </p>
            <Link
              href="/pedidos"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all hover:bg-[#3385ff]"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/productos"
              className="mt-4 block text-sm font-medium text-white/50 transition-colors hover:text-[#0066FF]"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
      {bgShell}

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Finalizar compra</h1>
        <p className="mt-2 max-w-xl text-sm text-white/55">
          Completa tus datos de envío y elige cómo quieres pagar.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
            {!authReady ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 rounded-lg bg-white/10" />
                <div className="h-10 rounded-lg bg-white/10" />
                <div className="h-32 rounded-lg bg-white/10" />
              </div>
            ) : !userId ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-5 py-6 text-center">
                <p className="text-sm font-medium text-amber-100/90">Inicia sesión para confirmar tu pedido</p>
                <p className="mt-2 text-sm text-white/55">
                  Tus pedidos se guardan vinculados a tu cuenta de forma segura.
                </p>
                <Link
                  href="/login?next=/checkout"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#3385ff]"
                >
                  Iniciar sesión
                </Link>
                <p className="mt-4 text-xs text-white/40">
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro?next=/checkout" className="font-medium text-[#0066FF] hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-nombre" className={authLabelClass}>
                      Nombre completo
                    </label>
                    <input
                      id="checkout-nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={authFieldClass}
                      placeholder="Nombre y apellidos"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className={authLabelClass}>
                      Correo electrónico
                    </label>
                    <input
                      id="checkout-email"
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
                    <label htmlFor="checkout-telefono" className={authLabelClass}>
                      Teléfono
                    </label>
                    <input
                      id="checkout-telefono"
                      name="telefono"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={authFieldClass}
                      placeholder="10 dígitos"
                    />
                  </div>
                </div>

                <div>
                  <p className={authLabelClass}>Dirección de entrega</p>
                  <div className="grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="checkout-calle" className="sr-only">
                        Calle
                      </label>
                      <input
                        id="checkout-calle"
                        name="calle"
                        type="text"
                        autoComplete="street-address"
                        required
                        value={calle}
                        onChange={(e) => setCalle(e.target.value)}
                        className={authFieldClass}
                        placeholder="Calle"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-numero" className="sr-only">
                        Número
                      </label>
                      <input
                        id="checkout-numero"
                        name="numero"
                        type="text"
                        autoComplete="address-line2"
                        required
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className={authFieldClass}
                        placeholder="Número"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="checkout-colonia" className="sr-only">
                        Colonia
                      </label>
                      <input
                        id="checkout-colonia"
                        name="colonia"
                        type="text"
                        required
                        value={colonia}
                        onChange={(e) => setColonia(e.target.value)}
                        className={authFieldClass}
                        placeholder="Colonia"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-ciudad" className="sr-only">
                        Ciudad
                      </label>
                      <input
                        id="checkout-ciudad"
                        name="ciudad"
                        type="text"
                        autoComplete="address-level2"
                        required
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className={authFieldClass}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor="checkout-cp" className="sr-only">
                        Código postal
                      </label>
                      <input
                        id="checkout-cp"
                        name="cp"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                        value={cp}
                        onChange={(e) => setCp(e.target.value)}
                        className={authFieldClass}
                        placeholder="CP"
                      />
                    </div>
                  </div>
                </div>

                <fieldset className="space-y-3">
                  <legend className={`${authLabelClass} mb-3 block`}>Método de pago</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/12 bg-black/25 px-4 py-4 transition-colors has-[:checked]:border-[#0066FF]/45 has-[:checked]:bg-[#0066FF]/10">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="mercado_pago"
                      checked={metodoPago === "mercado_pago"}
                      onChange={() => setMetodoPago("mercado_pago")}
                      className="mt-1 size-4 shrink-0 accent-[#0066FF]"
                    />
                    <span>
                      <span className="block font-semibold text-white">Pagar con Mercado Pago</span>
                      <span className="mt-1 block text-sm text-white/50">
                        Serás redirigido para completar el pago en línea de forma segura.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/12 bg-black/25 px-4 py-4 transition-colors has-[:checked]:border-[#0066FF]/45 has-[:checked]:bg-[#0066FF]/10">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="contra_entrega"
                      checked={metodoPago === "contra_entrega"}
                      onChange={() => setMetodoPago("contra_entrega")}
                      className="mt-1 size-4 shrink-0 accent-[#0066FF]"
                    />
                    <span>
                      <span className="block font-semibold text-white">Pagar al recibir</span>
                      <span className="mt-1 block text-sm text-white/50">
                        Liquidas en efectivo o tarjeta cuando recibas tu pedido.
                      </span>
                    </span>
                  </label>
                </fieldset>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-14 w-full items-center justify-center rounded-full bg-[#0066FF] text-base font-semibold text-white shadow-lg shadow-[#0066FF]/30 transition-all duration-300 hover:bg-[#3385ff] disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? "Guardando…" : "Confirmar pedido"}
                </button>
              </form>
            )}
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-white">Resumen del pedido</h2>
            <ul className="mt-6 max-h-[min(360px,50vh)] space-y-4 overflow-y-auto pr-1">
              {lineas.map((linea) => {
                const subtotal = linea.precio * linea.cantidad;
                return (
                  <li key={linea.productoId} className="flex gap-3 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                    <Link
                      href={`/productos/${linea.productoId}`}
                      className="shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10"
                    >
                      {linea.imagen_url ? (
                        <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px]">
                          <Image
                            src={linea.imagen_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        </div>
                      ) : (
                        <PlaceholderThumb />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/productos/${linea.productoId}`}
                        className="line-clamp-2 text-sm font-semibold leading-snug text-white hover:text-[#0066FF]"
                      >
                        {linea.nombre}
                      </Link>
                      <p className="mt-1 text-xs text-white/45">
                        {linea.cantidad} × {formatoPesos(linea.precio)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-white">{formatoPesos(subtotal)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-white/75">Total</span>
                <span className="text-xl font-semibold tabular-nums text-white">{formatoPesos(totalPrecio)}</span>
              </div>
              <p className="mt-2 text-xs text-white/40">
                Los precios finales se validan al confirmar según el catálogo actual.
              </p>
            </div>
            <Link href="/carrito" className="mt-6 block text-center text-sm font-medium text-white/50 hover:text-[#0066FF]">
              ← Volver al carrito
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
