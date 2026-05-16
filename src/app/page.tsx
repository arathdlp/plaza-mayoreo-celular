import Categories from "@/components/Categories";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Inicio",
  description: `${SITE_NAME} en Morelia: refacciones, accesorios, capacitación y servicio. Pantallas, baterías, tapas y más.`,
  path: "/",
});

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <Services />
        <Features />
      </main>
      <Footer />
    </>
  );
}
