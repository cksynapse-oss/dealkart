import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/shared/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "TheBuzSale — India's MSME M&A Marketplace",
  description:
    "Verification-first marketplace for buying and selling MSME businesses in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
