import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Building2, Phone, Mail, Calendar, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatINRShort, formatINR, getIndustryLabel, getEmployeeLabel, daysSince } from "@/lib/utils";
import { AdminListingActions } from "@/components/admin/AdminListingActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("listings").select("headline").eq("id", id).single();
  return { title: data?.headline ? `Review: ${data.headline} — Admin` : "Review Listing — Admin" };
}

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles!listings_seller_id_fkey(full_name, email, mobile)")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", listing.seller_id)
    .maybeSingle();

  let financials = null;
  let documents: any[] = [];
  let preferences = null;

  if (sellerProfile) {
    const { data: fin } = await supabase
      .from("seller_financials")
      .select("*")
      .eq("seller_profile_id", sellerProfile.id)
      .maybeSingle();
    financials = fin;

    const { data: docs } = await adminSupabase
      .from("seller_documents")
      .select("*")
      .eq("seller_profile_id", sellerProfile.id)
      .order("uploaded_at", { ascending: false });

    if (docs) {
      const docsWithUrls = await Promise.all(
        docs.map(async (doc) => {
          const { data: signedUrlData } = await adminSupabase.storage
            .from("seller-documents")
            .createSignedUrl(doc.storage_path, 60 * 60);
          return { ...doc, signedUrl: signedUrlData?.signedUrl ?? null };
        })
      );
      documents = docsWithUrls;
    }

    const { data: pref } = await supabase
      .from("seller_preferences")
      .select("*")
      .eq("seller_profile_id", sellerProfile.id)
      .maybeSingle();
    preferences = pref;
  }

  const seller = listing.profiles as any;
  const rev = listing.revenue_latest != null ? Number(listing.revenue_latest) : null;
  const ebitdaNum = listing.ebitda_latest != null ? Number(listing.ebitda_latest) : null;
  const margin = rev && rev > 0 && ebitdaNum != null ? Math.round((ebitdaNum / rev) * 100) : null;

  const reasonLabels: Record<string, string> = {
    RETIREMENT: "Retirement", NEW_VENTURE: "New Venture", HEALTH: "Health Reasons",
    FINANCIAL: "Financial Reasons", DISPUTE: "Partner Dispute", OTHER: "Other",
  };
  const gstLabels: Record<string, string> = {
    REGULAR: "Regular", IRREGULAR: "Irregular", COMPOSITION: "Composition", NA: "N/A",
  };
  const itrLabels: Record<string, string> = {
    FILED_2YR: "Filed (2 years)", FILED_1YR: "Filed (1 year)", NOT_FILED: "Not Filed", NA: "N/A",
  };
  const timelineLabels: Record<string, string> = {
    ASAP: "ASAP", ONE_TO_THREE: "1–3 months", THREE_TO_SIX: "3–6 months",
    FLEXIBLE: "Flexible", NO_RUSH: "No Rush",
  };
  const confLabels: Record<string, string> = {
    STANDARD: "Standard", HIGH: "High", ULTRA: "Ultra",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/listings" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="size-3.5" /> Back to listings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{listing.headline || "Untitled Listing"}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submitted {daysSince(listing.created_at)} days ago · {listing.deal_type ?? ""}
          </p>
        </div>
        <div className="shrink-0">
          <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Seller Contact</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">{seller?.full_name ?? "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-blue-600" />
              <span className="text-sm text-slate-700">{seller?.email ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">{seller?.mobile ?? "No phone"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Key Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Metric label="Asking Price" value={formatINRShort(listing.asking_price)} highlight />
            <Metric label="Annual Revenue" value={formatINRShort(listing.revenue_latest)} />
            <Metric label="EBITDA" value={`${formatINRShort(listing.ebitda_latest)}${margin !== null ? ` (${margin}%)` : ""}`} />
            <Metric label="Team Size" value={getEmployeeLabel(listing.employee_count_range)} />
            <Metric label="Founded" value={listing.year_founded?.toString() ?? "—"} />
          </div>
        </CardContent>
      </Card>

      {(listing.description || listing.growth_opportunities || listing.key_strengths?.length > 0) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {listing.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{listing.description}</p>
              </div>
            )}
            {listing.key_strengths?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {listing.key_strengths.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {listing.growth_opportunities && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Growth Opportunities</p>
                <p className="text-sm text-slate-700 leading-relaxed">{listing.growth_opportunities}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {sellerProfile && (
        <Card>
          <CardHeader><CardTitle className="text-base">Business Identity (Onboarding Layer 1)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Legal Name" value={sellerProfile.business_legal_name} />
              <Field label="DBA / Brand" value={sellerProfile.dba_name} />
              <Field label="Business Type" value={sellerProfile.business_type} />
              <Field label="Industry" value={sellerProfile.industry ? getIndustryLabel(sellerProfile.industry) : null} />
              <Field label="GSTIN" value={sellerProfile.gstin} />
              <Field label="PAN" value={sellerProfile.pan_number} />
              <Field label="Year Established" value={sellerProfile.year_established?.toString()} />
              <Field label="Sale Intent" value={sellerProfile.sale_intent?.replace(/_/g, " ")} />
              <Field label="GSTIN Verified" value={sellerProfile.gstin_verified ? "Yes" : "No"} />
            </div>
            {sellerProfile.registered_address && Object.keys(sellerProfile.registered_address).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Registered Address</p>
                <p className="text-sm text-slate-700">
                  {[
                    (sellerProfile.registered_address as any).line1,
                    (sellerProfile.registered_address as any).line2,
                    (sellerProfile.registered_address as any).city,
                    (sellerProfile.registered_address as any).state,
                    (sellerProfile.registered_address as any).pincode,
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {financials && (
        <Card>
          <CardHeader><CardTitle className="text-base">Financials (Onboarding Layer 2)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Revenue (Current FY)" value={formatINR(financials.revenue_current_fy)} />
              <Field label="Revenue (FY-1)" value={formatINR(financials.revenue_fy_minus_1)} />
              <Field label="Revenue (FY-2)" value={formatINR(financials.revenue_fy_minus_2)} />
              <Field label="EBITDA (Latest)" value={formatINR(financials.ebitda_latest)} />
              <Field label="Net Profit (Latest)" value={formatINR(financials.net_profit_latest)} />
              <Field label="Asking Price" value={formatINR(financials.asking_price)} />
              <Field label="Monthly Opex" value={formatINR(financials.monthly_opex)} />
              <Field label="Open to Negotiation" value={financials.open_to_negotiation ? "Yes" : "No"} />
              <Field label="Reason for Sale" value={financials.reason_for_sale ? reasonLabels[financials.reason_for_sale] ?? financials.reason_for_sale : null} />
              <Field label="GST Filing" value={financials.gst_filing_status ? gstLabels[financials.gst_filing_status] ?? financials.gst_filing_status : null} />
              <Field label="ITR Filing" value={financials.itr_filing_status ? itrLabels[financials.itr_filing_status] ?? financials.itr_filing_status : null} />
              <Field label="Outstanding Tax" value={financials.outstanding_tax ? `Yes — ${financials.outstanding_tax_details ?? ""}` : "No"} />
              <Field label="Employees" value={getEmployeeLabel(financials.employee_count_range)} />
            </div>
            {financials.reason_details && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Sale Reason Details</p>
                <p className="text-sm text-slate-700">{financials.reason_details}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {documents.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Documents (Onboarding Layer 3) — {documents.length} uploaded</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{doc.document_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500 truncate">{doc.original_filename}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={doc.verification_status === "APPROVED" ? "default" : doc.verification_status === "REJECTED" ? "destructive" : "secondary"} className="text-[10px]">
                      {doc.verification_status}
                    </Badge>
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                        View file →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preferences && (
        <Card>
          <CardHeader><CardTitle className="text-base">Deal Preferences (Onboarding Layer 4)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Closing Timeline" value={preferences.closing_timeline ? timelineLabels[preferences.closing_timeline] ?? preferences.closing_timeline : null} />
              <Field label="Confidentiality" value={preferences.confidentiality_level ? confLabels[preferences.confidentiality_level] ?? preferences.confidentiality_level : null} />
              <Field label="Min Buyer Budget" value={formatINR(preferences.min_buyer_budget)} />
              <Field label="Signatory Name" value={preferences.authorised_signatory_name} />
              <Field label="Signatory Role" value={preferences.authorised_signatory_role} />
              <Field label="Language" value={preferences.preferred_language} />
            </div>
            {preferences.deal_structures?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Deal Structures</p>
                <div className="flex flex-wrap gap-1.5">
                  {preferences.deal_structures.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {preferences.preferred_buyer_types?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Preferred Buyer Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {preferences.preferred_buyer_types.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Verification Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <VerifBadge ok={listing.gst_verified} label="GST Verified" />
            <VerifBadge ok={listing.bank_verified} label="Bank Verified" />
            <VerifBadge ok={listing.ca_reviewed} label="CA Reviewed" />
          </div>
        </CardContent>
      </Card>

      {listing.status === "PENDING_REVIEW" && (
        <div className="sticky bottom-4 bg-white border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Ready to make a decision on this listing?</p>
          <AdminListingActions listingId={listing.id} currentStatus={listing.status} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function VerifBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
      ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
    }`}>
      {ok ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
      {label}
    </span>
  );
}
