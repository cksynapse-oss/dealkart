"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NDAModal } from "@/components/buyer/NDAModal";
import { createClient } from "@/lib/supabase/client";
import { getNDAStatusColor } from "@/lib/utils";
import type { NDAStatus } from "@/types/database";

export function ListingCTA({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ndaStatus, setNdaStatus] = useState<NDAStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ndaOpen, setNdaOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role ?? null);

      // Check NDA
      const { data: nda } = await supabase
        .from("ndas")
        .select("status")
        .eq("buyer_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (nda) setNdaStatus(nda.status as NDAStatus);

      // Check saved
      const { data: savedRow } = await supabase
        .from("saved_listings")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (savedRow) setSaved(true);

      setLoading(false);
    }
    load();
  }, [listingId, supabase]);

  const toggleSave = async () => {
    if (!userId) return;
    if (saved) {
      await supabase.from("saved_listings").delete().eq("buyer_id", userId).eq("listing_id", listingId);
      setSaved(false);
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("saved_listings").insert({ buyer_id: userId, listing_id: listingId });
      setSaved(true);
      toast.success("Saved to watchlist");
    }
  };

  const handleNDASuccess = () => {
    setNdaStatus("SUBMITTED");
    setNdaOpen(false);
  };

  if (loading) {
    return (
      <div className="p-5 border rounded-xl animate-pulse">
        <div className="h-10 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-5 border rounded-xl space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <Shield className="size-4 text-emerald-600" /> Interested in this business?
      </h3>

      {!userId ? (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
          onClick={() => {
            toast.info("Create an account to express interest");
            const returnTo = `/buyer/listing/${listingId}`;
            router.push(
              `/auth/register?redirect=${encodeURIComponent(returnTo)}`
            );
          }}
        >
          Express interest
        </Button>
      ) : userRole !== "BUYER" ? (
        <p className="text-sm text-slate-500">Only buyers can request access to listings.</p>
      ) : ndaStatus ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">NDA Status:</span>
            <Badge className={getNDAStatusColor(ndaStatus)}>{ndaStatus}</Badge>
          </div>
          {ndaStatus === "SUBMITTED" && (
            <p className="text-xs text-slate-500">Our team will review within 24 hours.</p>
          )}
          {ndaStatus === "APPROVED" && (
            <p className="text-xs text-emerald-600 font-medium">Access granted! VDR access coming in Phase 2.</p>
          )}
        </div>
      ) : (
        <NDAModal
          open={ndaOpen}
          onOpenChange={setNdaOpen}
          listingId={listingId}
          buyerId={userId}
          onSuccess={handleNDASuccess}
        />
      )}

      {userId && userRole === "BUYER" && (
        <Button variant="outline" className="w-full" onClick={toggleSave}>
          <Heart className={`size-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
          {saved ? "Saved to Watchlist" : "Save to Watchlist"}
        </Button>
      )}
    </div>
  );
}
