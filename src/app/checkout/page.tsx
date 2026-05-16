import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import CheckoutCliente from "./CheckoutCliente";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Confirma tu pedido, elige método de pago y datos de entrega en Morelia.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="relative flex-1 overflow-hidden bg-white px-4 py-16">
            <div className="mx-auto max-w-6xl animate-pulse text-gray-500">Cargando checkout…</div>
          </main>
        }
      >
        <CheckoutCliente />
      </Suspense>
      <Footer />
    </>
  );
}
