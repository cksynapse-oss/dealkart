"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Check, X } from "lucide-react";

export function AdminListingActions({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const supabase = createClient();
  const router = useRouter();

  const approve = async () => {
    const { error } = await supabase
      .from("listings")
      .update({
        status: "LIVE",
        gst_verified: true,
        bank_verified: true,
        ca_reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (error) { toast.error(error.message); return; }
    toast.success("Listing approved and now LIVE!");
    router.refresh();
  };

  const reject = async () => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    const { error } = await supabase
      .from("listings")
      .update({
        status: "REJECTED",
        admin_notes: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (error) { toast.error(error.message); return; }
    toast.success("Listing rejected.");
    router.refresh();
  };

  if (currentStatus === "LIVE") {
    return <span className="text-xs text-emerald-600 font-medium">Live</span>;
  }

  if (currentStatus === "REJECTED") {
    return <span className="text-xs text-red-500">Rejected</span>;
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 h-8 px-2" onClick={approve}>
        <Check className="size-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 h-8 px-2" onClick={reject}>
        <X className="size-4 mr-1" /> Reject
      </Button>
    </div>
  );
}
