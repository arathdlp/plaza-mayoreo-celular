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
      <CheckoutCliente />
      <Footer />
    </>
  );
}
