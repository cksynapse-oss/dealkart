import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/seller/SettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { SellerProfile } from "@/types/database";

async function getSellerData() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, mobile, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/seller/onboarding");
  }

  if (profile.role !== "SELLER") {
    redirect("/dashboard");
  }

  const { data: sellerProfile, error: sellerError } = await supabase
    .from("seller_profiles")
    .select("id, dba_name, business_legal_name")
    .eq("user_id", user.id)
    .single();

  if (sellerError || !sellerProfile) {
    redirect("/seller/onboarding");
  }

  return {
    user,
    profile: {
      fullName: profile.full_name,
      email: profile.email || "",
      mobile: profile.mobile,
      dbaName: sellerProfile.dba_name,
      businessLegalName: sellerProfile.business_legal_name,
    },
    sellerProfileId: sellerProfile.id,
  };
}

export default async function SellerSettingsPage() {
  const { user, profile, sellerProfileId } = await getSellerData();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col bg-slate-50">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Manage your account settings and preferences
            </p>
          </div>

          <SettingsForm
            profile={profile}
            userId={user.id}
            sellerProfileId={sellerProfileId}
          />
        </div>
      </div>
    </div>
  );
}
