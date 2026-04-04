import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { IndustryType } from "@/types/database";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  if (!profile) {
    return NextResponse.json(
      { error: "Please complete your onboarding first" },
      { status: 400 }
    );
  }

  const { data: fin, error: finErr } = await supabase
    .from("seller_financials")
    .select("*")
    .eq("seller_profile_id", profile.id)
    .maybeSingle();

  if (finErr) {
    return NextResponse.json({ error: finErr.message }, { status: 400 });
  }

  const legal = profile.business_legal_name ?? "Business";
  const sub = profile.sub_category ?? profile.industry ?? "MSME";
  const headline = `${legal} — ${sub}`;

  const addr = profile.registered_address ?? {};

  const insertPayload = {
    seller_id: user.id,
    seller_profile_id: profile.id,
    status: "PENDING_REVIEW" as const,
    headline,
    description: null as string | null,
    vertical: (profile.industry as IndustryType | null) ?? "OTHER",
    industry: profile.industry as IndustryType | null,
    sub_category: profile.sub_category,
    city: addr.city ?? null,
    state: addr.state ?? null,
    asking_price: fin?.asking_price ?? null,
    revenue_latest: fin?.revenue_current_fy ?? null,
    ebitda_latest: fin?.ebitda_latest ?? null,
    ebitda_margin: null as number | null,
    year_founded: profile.year_established,
    employee_count_range: fin?.employee_count_range ?? null,
    deal_type: "all",
    close_ready: false,
    gst_verified: profile.gstin_verified ?? false,
    bank_verified: false,
    ca_reviewed: false,
    key_strengths: [] as string[],
    why_buy: [] as string[],
    growth_opportunities: null as string | null,
    view_count: 0,
  };

  const { data: listing, error: insErr } = await supabase
    .from("listings")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, listingId: listing.id });
}
