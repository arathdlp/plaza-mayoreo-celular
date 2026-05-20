import RepartidorDashboardClient from "@/app/repartidor/dashboard/RepartidorDashboardClient";
import { loadRepartidorDashboard } from "@/lib/repartidor-dashboard";
import { getRepartidorSession } from "@/lib/repartidor-session";
import { pageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Repartidor · Panel",
  description: "Envíos activos, resumen del día e historial de entregas.",
  path: "/repartidor/dashboard",
  noindex: true,
});

export default async function RepartidorDashboardPage() {
  const session = await getRepartidorSession();
  if (!session) redirect("/repartidor/login");

  const data = await loadRepartidorDashboard(session.id);

  return <RepartidorDashboardClient session={session} data={data} />;
}
