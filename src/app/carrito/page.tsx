import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import CarritoVista from "./CarritoVista";

export const metadata: Metadata = pageMetadata({
  title: "Carrito",
  description: "Revisa las refacciones y accesorios que vas a comprar antes de pagar.",
  path: "/carrito",
});

export default function CarritoPage() {
  return (
    <>
      <Header />
      <CarritoVista />
      <Footer />
    </>
  );
}
