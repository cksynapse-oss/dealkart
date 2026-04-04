"use client";

import Link from "next/link";
import { Eye, Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINRShort, daysSince, getIndustryLabel, getEmployeeLabel } from "@/lib/utils";
import type { Listing } from "@/types/database";

export function ListingCard({ listing }: { listing: Listing }) {
  const margin = listing.revenue_latest && listing.ebitda_latest
    ? Math.round((listing.ebitda_latest / listing.revenue_latest) * 100)
    : null;

  return (
    <Link href={`/buyer/listing/${listing.id}`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-l-4 hover:border-l-emerald-500 p-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.industry && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-xs">
              {getIndustryLabel(listing.industry)}
            </Badge>
          )}
          {listing.city && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
              {listing.city}
            </Badge>
          )}
          {listing.close_ready && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-0 text-xs">
              Close-Ready
            </Badge>
          )}
          {listing.deal_type && listing.deal_type !== "Full Acquisition" && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 text-xs">
              {listing.deal_type}
            </Badge>
          )}
        </div>

        {/* Headline */}
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-4 group-hover:text-emerald-700 transition-colors">
          {listing.headline || "Untitled Listing"}
        </h3>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Annual Revenue</p>
            <p className="text-sm font-semibold text-emerald-700">
              {formatINRShort(listing.revenue_latest)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">EBITDA</p>
            <p className="text-sm font-semibold text-emerald-700">
              {formatINRShort(listing.ebitda_latest)}
              {margin !== null && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({margin}%)
                </span>
              )}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Asking Price</p>
            <p className="text-sm font-bold text-emerald-800">
              {formatINRShort(listing.asking_price)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Founded</p>
            <p className="text-sm font-semibold text-slate-700">
              {listing.year_founded || "—"}
            </p>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex gap-2 mb-4">
          <VerifBadge ok={listing.gst_verified} label="GST" />
          <VerifBadge ok={listing.bank_verified} label="Bank" />
          <VerifBadge ok={listing.ca_reviewed} label="CA" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" /> {listing.view_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {daysSince(listing.created_at)}d ago
            </span>
          </div>
          <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
            View Details <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function VerifBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
    }`}>
      {ok ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
      {label} {ok ? "✓" : "✗"}
    </span>
  );
}
