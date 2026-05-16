import Header from "@/components/Header";
import PrivateChromeBody from "./PrivateChromeBody";
import type { ReactNode } from "react";

type PrivateChromeProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function PrivateChrome(props: PrivateChromeProps) {
  return (
    <>
      <Header />
      <PrivateChromeBody {...props} />
    </>
  );
}
