import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DUMMY_SELLER_ID = "00000000-0000-0000-0000-000000000001";

/** Paise = rupees × 100 */
const listings = [
  {
    seller_id: DUMMY_SELLER_ID,
    seller_profile_id: null as string | null,
    status: "LIVE" as const,
    headline: "Established Spice Export Business — 15+ Year Track Record",
    description:
      "Heritage Spice Exports sources and processes premium Kerala spices for EU and Middle East buyers. FSSAI-registered facility in Kochi with long-standing export contracts and in-house grading and packaging.",
    vertical: "FNB",
    industry: "FNB" as const,
    sub_category: "Spice Manufacturing & Export",
    city: "Kochi",
    state: "Kerala",
    asking_price: 12_000_000_000,
    revenue_latest: 4_200_000_000,
    ebitda_latest: 850_000_000,
    ebitda_margin: 20.24,
    year_founded: 2009,
    employee_count_range: "RANGE_21_50" as const,
    deal_type: "all",
    close_ready: false,
    gst_verified: true,
    bank_verified: false,
    ca_reviewed: false,
    key_strengths: [
      "15+ years in spice export with repeat EU and GCC buyers",
      "Owned processing and cold-storage capacity in Kochi",
      "FSSAI registration and export documentation in place",
      "Diversified product mix: black pepper, cardamom, vanilla",
    ],
    why_buy: [
      "Stable B2B export revenue with documented purchase orders",
      "Room to scale organic and private-label lines for retail",
      "Kerala origin story resonates with premium spice buyers abroad",
    ],
    growth_opportunities:
      "EU organic certification, D2C spice blends in India, contract farming tie-ups",
    view_count: 0,
  },
  {
    seller_id: DUMMY_SELLER_ID,
    seller_profile_id: null,
    status: "LIVE" as const,
    headline: "Profitable B2B SaaS — Cloud Print Management Platform",
    description:
      "CloudPrint Solutions offers a multi-tenant SaaS for print shops and enterprise fleets: job routing, billing, and device monitoring. Majority revenue from Maharashtra and Karnataka SMBs with low churn.",
    vertical: "TECH",
    industry: "TECH" as const,
    sub_category: "SaaS / Cloud Printing",
    city: "Pune",
    state: "Maharashtra",
    asking_price: 6_500_000_000,
    revenue_latest: 1_800_000_000,
    ebitda_latest: 520_000_000,
    ebitda_margin: 28.89,
    year_founded: 2018,
    employee_count_range: "RANGE_6_20" as const,
    deal_type: "all",
    close_ready: false,
    gst_verified: true,
    bank_verified: false,
    ca_reviewed: false,
    key_strengths: [
      "Recurring subscription revenue from 120+ active tenants",
      "Lean team; founder-led product and engineering",
      "API-ready for copier OEM and reseller integrations",
    ],
    why_buy: [
      "Profitable SaaS with clear upsell path to enterprise plans",
      "Underserved print vertical vs crowded generic ITSM tools",
      "Strong fit for strategic buyer in office automation or managed print",
    ],
    growth_opportunities:
      "National reseller channel, white-label for OEMs, AI-assisted job quoting",
    view_count: 0,
  },
  {
    seller_id: DUMMY_SELLER_ID,
    seller_profile_id: null,
    status: "LIVE" as const,
    headline: "Growing Ayurveda Brand — D2C + Retail Presence",
    description:
      "GreenLeaf Wellness manufactures classical and proprietary Ayurvedic formulations with a growing D2C channel and select Ayurveda clinics and wellness stores across North India.",
    vertical: "HEALTHCARE",
    industry: "HEALTHCARE" as const,
    sub_category: "Ayurveda & Wellness",
    city: "Jaipur",
    state: "Rajasthan",
    asking_price: 3_200_000_000,
    revenue_latest: 950_000_000,
    ebitda_latest: 280_000_000,
    ebitda_margin: 29.47,
    year_founded: 2015,
    employee_count_range: "RANGE_6_20" as const,
    deal_type: "all",
    close_ready: false,
    gst_verified: false,
    bank_verified: false,
    ca_reviewed: false,
    key_strengths: [
      "Own brand with traction in D2C and clinic channels",
      "GMP-aligned small-batch manufacturing in Rajasthan",
      "Portfolio spans churnas, oils, and immunity SKUs",
    ],
    why_buy: [
      "Wellness tailwinds and room to scale modern trade listings",
      "Asset-light model with contract manufacturing optionality",
      "Brand story anchored in authentic Ayurveda positioning",
    ],
    growth_opportunities:
      "Modern trade expansion, Ayush e-commerce marketplaces, franchise clinic model",
    view_count: 0,
  },
];

export async function GET() {
  const { data: existingRows, error: selectError } = await supabaseAdmin
    .from("listings")
    .select("id")
    .eq("seller_id", DUMMY_SELLER_ID);

  if (selectError) {
    return NextResponse.json(
      { ok: false, error: selectError.message },
      { status: 500 }
    );
  }

  if (existingRows && existingRows.length > 0) {
    return NextResponse.json({
      ok: true,
      count: existingRows.length,
      message: "Already seeded",
    });
  }

  const { error } = await supabaseAdmin.from("listings").insert(listings);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: 3 });
}
