import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/shared/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | TheBuzSale",
    default: "TheBuzSale — India's MSME M&A Marketplace",
  },
  description:
    "Verification-first marketplace for buying and selling MSME businesses in India. CA-verified financials, NDA-protected deals.",
  keywords: [
    "MSME",
    "M&A",
    "mergers and acquisitions",
    "business sale",
    "buy business",
    "sell business",
    "India",
    "marketplace",
    "verified listings",
    "CA verified",
    "SME",
    "small business",
    "enterprise sale",
  ],
  authors: [{ name: "TheBuzSale" }],
  creator: "TheBuzSale",
  publisher: "TheBuzSale",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thebuzsale.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://thebuzsale.com",
    title: "TheBuzSale — India's MSME M&A Marketplace",
    description:
      "Verification-first marketplace for buying and selling MSME businesses in India. CA-verified financials, NDA-protected deals.",
    siteName: "TheBuzSale",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheBuzSale — India's MSME M&A Marketplace",
    description:
      "Verification-first marketplace for buying and selling MSME businesses in India. CA-verified financials, NDA-protected deals.",
    site: "@thebuzsale",
    creator: "@thebuzsale",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
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
