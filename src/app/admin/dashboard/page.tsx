import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, ShoppingBag, FileText, Shield, Clock } from "lucide-react";
import { formatINRShort, getIndustryLabel, daysSince } from "@/lib/utils";
import { AdminListingActions } from "@/components/admin/AdminListingActions";
import { AdminNDAActions } from "@/components/admin/AdminNDAActions";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard — TheBuzSale" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: sellers },
    { count: buyers },
    { count: liveListings },
    { count: pendingListingsCount },
    { count: pendingNDAsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "SELLER"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "BUYER"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "LIVE"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "PENDING_REVIEW"),
    supabase.from("ndas").select("*", { count: "exact", head: true }).eq("status", "SUBMITTED"),
  ]);

  const { data: pendingListings } = await supabase
    .from("listings")
    .select("id, headline, city, state, industry, asking_price, revenue_latest, ebitda_latest, year_founded, deal_type, description, key_strengths, growth_opportunities, created_at, profiles!listings_seller_id_fkey(full_name, email)")
    .eq("status", "PENDING_REVIEW")
    .order("created_at", { ascending: true })
    .limit(10);

  const { data: pendingNDAs } = await supabase
    .from("ndas")
    .select("id, legal_name, signed_at, created_at, profiles!ndas_buyer_id_fkey(full_name, email), listings!ndas_listing_id_fkey(headline)")
    .eq("status", "SUBMITTED")
    .order("created_at", { ascending: true })
    .limit(10);

  const { data: pendingDocs } = await supabase
    .from("seller_documents")
    .select("id, document_type, original_filename, uploaded_at")
    .eq("verification_status", "PENDING")
    .order("uploaded_at", { ascending: true })
    .limit(5);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Sellers", value: sellers ?? 0, icon: Store, color: "text-emerald-600 bg-emerald-50" },
    { label: "Buyers", value: buyers ?? 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
    { label: "Live Listings", value: liveListings ?? 0, icon: FileText, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Review", value: pendingListingsCount ?? 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Pending NDAs", value: pendingNDAsCount ?? 0, icon: Shield, color: "text-red-600 bg-red-50" },
  ];

  const hasPendingWork = (pendingListings?.length ?? 0) > 0 || (pendingNDAs?.length ?? 0) > 0 || (pendingDocs?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500">TheBuzSale admin overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`size-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="size-4" />
              </div>
              <span className="text-sm text-slate-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {hasPendingWork ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            Needs Your Attention
          </h2>

          {pendingListings && pendingListings.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-amber-900">
                  Listings Pending Review ({pendingListings.length})
                </h3>
                <Link href="/admin/listings" className="text-xs text-amber-700 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="divide-y">
                {pendingListings.map((l: any) => (
                  <div key={l.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{l.headline || "Untitled Listing"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          by {l.profiles?.full_name ?? "Unknown"} · {l.profiles?.email ?? ""}
                        </p>
                      </div>
                      <AdminListingActions listingId={l.id} currentStatus="PENDING_REVIEW" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Industry</p>
                        <p className="text-sm font-medium text-slate-700">{l.industry ? getIndustryLabel(l.industry) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Location</p>
                        <p className="text-sm font-medium text-slate-700">{l.city ?? "—"}{l.state ? `, ${l.state}` : ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Asking Price</p>
                        <p className="text-sm font-bold text-emerald-700">{formatINRShort(l.asking_price)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Revenue</p>
                        <p className="text-sm font-medium text-slate-700">{formatINRShort(l.revenue_latest)}</p>
                      </div>
                    </div>
                    {(l.description || l.key_strengths?.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {l.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{l.description}</p>
                        )}
                        {l.key_strengths?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {l.key_strengths.slice(0, 4).map((s: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2">
                      Submitted {daysSince(l.created_at)} day{daysSince(l.created_at) !== 1 ? "s" : ""} ago
                      {l.deal_type ? ` · ${l.deal_type}` : ""}
                      {l.year_founded ? ` · Est. ${l.year_founded}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pendingNDAs && pendingNDAs.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900">
                  NDA Requests ({pendingNDAs.length})
                </h3>
                <Link href="/admin/ndas" className="text-xs text-blue-700 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="divide-y">
                {pendingNDAs.map((n: any) => (
                  <div key={n.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {n.profiles?.full_name ?? "Unknown Buyer"}
                        <span className="font-normal text-slate-400"> · {n.legal_name}</span>
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        For: {n.listings?.headline ?? "—"} · {daysSince(n.created_at)}d ago
                      </p>
                    </div>
                    <AdminNDAActions ndaId={n.id} currentStatus="SUBMITTED" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pendingDocs && pendingDocs.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-purple-900">
                  Documents to Verify ({pendingDocs.length})
                </h3>
                <Link href="/admin/documents" className="text-xs text-purple-700 hover:underline">
                  Review documents →
                </Link>
              </div>
              <div className="divide-y">
                {pendingDocs.map((d: any) => (
                  <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{d.document_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-500 truncate">{d.original_filename}</p>
                    </div>
                    <Link href="/admin/documents" className="text-xs text-purple-600 hover:underline whitespace-nowrap">
                      Review →
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <FileText className="size-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-500">No pending reviews right now. Check back later.</p>
        </Card>
      )}
    </div>
  );
}
