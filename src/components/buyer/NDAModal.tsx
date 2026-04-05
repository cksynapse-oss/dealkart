"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";

const NDA_TEXT = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of the date of digital execution below, by and between TheBuzSale Technologies Private Limited ("Platform") and the undersigned party ("Recipient").

PURPOSE: The Recipient wishes to evaluate a potential business acquisition or investment opportunity listed on the TheBuzSale platform. In connection with this evaluation, the Recipient may receive Confidential Information about the target business.

CONFIDENTIAL INFORMATION: All information shared through the TheBuzSale Virtual Data Room including, but not limited to, financial statements, customer data, operational procedures, trade secrets, employee information, supplier contracts, and any other proprietary business information.

OBLIGATIONS: The Recipient agrees to (a) maintain strict confidentiality of all information received, (b) not disclose any information to third parties without prior written consent, (c) use the information solely for the purpose of evaluating the business opportunity, (d) return or destroy all information upon request or upon termination of discussions.

DURATION: This Agreement shall remain in effect for a period of two (2) years from the date of execution, regardless of whether a transaction is completed.

REMEDIES: The Recipient acknowledges that any breach of this Agreement may cause irreparable harm. The Platform and the business owner shall be entitled to seek injunctive relief and any other legal remedies available under applicable law.

GOVERNING LAW: This Agreement shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.

DIGITAL EXECUTION: The Recipient acknowledges that their digital signature below, along with the recorded IP address, timestamp, and device information, constitutes a legally binding execution of this Agreement.`;

interface NDAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  buyerId: string;
  onSuccess: () => void;
}

export function NDAModal({ open, onOpenChange, listingId, buyerId, onSuccess }: NDAModalProps) {
  const supabase = createClient();
  const [legalName, setLegalName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = legalName.trim().length >= 3 && agreed && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      // Check active NDA count
      const { count } = await supabase
        .from("ndas")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", buyerId)
        .in("status", ["SUBMITTED", "APPROVED"]);

      if ((count ?? 0) >= 5) {
        toast.error("Maximum 5 active NDAs allowed. Please wait for existing NDAs to be processed.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("ndas").insert({
        buyer_id: buyerId,
        listing_id: listingId,
        legal_name: legalName.trim(),
        status: "SUBMITTED",
        signed_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already signed an NDA for this listing.");
        } else {
          toast.error(error.message);
        }
        setSubmitting(false);
        return;
      }

      toast.success("NDA submitted successfully! Our team will review within 24 hours.");
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        type="button"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
        onClick={() => onOpenChange(true)}
      >
        <Shield className="size-4 mr-2" />
        Sign NDA & Request Access
      </Button>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Non-Disclosure Agreement</DialogTitle>
        </DialogHeader>

        {/* NDA Text */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-slate-50 text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-[40vh]">
          {NDA_TEXT}
        </div>

        {/* Signature Form */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="legal-name">Full legal name (as per PAN)</Label>
            <Input
              id="legal-name"
              placeholder="Enter your full legal name"
              value={legalName}
              onChange={e => setLegalName(e.target.value)}
              className="h-11"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-600">
              I have read and agree to the terms of this Non-Disclosure Agreement. I understand that this is a legally binding commitment.
            </span>
          </label>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Sign & Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
