"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
};

export function DashboardCreateListingButton({ label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const displayLabel = label ?? "Create Your First Listing";

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/listings", { method: "POST" });
      const body = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        toast.error(body.error ?? "Could not create listing");
        return;
      }
      toast.success("Listing submitted for review!");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
      disabled={loading}
      onClick={() => void handleClick()}
    >
      {loading ? "Creating…" : displayLabel}
    </Button>
  );
}
