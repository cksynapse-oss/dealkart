"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Check, X } from "lucide-react";

export function AdminNDAActions({ ndaId, currentStatus }: { ndaId: string; currentStatus: string }) {
  const supabase = createClient();
  const router = useRouter();

  const approve = async () => {
    const { error } = await supabase
      .from("ndas")
      .update({ status: "APPROVED", reviewed_at: new Date().toISOString() })
      .eq("id", ndaId);
    if (error) { toast.error(error.message); return; }
    toast.success("NDA approved!");
    router.refresh();
  };

  const reject = async () => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    const { error } = await supabase
      .from("ndas")
      .update({ status: "REJECTED", admin_notes: reason, reviewed_at: new Date().toISOString() })
      .eq("id", ndaId);
    if (error) { toast.error(error.message); return; }
    toast.success("NDA rejected.");
    router.refresh();
  };

  if (currentStatus !== "SUBMITTED") {
    return <span className={`text-xs font-medium ${currentStatus === "APPROVED" ? "text-emerald-600" : "text-red-500"}`}>{currentStatus}</span>;
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
