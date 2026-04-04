import { createClient } from "@/lib/supabase/server";
import { MarketplaceClient } from "@/components/buyer/MarketplaceClient";

export const metadata = {
  title: "Marketplace — TheBuzSale",
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
