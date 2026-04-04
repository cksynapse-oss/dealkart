"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  buildLayer3Slots,
  documentRowMatchesSlot,
  type Layer3SlotMeta,
} from "@/lib/validations/seller";
import type { SellerDocument, SellerProfile } from "@/types/database";
import { AlertTriangle, Check, Upload } from "lucide-react";

export type Layer3DocumentsHandle = {
  saveAndContinue: () => Promise<void>;
};

type Layer3DocumentsProps = {
  sellerProfileId: string;
  profile: SellerProfile;
  onSaved: () => void;
};

function safeDomId(slotKey: string): string {
  return slotKey.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function priorityBadgeClass(
  p: "required" | "recommended" | "optional"
): string {
  if (p === "required") return "bg-red-100 text-red-700 border-red-200";
  if (p === "recommended") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function extFromName(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase().slice(0, 8) : "bin";
}

export const Layer3Documents = forwardRef<
  Layer3DocumentsHandle,
  Layer3DocumentsProps
>(function Layer3Documents({ sellerProfileId, profile, onSaved }, ref) {
  const supabase = createClient();
  const slots = useMemo(
    () => buildLayer3Slots(profile.industry),
    [profile.industry]
  );
  const [rows, setRows] = useState<SellerDocument[]>([]);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from("seller_documents")
      .select("*")
      .eq("seller_profile_id", sellerProfileId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }
    setRows(data ?? []);
  }, [supabase, sellerProfileId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const findRowForSlot = useCallback(
    (slot: Layer3SlotMeta): SellerDocument | undefined => {
      const match = rows.find((r) => documentRowMatchesSlot(r, slot));
      return match;
    },
    [rows]
  );

  const handleFile = async (slot: Layer3SlotMeta, file: File) => {
    if (file.size > slot.maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${slot.maxSizeMB} MB`);
      return;
    }
    setUploading(slot.slotKey);
    setSkipped((s) => ({ ...s, [slot.slotKey]: false }));

    const ext = extFromName(file.name);
    const path = `${sellerProfileId}/${slot.documentType}_${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("seller-documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (upErr) {
      toast.error(upErr.message);
      setUploading(null);
      return;
    }

    const prev = findRowForSlot(slot);
    if (prev?.id) {
      await supabase.storage.from("seller-documents").remove([prev.storage_path]);
      await supabase.from("seller_documents").delete().eq("id", prev.id);
    }

    const { error: insErr } = await supabase.from("seller_documents").insert({
      seller_profile_id: sellerProfileId,
      document_type: slot.documentType,
      storage_path: path,
      original_filename: file.name,
      file_size_bytes: file.size,
      mime_type: file.type || null,
      upload_status: "UPLOADED",
      verification_status: "PENDING",
      license_number: slot.slotKey,
    });

    if (insErr) {
      toast.error(insErr.message);
      await supabase.storage.from("seller-documents").remove([path]);
      setUploading(null);
      return;
    }

    toast.success(`${slot.label} uploaded`);
    setUploading(null);
    void loadDocuments();
  };

  const handleRemove = async (slot: Layer3SlotMeta) => {
    const row = findRowForSlot(slot);
    if (!row) return;
    setUploading(slot.slotKey);
    await supabase.storage.from("seller-documents").remove([row.storage_path]);
    const { error } = await supabase.from("seller_documents").delete().eq("id", row.id);
    setUploading(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document removed");
    void loadDocuments();
  };

  const saveAndContinue = useCallback(async () => {
    const { error } = await supabase
      .from("seller_profiles")
      .update({
        onboarding_layer_completed: Math.max(profile.onboarding_layer_completed, 3),
        onboarding_status: "IN_PROGRESS",
      })
      .eq("id", sellerProfileId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Progress saved");
    onSaved();
  }, [
    supabase,
    sellerProfileId,
    profile.onboarding_layer_completed,
    onSaved,
  ]);

  useImperativeHandle(ref, () => ({ saveAndContinue }), [saveAndContinue]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {slots.map((slot) => {
          const row = findRowForSlot(slot);
          const isSkipped = skipped[slot.slotKey] && !row;
          const busy = uploading === slot.slotKey;
          const domId = safeDomId(slot.slotKey);

          return (
            <Card
              key={slot.slotKey}
              className="border-slate-200 shadow-sm"
            >
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{slot.label}</h3>
                    <Badge
                      variant="outline"
                      className={cn("border", priorityBadgeClass(slot.priority))}
                    >
                      {slot.priority === "required"
                        ? "REQUIRED"
                        : slot.priority === "recommended"
                          ? "RECOMMENDED"
                          : "OPTIONAL"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accepted: {slot.formats}
                  </p>
                  {row ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Check
                        className="size-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                      <span className="font-medium text-slate-800">
                        {row.original_filename}
                      </span>
                      <span className="text-muted-foreground">
                        (
                        {row.file_size_bytes != null
                          ? `${(row.file_size_bytes / 1024).toFixed(1)} KB`
                          : "—"}
                        )
                      </span>
                    </div>
                  ) : null}
                  {isSkipped && !row ? (
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <AlertTriangle className="size-4 shrink-0" aria-hidden />
                      <span>Upload later</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  {!row && !isSkipped ? (
                    <>
                      <input
                        ref={(el) => {
                          fileRefs.current[slot.slotKey] = el;
                        }}
                        type="file"
                        className="hidden"
                        id={`upload-${domId}`}
                        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void handleFile(slot, f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 gap-2"
                        disabled={!!uploading}
                        onClick={() => fileRefs.current[slot.slotKey]?.click()}
                      >
                        <Upload className="size-4" aria-hidden />
                        {busy ? "Uploading…" : "Upload"}
                      </Button>
                      <button
                        type="button"
                        className="text-sm text-amber-700 underline-offset-4 hover:underline"
                        onClick={() =>
                          setSkipped((s) => ({ ...s, [slot.slotKey]: true }))
                        }
                      >
                        Skip for now
                      </button>
                    </>
                  ) : null}
                  {row ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={busy}
                      onClick={() => void handleRemove(slot)}
                    >
                      Remove
                    </Button>
                  ) : null}
                  {isSkipped && !row ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() =>
                        setSkipped((s) => ({ ...s, [slot.slotKey]: false }))
                      }
                    >
                      Upload file
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/80 shadow-none">
        <CardContent className="p-4 text-sm text-muted-foreground">
          You can upload remaining documents later from your dashboard. Your
          listing cannot go live until all required documents are uploaded.
        </CardContent>
      </Card>
    </div>
  );
});
