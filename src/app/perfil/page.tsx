import PerfilForm from "@/app/perfil/PerfilForm";
import { obtenerPerfil } from "@/app/perfil/actions";
import Header from "@/components/Header";
import PrivateChromeBody from "@/components/auth/PrivateChromeBody";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Mi perfil",
  description: "Administra tu cuenta en Plaza Mayoreo del Celular.",
  path: "/perfil",
  noindex: true,
});

export default async function PerfilPage() {
  const res = await obtenerPerfil();
  if (!res.ok) redirect("/login?next=/perfil");

  return (
    <>
      <Header />
      <PrivateChromeBody
        title="Mi perfil"
        description="Administra tus datos y revisa tu actividad en la tienda."
      >
        <PerfilForm perfil={res.perfil} stats={res.stats} />
      </PrivateChromeBody>
    </>
  );
}
