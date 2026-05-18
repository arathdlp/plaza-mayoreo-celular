import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import ServiciosPage from "./ServiciosPage";

export const metadata: Metadata = pageMetadata({
  title: "Servicios",
  description:
    "Reparaciones, desbloqueos, instalaciones a domicilio y asesorías técnicas para celular en Morelia.",
  path: "/servicios",
});

export default function ServiciosRoutePage() {
  return (
    <>
      <Header />
      <ServiciosPage />
      <Footer />
    </>
  );
}
