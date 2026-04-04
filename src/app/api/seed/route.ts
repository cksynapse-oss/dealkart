import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { secret } = await request.json().catch(() => ({ secret: "" }));

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Get any seller to use as seller_id, or fall back to any user
  const { data: seller } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "SELLER")
    .limit(1)
    .maybeSingle();

  const { data: anyUser } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();

  const sellerId = seller?.id ?? anyUser?.id;
  if (!sellerId) {
    return NextResponse.json({ error: "No users found. Register at least one user first." }, { status: 400 });
  }

  const listings = [
    {
      seller_id: sellerId,
      status: "LIVE",
      headline: "Profitable 12-Outlet QSR Chain — Bengaluru",
      description: "Well-established quick-service restaurant chain operating across Bengaluru with strong brand recognition and loyal customer base. All outlets are company-owned with long-term leases secured.",
      vertical: "BUSINESS_ACQUISITION",
      industry: "FNB",
      sub_category: "QSR Chain",
      city: "Bengaluru",
      state: "Karnataka",
      asking_price: 150000000000,
      revenue_latest: 85000000000,
      ebitda_latest: 24000000000,
      ebitda_margin: 28.24,
      year_founded: 2015,
      employee_count_range: "RANGE_51_200",
      deal_type: "Full Acquisition",
      close_ready: true,
      gst_verified: true,
      bank_verified: true,
      ca_reviewed: true,
      key_strengths: ["Strong brand recall", "Profitable since Year 2", "All outlets owned", "Established supply chain", "Trained team of 150+"],
      why_buy: [
        "Market leader in Bengaluru South with 35% local QSR market share across 12 outlets — proven demand with loyal repeat customer base",
        "28% EBITDA margin driven by own commissary kitchen and bulk procurement — best-in-class unit economics for Indian QSR",
        "4.6 average Google rating across all 12 outlets — strong brand trust built over 9 years of consistent quality",
        "Fully systematized operations with POS, inventory, and HR systems — zero owner dependency, runs autonomously",
        "Cloud kitchen expansion opportunity: existing commissary can support 8 additional delivery-only brands with minimal capex"
      ],
      growth_opportunities: "Cloud kitchen expansion across Bengaluru, franchise model for Tier-2 cities, D2C packaged food line",
    },
    {
      seller_id: sellerId,
      status: "LIVE",
      headline: "Established Diagnostic Lab Network — Mumbai",
      description: "NABL-accredited diagnostic lab with 3 collection centers across Mumbai suburbs. Strong B2B tie-ups with 5 major hospitals providing 60% of revenue.",
      vertical: "BUSINESS_ACQUISITION",
      industry: "HEALTHCARE",
      sub_category: "Diagnostic Lab",
      city: "Mumbai",
      state: "Maharashtra",
      asking_price: 60000000000,
      revenue_latest: 32000000000,
      ebitda_latest: 11000000000,
      ebitda_margin: 34.38,
      year_founded: 2017,
      employee_count_range: "RANGE_21_50",
      deal_type: "Full Acquisition",
      close_ready: true,
      gst_verified: true,
      bank_verified: true,
      ca_reviewed: true,
      key_strengths: ["NABL accredited", "3 collection centers", "Hospital tie-ups", "34% EBITDA margin", "Growing 25% YoY"],
      why_buy: [
        "NABL-accredited lab with 34% EBITDA margin — premium positioning in Mumbai diagnostic market",
        "25% YoY revenue growth for 3 consecutive years driven by B2B hospital partnerships",
        "Exclusive tie-ups with 5 major hospitals generating 60% of revenue with long-term contracts",
        "Full automation with LIS integrated across all collection centers — 4-hour TAT for 90% of tests",
        "Home collection service covering 15km radius — untapped potential for subscription health packages"
      ],
      growth_opportunities: "Home collection expansion, corporate wellness contracts, pathology franchise model",
    },
    {
      seller_id: sellerId,
      status: "LIVE",
      headline: "25-Year Auto Components Manufacturer — Pune",
      description: "Established auto components manufacturer supplying to major OEMs. ISO 9001 certified with modern CNC facility. Zero debt, fully depreciated machinery.",
      vertical: "BUSINESS_ACQUISITION",
      industry: "MANUFACTURING",
      sub_category: "Auto Components",
      city: "Pune",
      state: "Maharashtra",
      asking_price: 220000000000,
      revenue_latest: 180000000000,
      ebitda_latest: 36000000000,
      ebitda_margin: 20.00,
      year_founded: 2001,
      employee_count_range: "RANGE_51_200",
      deal_type: "Full Acquisition",
      close_ready: true,
      gst_verified: true,
      bank_verified: true,
      ca_reviewed: true,
      key_strengths: ["25 years in business", "OEM supplier to top brands", "ISO 9001 certified", "Modern CNC facility", "Zero debt"],
      why_buy: [
        "25-year track record as Tier-1 supplier to 3 major Indian OEMs with zero quality rejections in last 5 years",
        "18Cr revenue with 20% EBITDA on zero debt — clean balance sheet with fully depreciated machinery",
        "35,000 sq ft owned factory with 12 CNC machines, powder coating line, and in-house tool room",
        "ISO 9001:2015 certified with IATF 16949 readiness — positioned for export market entry",
        "EV transition opportunity: existing capabilities directly applicable to EV drivetrain components"
      ],
      growth_opportunities: "EV component manufacturing, export to Southeast Asia, backward integration into raw materials",
    },
    {
      seller_id: sellerId,
      status: "LIVE",
      headline: "Growing D2C Beauty Brand — Delhi NCR",
      description: "Fast-growing direct-to-consumer beauty and personal care brand with strong social media presence and Amazon bestseller products in 3 categories.",
      vertical: "BUSINESS_ACQUISITION",
      industry: "RETAIL",
      sub_category: "Beauty & Personal Care",
      city: "New Delhi",
      state: "Delhi NCR",
      asking_price: 35000000000,
      revenue_latest: 18000000000,
      ebitda_latest: 4500000000,
      ebitda_margin: 25.00,
      year_founded: 2021,
      employee_count_range: "RANGE_6_20",
      deal_type: "Full Acquisition",
      close_ready: false,
      gst_verified: true,
      bank_verified: true,
      ca_reviewed: true,
      key_strengths: ["Amazon bestseller in 3 categories", "50K+ Instagram followers", "25% EBITDA margin", "Asset-light model", "Recurring subscriptions"],
      why_buy: [
        "Amazon #1 bestseller in 3 skincare categories with 4.4+ ratings and 15,000+ reviews",
        "25% EBITDA margin on asset-light model — contract manufacturing with zero inventory risk",
        "50K organic Instagram followers with 8% engagement rate — 3x industry average for beauty brands",
        "40% of revenue from repeat customers on auto-replenishment subscriptions — high lifetime value",
        "Zero offline presence — quick commerce and modern retail expansion can 3x revenue within 18 months"
      ],
      growth_opportunities: "Quick commerce distribution, international expansion to UAE/SEA, men's grooming line launch",
    },
    {
      seller_id: sellerId,
      status: "LIVE",
      headline: "Profitable IT Services Company — Hyderabad",
      description: "Boutique IT services firm specializing in enterprise Java and cloud migration. Long-term contracts with US-based clients providing revenue visibility through 2028.",
      vertical: "BUSINESS_ACQUISITION",
      industry: "TECH",
      sub_category: "IT Services & Consulting",
      city: "Hyderabad",
      state: "Telangana",
      asking_price: 80000000000,
      revenue_latest: 50000000000,
      ebitda_latest: 15000000000,
      ebitda_margin: 30.00,
      year_founded: 2014,
      employee_count_range: "RANGE_21_50",
      deal_type: "Full Acquisition",
      close_ready: true,
      gst_verified: true,
      bank_verified: true,
      ca_reviewed: true,
      key_strengths: ["30% EBITDA margin", "85% USD revenue", "12-year track record", "Zero client churn", "Senior engineering team"],
      why_buy: [
        "30% EBITDA margin with 85% USD-denominated revenue — natural forex hedge with strong unit economics",
        "Zero client churn in 3 years across 8 enterprise accounts — average contract value exceeds $2M annually",
        "Team of 35 senior engineers with average 8 years experience in Java/AWS — rare talent moat",
        "3 multi-year MSA contracts worth 12Cr annually providing revenue visibility through 2028",
        "AI/ML services opportunity: existing client base actively requesting GenAI capabilities — ready-made demand"
      ],
      growth_opportunities: "AI/ML practice buildout, GCC setup service, nearshore delivery center in Tier-2 city",
    },
  ];

  const { data, error } = await supabase.from("listings").insert(listings).select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: data?.length ?? 0 });
}
