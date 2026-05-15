import type { Metadata } from "next";
import RegistroForm from "./RegistroForm";

export const metadata: Metadata = {
  title: "Registro | Plaza Mayoreo del Celular",
  description: "Crea tu cuenta en Plaza Mayoreo del Celular.",
};

export default function RegistroPage() {
  return <RegistroForm />;
}
