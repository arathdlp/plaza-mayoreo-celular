"use client";

import PageReveal from "@/components/PageReveal";
import { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import { useCarrito } from "@/hooks/useCarrito";
import {
  accentLabel,
  alertError,
  alertWarning,
  btnPrimary,
  cardStatic,
  headingPage,
  panelMuted,
  priceLg,
  textMuted,
} from "@/lib/design-system";
import { formatoPesos } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { crearPedido } from "./actions";

function PlaceholderThumb() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 text-[#0066FF]/35 sm:h-[72px] sm:w-[72px]"
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
  const searchParams = useSearchParams();
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
  /** Evita redirect a /productos cuando el carrito se vacía tras confirmar */
  const [salirTrasPedido, setSalirTrasPedido] = useState(false);

  useEffect(() => {
    if (searchParams.get("pago") === "fallido") {
      setError("El pago no se completó. Revisa tu método de pago o intenta de nuevo.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!listo || salirTrasPedido || submitting) return;
    if (lineas.length === 0) {
      router.replace("/productos");
    }
  }, [listo, lineas.length, router, salirTrasPedido, submitting]);

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

    console.log("[checkout] crearPedido result", result);

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    if (metodoPago === "mercado_pago") {
      try {
        const prefRes = await fetch("/api/mercadopago/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedidoId: result.pedidoId,
            comprador: { nombre, email, telefono },
            items: lineas.map((l) => ({
              productoId: l.productoId,
              cantidad: l.cantidad,
              nombre: l.nombre,
              precio: l.precio,
            })),
          }),
        });

        const prefData = (await prefRes.json()) as { init_point?: string; error?: string };

        if (!prefRes.ok || !prefData.init_point) {
          setError(prefData.error ?? "No se pudo iniciar el pago con Mercado Pago.");
          return;
        }

        setSalirTrasPedido(true);
        vaciar();
        window.location.href = prefData.init_point;
        return;
      } catch {
        setError("Error de conexión con Mercado Pago. Intenta de nuevo.");
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setSalirTrasPedido(true);
    setSubmitting(false);
    router.replace(`/pedido-confirmado?id=${result.pedidoId}`);
  }

  if (!listo) {
    return (
      <main className="relative flex-1 overflow-hidden bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-56 rounded-lg bg-gray-200" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[420px] rounded-2xl bg-gray-200" />
            <div className="h-[320px] rounded-2xl bg-gray-200" />
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


  return (
    <PageReveal as="main" className="relative flex-1 overflow-hidden bg-white">
      {bgShell}

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <p className={accentLabel}>Checkout</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">Finalizar compra</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
          Completa tus datos de envío y elige cómo quieres pagar.
        </p>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
            {!authReady ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 rounded-lg bg-gray-200" />
                <div className="h-10 rounded-lg bg-gray-200" />
                <div className="h-32 rounded-lg bg-gray-200" />
              </div>
            ) : !userId ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
                <p className="text-sm font-medium text-amber-900">Inicia sesión para confirmar tu pedido</p>
                <p className="mt-2 text-sm text-gray-500">
                  Tus pedidos se guardan vinculados a tu cuenta de forma segura.
                </p>
                <Link
                  href="/login?next=/checkout"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#3385ff]"
                >
                  Iniciar sesión
                </Link>
                <p className="mt-4 text-xs text-gray-400">
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
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                  <div className="mt-3 grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="checkout-calle" className={authLabelClass}>
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
                      <label htmlFor="checkout-numero" className={authLabelClass}>
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
                      <label htmlFor="checkout-colonia" className={authLabelClass}>
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
                      <label htmlFor="checkout-ciudad" className={authLabelClass}>
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
                      <label htmlFor="checkout-cp" className={authLabelClass}>
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
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors has-[:checked]:border-[#0066FF]/45 has-[:checked]:bg-[#0066FF]/10">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="mercado_pago"
                      checked={metodoPago === "mercado_pago"}
                      onChange={() => setMetodoPago("mercado_pago")}
                      className="mt-1 size-4 shrink-0 accent-[#0066FF]"
                    />
                    <span>
                      <span className="block font-semibold text-[#111827]">Pagar con Mercado Pago</span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Serás redirigido para completar el pago en línea de forma segura.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors has-[:checked]:border-[#0066FF]/45 has-[:checked]:bg-[#0066FF]/10">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="contra_entrega"
                      checked={metodoPago === "contra_entrega"}
                      onChange={() => setMetodoPago("contra_entrega")}
                      className="mt-1 size-4 shrink-0 accent-[#0066FF]"
                    />
                    <span>
                      <span className="block font-semibold text-[#111827]">Pagar al recibir</span>
                      <span className="mt-1 block text-sm text-gray-500">
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

          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#111827]">Resumen del pedido</h2>
            <ul className="mt-6 max-h-[min(360px,50vh)] space-y-4 overflow-y-auto pr-1">
              {lineas.map((linea) => {
                const subtotal = linea.precio * linea.cantidad;
                return (
                  <li key={linea.productoId} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <Link
                      href={`/productos/${linea.productoId}`}
                      className="shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200"
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
                        className="line-clamp-2 text-sm font-semibold leading-snug text-[#111827] hover:text-[#0066FF]"
                      >
                        {linea.nombre}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">
                        {linea.cantidad} × {formatoPesos(linea.precio)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-[#111827]">{formatoPesos(subtotal)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-gray-700">Total</span>
                <span className="text-xl font-semibold tabular-nums text-[#111827]">{formatoPesos(totalPrecio)}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Los precios finales se validan al confirmar según el catálogo actual.
              </p>
            </div>
            <Link href="/carrito" className="mt-6 block text-center text-sm font-medium text-gray-500 hover:text-[#0066FF]">
              ← Volver al carrito
            </Link>
          </aside>
        </div>
      </div>
    </PageReveal>
  );
}
