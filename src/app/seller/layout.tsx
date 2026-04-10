import { createClient } from "@/lib/supabase/server";
import { SellerSidebarNav, SellerMobileNav } from "@/components/seller/SellerNav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessName = "Your business";
  let onboardingDone = false;

  if (user) {
    const { data: sellerProfile } = await supabase
      .from("seller_profiles")
      .select("business_legal_name, dba_name, onboarding_status")
      .eq("user_id", user.id)
      .maybeSingle();
    businessName =
      sellerProfile?.dba_name?.trim() ||
      sellerProfile?.business_legal_name?.trim() ||
      "Your business";
    onboardingDone = sellerProfile?.onboarding_status === "ACTIVE";
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col bg-slate-50 md:flex-row">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-100 px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seller account
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            {businessName}
          </p>
        </div>
        <SellerSidebarNav onboardingDone={onboardingDone} />
      </aside>

      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1">{children}</main>
      </div>

      <SellerMobileNav onboardingDone={onboardingDone} />
    </div>
  );
}
