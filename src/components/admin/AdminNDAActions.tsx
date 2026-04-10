"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2 } from "lucide-react";

export function AdminNDAActions({ ndaId, currentStatus }: { ndaId: string; currentStatus: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const approve = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("ndas")
      .update({ status: "APPROVED", reviewed_at: new Date().toISOString() })
      .eq("id", ndaId);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("NDA approved!");
    router.refresh();
  };

  const reject = async () => {
    if (!reason.trim()) { toast.error("Please provide a reason"); return; }
    setLoading(true);
    const { error } = await supabase
      .from("ndas")
      .update({ status: "REJECTED", admin_notes: reason.trim(), reviewed_at: new Date().toISOString() })
      .eq("id", ndaId);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("NDA rejected.");
    setShowReject(false);
    setReason("");
    router.refresh();
  };

  if (currentStatus !== "SUBMITTED") {
    return (
      <span className={`text-xs font-medium ${currentStatus === "APPROVED" ? "text-emerald-600" : "text-red-500"}`}>
        {currentStatus === "APPROVED" ? "Approved" : "Rejected"}
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 h-8 px-2" onClick={approve} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : <Check className="size-4 mr-1" />}
          Approve
        </Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => setShowReject(true)} disabled={loading}>
          <X className="size-4 mr-1" /> Reject
        </Button>
      </div>

      <AlertDialog open={showReject} onOpenChange={setShowReject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject NDA</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this NDA request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="nda-reject-reason">Reason for rejection</Label>
            <Textarea
              id="nda-reject-reason"
              placeholder="e.g., Buyer identity could not be verified, incomplete legal name…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={reject}
              disabled={loading || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Reject NDA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
