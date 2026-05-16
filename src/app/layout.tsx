import { rootMetadata } from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066ff" },
    { media: "(prefers-color-scheme: dark)", color: "#06060a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] font-sans md:pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
