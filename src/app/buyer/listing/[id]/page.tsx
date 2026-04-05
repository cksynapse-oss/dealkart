import { notFound } from "next/navigation";
import { CheckCircle, XCircle, Eye, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatINRShort, shortId, daysSince, getIndustryLabel, getEmployeeLabel } from "@/lib/utils";
import { ListingCTA } from "@/components/buyer/ListingCTA";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("headline").eq("id", id).single();
  return { title: listing?.headline ? `${listing.headline} — TheBuzSale` : "Listing — TheBuzSale" };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing || listing.status !== "LIVE") notFound();

  await supabase.rpc("increment_view_count", { listing_uuid: id });

  const margin = listing.revenue_latest && listing.ebitda_latest
    ? Math.round((listing.ebitda_latest / listing.revenue_latest) * 100)
    : null;

  const whyBuy: string[] = Array.isArray(listing.why_buy) ? listing.why_buy : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {listing.deal_type && (
            <Badge className="bg-emerald-100 text-emerald-800 border-0">{listing.deal_type}</Badge>
          )}
          {listing.industry && (
            <Badge variant="secondary" className="bg-slate-100 border-0">{getIndustryLabel(listing.industry)}</Badge>
          )}
          {listing.city && (
            <Badge variant="secondary" className="bg-slate-100 border-0">{listing.city}{listing.state ? `, ${listing.state}` : ""}</Badge>
          )}
          {listing.close_ready && (
            <Badge className="bg-amber-100 text-amber-800 border-0">Close-Ready</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {listing.headline || "Untitled Listing"}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Tag className="size-3.5" /> {shortId(listing.id)}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" /> Listed {daysSince(listing.created_at)} days ago</span>
          <span className="flex items-center gap-1"><Eye className="size-3.5" /> {listing.view_count} views</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 p-6 bg-slate-50 rounded-xl">
        <MetricBox label="Annual Revenue" value={formatINRShort(listing.revenue_latest)} />
        <MetricBox label="EBITDA" value={`${formatINRShort(listing.ebitda_latest)}${margin !== null ? ` (${margin}%)` : ""}`} />
        <MetricBox label="Asking Price" value={formatINRShort(listing.asking_price)} highlight />
        <MetricBox label="Team Size" value={getEmployeeLabel(listing.employee_count_range)} />
        <MetricBox label="Founded" value={listing.year_founded?.toString() ?? "—"} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Why Buy */}
          {whyBuy.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Why buy this business</h2>
              <div className="space-y-3">
                {whyBuy.map((reason, i) => (
                  <div key={i} className={`flex gap-3 p-4 rounded-lg ${i === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-white border"}`}>
                    <span className={`flex-shrink-0 size-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          {listing.description && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">About this business</h2>
              <p className="text-slate-600 leading-relaxed">{listing.description}</p>
            </section>
          )}

          {/* Growth */}
          {listing.growth_opportunities && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Growth opportunities</h2>
              <p className="text-slate-600 leading-relaxed">{listing.growth_opportunities}</p>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Verification */}
          <div className="p-5 border rounded-xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Verification status</h3>
            <div className="space-y-2.5">
              <VerifRow ok={listing.gst_verified} label="GST Verified" />
              <VerifRow ok={listing.bank_verified} label="Bank Statement Verified" />
              <VerifRow ok={listing.ca_reviewed} label="CA Reviewed" />
            </div>
          </div>

          {/* CTA */}
          <ListingCTA listingId={listing.id} />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function VerifRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-slate-300" />}
      <span className={`text-sm ${ok ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}
