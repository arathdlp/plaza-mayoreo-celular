import RepartidoresAdminCliente from "@/app/admin/repartidores/RepartidoresAdminCliente";
import { listRepartidoresAdmin } from "@/app/admin/repartidores/actions";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Admin · Repartidores",
  description: "Gestión de cuentas de repartidores.",
  path: "/admin/repartidores",
  noindex: true,
});

export default async function AdminRepartidoresPage() {
  const repartidores = await listRepartidoresAdmin();
  return <RepartidoresAdminCliente initialRepartidores={repartidores} />;
}
