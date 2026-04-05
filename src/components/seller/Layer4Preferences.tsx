"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BUYER_TYPES,
  CLOSING_TIMELINES,
  CONFIDENTIALITY_LEVELS,
  CONTACT_PREFERENCES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn, formatIndianNumber } from "@/lib/utils";
import {
  allRequiredDocumentsPresent,
  DEAL_STRUCTURE_CHECKBOX_LABELS,
  DEAL_STRUCTURE_CHECKBOX_VALUES,
  layer4FormToPreferencesRow,
  layer4Schema,
  parseRupeesStringToPaise,
  type Layer4FormValues,
} from "@/lib/validations/seller";
import type { SellerFinancials, SellerPreferences, SellerProfile } from "@/types/database";
import { Check, IndianRupee, X } from "lucide-react";

const inputClass = "h-11 text-base";

type Layer4PreferencesProps = {
  sellerProfileId: string;
  profile: SellerProfile;
  financials: SellerFinancials | null;
  onComplete: () => void;
};

function defaultsFromPreferences(
  p: SellerPreferences | null
): Partial<Layer4FormValues> {
  if (!p) {
    return {
      deal_structures: [] as Layer4FormValues["deal_structures"],
      closing_timeline: "FLEXIBLE",
      preferred_buyer_types: [],
      min_buyer_budget: "",
      confidentiality_level: "STANDARD",
      key_strengths: [],
      growth_opportunities: "",
      contact_preference: [],
      preferred_language: "English",
      authorised_signatory_name: "",
      authorised_signatory_role: "",
      tnc_accepted: false,
    };
  }
  const allowedDeals = new Set<string>(DEAL_STRUCTURE_CHECKBOX_VALUES);
  const dealStructures = (p.deal_structures ?? []).filter((x): x is (typeof DEAL_STRUCTURE_CHECKBOX_VALUES)[number] =>
    allowedDeals.has(x)
  );
  const buyerAllowed = new Set<string>(BUYER_TYPES.map((b) => b.value));
  const buyerTypes = (p.preferred_buyer_types ?? []).filter((x) =>
    buyerAllowed.has(x)
  );
  const contactAllowed = new Set<string>(
    CONTACT_PREFERENCES.map((c) => c.value)
  );
  const contactPrefs = (p.contact_preference ?? []).filter((x) =>
    contactAllowed.has(x)
  );
  return {
    deal_structures: dealStructures,
    closing_timeline: p.closing_timeline ?? "FLEXIBLE",
    preferred_buyer_types: buyerTypes,
    min_buyer_budget:
      p.min_buyer_budget != null
        ? formatIndianNumber(Math.round(p.min_buyer_budget / 100))
        : "",
    confidentiality_level: p.confidentiality_level,
    key_strengths: p.key_strengths ?? [],
    growth_opportunities: p.growth_opportunities ?? "",
    contact_preference: contactPrefs,
    preferred_language:
      p.preferred_language === "Hindi" ? "Hindi" : "English",
    authorised_signatory_name: p.authorised_signatory_name ?? "",
    authorised_signatory_role: p.authorised_signatory_role ?? "",
    tnc_accepted: !!p.tnc_accepted_at,
  };
}

