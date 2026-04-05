import Link from "next/link";
import type { Metadata } from "next";
import { Shield, CheckCircle, Lock, ArrowRight, Building2, Search, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "TheBuzSale — India's MSME M&A Marketplace",
  description: "Buy and sell verified MSME businesses in India. CA-reviewed financials, GST-verified listings, NDA-protected deals. Close in 4 weeks, not 4 months.",
  keywords: [
    "MSME marketplace India",
    "buy business India",
    "sell business India",
    "verified business listings",
    "CA reviewed financials",
    "M&A platform India",
    "small business sale",
    "enterprise acquisition",
  ],
  openGraph: {
    title: "TheBuzSale — India's MSME M&A Marketplace",
    description: "Buy and sell verified MSME businesses in India. CA-reviewed financials, GST-verified listings, NDA-protected deals.",
    url: "/",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "TheBuzSale - India's MSME M&A Marketplace",
      },
    ],
  },
  twitter: {
    title: "TheBuzSale — India's MSME M&A Marketplace",
    description: "Buy and sell verified MSME businesses in India. CA-reviewed financials, GST-verified listings, NDA-protected deals.",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "TheBuzSale - India's MSME M&A Marketplace",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Shield className="size-3.5" />
            100% verified listings
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
            India&apos;s most trusted{" "}
            <span className="text-emerald-600">MSME M&amp;A</span>{" "}
            marketplace
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Verified businesses. CA-reviewed financials. Close in 4 weeks, not 4 months.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base">
                <Building2 className="size-5 mr-2" />
                List your business
              </Button>
            </Link>
            <Link href="/buyer/marketplace">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-300">
                <Search className="size-5 mr-2" />
                Browse businesses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">100% verified listings</p>
                <p className="text-xs text-slate-500">GST + bank statement verification on every listing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">CA-reviewed financials</p>
                <p className="text-xs text-slate-500">Chartered Accountant reviews every P&L before listing goes live</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Lock className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">NDA-protected deals</p>
                <p className="text-xs text-slate-500">Seller identity protected until both parties are committed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={Building2}
              title="Register & verify"
              description="Complete your profile, upload financial documents, and get GST-verified in under 20 minutes."
            />
            <StepCard
              step={2}
              icon={Search}
              title="List or browse"
              description="Sellers list their business with our 4-step wizard. Buyers browse verified, anonymised listings."
            />
            <StepCard
              step={3}
              icon={FileCheck}
              title="Close the deal"
              description="Sign NDA, access due diligence data room, submit LOI — all on one platform."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">15+</p>
              <p className="text-sm text-slate-400 mt-1">Verified listings</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">₹50Cr+</p>
              <p className="text-sm text-slate-400 mt-1">Active deals</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">100+</p>
              <p className="text-sm text-slate-400 mt-1">Registered buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ready to make your move?
          </h2>
          <p className="text-slate-600 mb-8">
            Whether you&apos;re exiting your business or acquiring your next one, TheBuzSale makes it verified, fast, and confidential.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base">
              Get started free <ArrowRight className="size-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            TheBuzSale © {new Date().getFullYear()} · Built for Indian MSMEs · hello@thebuzsale.com
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ step, icon: Icon, title, description }: { step: number; icon: any; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-4">
        <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
          <Icon className="size-6 text-emerald-600" />
        </div>
        <span className="absolute -top-2 -right-2 size-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
