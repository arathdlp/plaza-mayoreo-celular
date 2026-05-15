import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckoutCliente from "./CheckoutCliente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Plaza Mayoreo del Celular",
  description: "Finaliza tu compra.",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <CheckoutCliente />
      <Footer />
    </>
  );
}