export function Layer4Preferences({
  sellerProfileId,
  profile,
  financials: _financials,
  onComplete,
}: Layer4PreferencesProps) {
  void _financials;
  const supabase = createClient();
  const router = useRouter();
  const [celebration, setCelebration] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<Layer4FormValues>({
    resolver: zodResolver(layer4Schema),
    defaultValues: defaultsFromPreferences(null) as Layer4FormValues,
    mode: "onTouched",
  });

  const growthLen = form.watch("growth_opportunities")?.length ?? 0;
  const strengths = form.watch("key_strengths") ?? [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("seller_preferences")
        .select("*")
        .eq("seller_profile_id", sellerProfileId)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        setPrefsLoaded(true);
        return;
      }
      form.reset({
        ...(defaultsFromPreferences(data) as Layer4FormValues),
      });
      setPrefsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per profile
  }, [supabase, sellerProfileId]);

  const toggleArrayValue = useCallback(
    (
      field: "deal_structures" | "preferred_buyer_types" | "contact_preference",
      value: string
    ) => {
      const cur = (form.getValues(field) as string[]) ?? [];
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : [...cur, value];
      if (field === "deal_structures") {
        form.setValue(field, next as Layer4FormValues["deal_structures"], {
          shouldValidate: true,
        });
      } else {
        form.setValue(field, next, { shouldValidate: true });
      }
    },
    [form]
  );

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const cur = form.getValues("key_strengths") ?? [];
    if (cur.length >= 5) {
      toast.error("Maximum 5 strengths");
      return;
    }
    if (cur.includes(t)) {
      setTagInput("");
      return;
    }
    form.setValue("key_strengths", [...cur, t], { shouldValidate: true });
    setTagInput("");
  };

  const createListing = async () => {
    try {
      const res = await fetch("/api/seller/listings", { method: "POST" });
      const body = (await res.json()) as { error?: string; ok?: boolean; listingId?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Could not create listing");
        return false;
      }
      return true;
    } catch {
      toast.error("Network error");
      return false;
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = layer4Schema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const row = layer4FormToPreferencesRow(parsed.data, sellerProfileId);

    const { error: upErr } = await supabase.from("seller_preferences").upsert(
      row,
      { onConflict: "seller_profile_id" }
    );

    if (upErr) {
      toast.error(upErr.message);
      return;
    }

    const { data: docRows, error: docErr } = await supabase
      .from("seller_documents")
      .select("*")
      .eq("seller_profile_id", sellerProfileId);

    if (docErr) {
      toast.error(docErr.message);
      return;
    }

    const docsOk = allRequiredDocumentsPresent(docRows ?? [], profile.industry);
    const nextStatus = docsOk ? "ACTIVE" : "PENDING_DOCUMENTS";

    const { error: profErr } = await supabase
      .from("seller_profiles")
      .update({
        onboarding_layer_completed: Math.max(profile.onboarding_layer_completed, 4),
        onboarding_status: nextStatus,
        onboarding_completed_at: docsOk ? new Date().toISOString() : null,
      })
      .eq("id", sellerProfileId);

    if (profErr) {
      toast.error(profErr.message);
      return;
    }

    // Auto-create listing when onboarding is completed
    const listingCreated = await createListing();
    if (listingCreated) {
      toast.success("Your business has been listed! It's pending admin review.");
    }

    setCelebration(true);
    onComplete();
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/seller/dashboard");
    }, 2000);
  });

  const rupeeBlur = (name: "min_buyer_budget") => {
    const reg = form.register(name);
    return {
      ...reg,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        reg.onBlur(e);
        const raw = e.target.value.replace(/[₹,\s]/g, "").trim();
        if (!raw) return;
        const p = parseRupeesStringToPaise(e.target.value);
        if (p != null && p > 0) {
          form.setValue(name, formatIndianNumber(Math.round(p / 100)), {
            shouldValidate: true,
          });
        }
      },
    };
  };

  if (!prefsLoaded) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading preferences…
      </div>
    );
  }

  if (celebration) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-emerald-200/60">
          <Check className="size-12 stroke-[2.5]" aria-hidden />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            You&apos;re all set!
          </h2>
          <p className="max-w-md text-muted-foreground">
            Your seller profile is complete. You can manage documents and
            listings anytime from the dashboard.
          </p>
        </div>
        <Link
          href="/seller/dashboard"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-12 bg-emerald-600 px-8 text-white hover:bg-emerald-700"
          )}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-10" onSubmit={(e) => void onSubmit(e)}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Deal structure</CardTitle>
          <CardDescription>
            What transaction formats are you open to?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {DEAL_STRUCTURE_CHECKBOX_VALUES.map((v) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"
            >
              <Checkbox
                checked={form.watch("deal_structures")?.includes(v)}
                onCheckedChange={() =>
                  toggleArrayValue("deal_structures", v)
                }
              />
              <span className="text-sm font-medium">
                {DEAL_STRUCTURE_CHECKBOX_LABELS[v]}
              </span>
            </label>
          ))}
          {form.formState.errors.deal_structures?.message ? (
            <p className="text-sm text-red-600 sm:col-span-2">
              {form.formState.errors.deal_structures.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Timeline & buyers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Desired closing timeline</Label>
            <Controller
              name="closing_timeline"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full sm:max-w-md", inputClass)}>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOSING_TIMELINES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.closing_timeline?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.closing_timeline.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-3 sm:col-span-2">
            <Label>Preferred buyer type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {BUYER_TYPES.map((b) => (
                <label
                  key={b.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"
                >
                  <Checkbox
                    checked={form.watch("preferred_buyer_types")?.includes(b.value)}
                    onCheckedChange={() =>
                      toggleArrayValue("preferred_buyer_types", b.value)
                    }
                  />
                  <span className="text-sm font-medium">{b.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.preferred_buyer_types?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.preferred_buyer_types.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="min_budget">Minimum buyer budget (₹) — optional</Label>
            <div className="relative sm:max-w-md">
              <IndianRupee
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="min_budget"
                className={cn(inputClass, "pl-9")}
                {...rupeeBlur("min_buyer_budget")}
                aria-invalid={!!form.formState.errors.min_buyer_budget}
              />
            </div>
            {form.formState.errors.min_buyer_budget?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.min_buyer_budget.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Confidentiality</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="confidentiality_level"
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-4 md:grid-cols-3"
              >
                {CONFIDENTIALITY_LEVELS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-5 transition-all",
                      field.value === opt.value
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                        : "border-slate-200 hover:border-emerald-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} id={`conf-${opt.value}`} />
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {opt.description}
                    </p>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          {form.formState.errors.confidentiality_level?.message ? (
            <p className="text-sm text-red-600 mt-2">
              {form.formState.errors.confidentiality_level.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Story & strengths</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Key strengths (max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {strengths.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-900"
                >
                  {t}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-emerald-200"
                    onClick={() =>
                      form.setValue(
                        "key_strengths",
                        strengths.filter((x) => x !== t),
                        { shouldValidate: true }
                      )
                    }
                    aria-label={`Remove ${t}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                className={inputClass}
                placeholder="Type a strength, press Enter"
                value={tagInput}
                disabled={strengths.length >= 5}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" className="h-11" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.formState.errors.key_strengths?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.key_strengths.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              <Label htmlFor="growth">Growth opportunities</Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  growthLen < 50 || growthLen > 500
                    ? "text-amber-600"
                    : "text-muted-foreground"
                )}
              >
                {growthLen} / 500
              </span>
            </div>
            <Textarea
              id="growth"
              className="min-h-36 text-base"
              {...form.register("growth_opportunities")}
              aria-invalid={!!form.formState.errors.growth_opportunities}
            />
            {form.formState.errors.growth_opportunities?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.growth_opportunities.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contact & signatory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Contact preference</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONTACT_PREFERENCES.map((c) => (
                <label
                  key={c.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"
                >
                  <Checkbox
                    checked={form.watch("contact_preference")?.includes(c.value)}
                    onCheckedChange={() =>
                      toggleArrayValue("contact_preference", c.value)
                    }
                  />
                  <span className="text-sm font-medium">{c.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.contact_preference?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.contact_preference.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
            <Controller
              name="preferred_language"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full sm:max-w-xs", inputClass)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sig_name">Authorised signatory name</Label>
              <Input
                id="sig_name"
                className={inputClass}
                {...form.register("authorised_signatory_name")}
                aria-invalid={!!form.formState.errors.authorised_signatory_name}
              />
              {form.formState.errors.authorised_signatory_name?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.authorised_signatory_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sig_role">Authorised signatory role</Label>
              <Input
                id="sig_role"
                className={inputClass}
                {...form.register("authorised_signatory_role")}
                aria-invalid={!!form.formState.errors.authorised_signatory_role}
              />
              {form.formState.errors.authorised_signatory_role?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.authorised_signatory_role.message}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <Checkbox
            id="tnc"
            checked={form.watch("tnc_accepted")}
            onCheckedChange={(c) =>
              form.setValue("tnc_accepted", c === true, { shouldValidate: true })
            }
          />
          <div className="space-y-1">
            <Label htmlFor="tnc" className="cursor-pointer font-normal leading-snug">
              I agree to TheBuzSale&apos;s Terms of Service and Privacy Policy
            </Label>
            {form.formState.errors.tnc_accepted?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.tnc_accepted.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto sm:min-w-56"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Saving…" : "Complete Onboarding"}
      </Button>
    </form>
  );
}
