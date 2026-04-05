import { createClient } from "@/lib/supabase/server";
import { MarketplaceClient } from "@/components/buyer/MarketplaceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Businesses | TheBuzSale",
  description: "Browse verified MSME businesses for sale in India. Filter by industry, revenue, location. CA-reviewed financials and GST-verified listings.",
  keywords: [
    "browse businesses India",
    "buy MSME business",
    "business for sale",
    "verified listings",
    "search business",
    "M&A opportunities",
    "small business acquisition",
  ],
  openGraph: {
    title: "Browse Businesses | TheBuzSale",
    description: "Browse verified MSME businesses for sale in India. Filter by industry, revenue, location. CA-reviewed financials and GST-verified listings.",
    url: "/buyer/marketplace",
  },
  twitter: {
    title: "Browse Businesses | TheBuzSale",
    description: "Browse verified MSME businesses for sale in India. Filter by industry, revenue, location. CA-reviewed financials and GST-verified listings.",
  },
};

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "LIVE")
    .order("created_at", { ascending: false });

  return <MarketplaceClient listings={listings ?? []} />;
}
