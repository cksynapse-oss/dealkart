"use client";

import { useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Props = {
  document: {
    id: string;
    verification_status?: string | null;
  };
};

export function AdminDocumentActions({ document }: Props) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const supabase = createClient();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("seller_documents")
        .update({
          verification_status: "APPROVED",
          verified_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Document approved successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to approve document");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("seller_documents")
        .update({
          verification_status: "REJECTED",
          rejection_reason: rejectReason.trim(),
          verified_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Document rejected successfully");
      setShowRejectDialog(false);
      setRejectReason("");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to reject document");
    } finally {
      setLoading(false);
    }
  };

  const isApproved = document.verification_status === "APPROVED";
  const isRejected = document.verification_status === "REJECTED";

  return (
    <div className="flex items-center gap-2">
      {!isApproved && !isRejected && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            Approve
          </Button>

          <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="size-4" />
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting this document. This will be
                  visible to the seller.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for rejection</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Document is unclear, expired, or doesn't match requirements..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  Reject Document
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {isApproved && (
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="size-3 mr-1" />
          Approved
        </Badge>
      )}

      {isRejected && (
        <Badge variant="destructive">
          <XCircle className="size-3 mr-1" />
          Rejected
        </Badge>
      )}
    </div>
  );
}
