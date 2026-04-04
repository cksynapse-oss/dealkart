"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BUSINESS_TYPES,
  INDIAN_STATES,
  INDUSTRIES,
  REGEX,
  SALE_INTENTS,
  SUB_CATEGORIES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  layer1Schema,
  type Layer1FormValues,
  type Layer1Payload,
} from "@/lib/validations/seller";
import type { SellerProfile } from "@/types/database";
import { Briefcase, Building2, Check, Package, Plus, Trash2 } from "lucide-react";

const SALE_ICONS = {
  FULL_BUSINESS: Building2,
  PARTIAL_STAKE: Briefcase,
  ASSET_SALE: Package,
} as const;

const inputClass = "h-11 text-base";

function profileToDefaults(profile: SellerProfile): Layer1FormValues {
  const addr = profile.registered_address ?? {};
  const locs = profile.operating_locations?.length
    ? profile.operating_locations.map((l) => ({
        city: l.city ?? "",
        state: (l.state as Layer1FormValues["operating_locations"][0]["state"]) || "Maharashtra",
      }))
    : [{ city: "", state: "Maharashtra" as const }];

  return {
    sale_intent: profile.sale_intent ?? "FULL_BUSINESS",
    business_legal_name: profile.business_legal_name ?? "",
    dba_name: profile.dba_name ?? "",
    business_type: profile.business_type ?? "PVT_LTD",
    gstin: profile.gstin ?? "",
    pan_number: profile.pan_number ?? "",
    industry: profile.industry ?? "OTHER",
    sub_category:
      profile.sub_category ??
      (SUB_CATEGORIES[profile.industry ?? "OTHER"]?.[0] ?? "Other"),
    year_established: profile.year_established ?? new Date().getFullYear(),
    registered_address: {
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? "",
      city: addr.city ?? "",
      state: (addr.state as Layer1FormValues["registered_address"]["state"]) || "Maharashtra",
      pincode: addr.pincode ?? "",
    },
    operating_locations: locs,
  };
}

type Layer1BusinessIdentityProps = {
  sellerProfileId: string;
  profile: SellerProfile;
  onSaved: () => void;
};

export function Layer1BusinessIdentity({
  sellerProfileId,
  profile,
  onSaved,
}: Layer1BusinessIdentityProps) {
  const supabase = createClient();
  const defaults = useMemo(() => profileToDefaults(profile), [profile]);

  const form = useForm<Layer1FormValues>({
    resolver: zodResolver(layer1Schema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "operating_locations",
  });

  const industry = useWatch({ control: form.control, name: "industry" });
  const gstinVal = useWatch({ control: form.control, name: "gstin" });

  const subOptions = SUB_CATEGORIES[industry] ?? SUB_CATEGORIES.OTHER;

  const gstinNormalized = (gstinVal ?? "").replace(/\s/g, "").toUpperCase();
  const gstinFormatOk =
    gstinNormalized.length > 0 && REGEX.GSTIN.test(gstinNormalized);

  const onSubmit = form.handleSubmit(async (raw) => {
    const parsed = layer1Schema.safeParse(raw);
    if (!parsed.success) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const data: Layer1Payload = parsed.data;

    const { error } = await supabase
      .from("seller_profiles")
      .update({
        sale_intent: data.sale_intent,
        business_legal_name: data.business_legal_name,
        dba_name: data.dba_name?.trim() || null,
        business_type: data.business_type,
        gstin: data.gstin,
        gstin_verified: true,
        pan_number: data.pan_number,
        industry: data.industry,
        sub_category: data.sub_category,
        year_established: data.year_established,
        registered_address: data.registered_address,
        operating_locations: data.operating_locations,
        onboarding_status: "IN_PROGRESS",
        onboarding_layer_completed: Math.max(profile.onboarding_layer_completed, 1),
        onboarding_started_at:
          profile.onboarding_started_at ?? new Date().toISOString(),
      })
      .eq("id", sellerProfileId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Business identity saved.");
    onSaved();
  });

  return (
    <form
      id="onboarding-layer-form"
      className="space-y-10"
      onSubmit={(e) => void onSubmit(e)}
    >
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Sale intent</CardTitle>
          <CardDescription>
            How do you plan to transact on TheBuzSale?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="sale_intent"
            control={form.control}
            render={({ field }) => (
              <div className="grid gap-4 sm:grid-cols-3">
                {SALE_INTENTS.map((opt) => {
                  const Icon = SALE_ICONS[opt.value as keyof typeof SALE_ICONS];
                  const selected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all",
                        selected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-600/20"
                          : "border-slate-200 bg-white hover:border-emerald-300"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-lg",
                          selected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="font-semibold text-slate-900">
                        {opt.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {form.formState.errors.sale_intent ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.sale_intent.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Legal entity</CardTitle>
          <CardDescription>
            Registered name and structure as per MCA / GST records.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="business_legal_name">Business legal name</Label>
            <Input
              id="business_legal_name"
              className={inputClass}
              {...form.register("business_legal_name")}
              aria-invalid={!!form.formState.errors.business_legal_name}
            />
            {form.formState.errors.business_legal_name?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.business_legal_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dba_name">DBA / brand name (optional)</Label>
            <Input
              id="dba_name"
              className={inputClass}
              placeholder="Trading name customers know"
              {...form.register("dba_name")}
            />
          </div>
          <div className="space-y-2">
            <Label>Business type</Label>
            <Controller
              name="business_type"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={cn("w-full", inputClass)}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.business_type?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.business_type.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_established">Year established</Label>
            <Input
              id="year_established"
              type="number"
              min={1950}
              max={2026}
              className={inputClass}
              {...form.register("year_established", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.year_established}
            />
            {form.formState.errors.year_established?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.year_established.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Tax identifiers</CardTitle>
          <CardDescription>GSTIN and PAN as on official documents.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <div className="relative">
              <Input
                id="gstin"
                className={cn(inputClass, "pr-11 uppercase")}
                maxLength={15}
                {...form.register("gstin", {
                  setValueAs: (v) =>
                    String(v ?? "")
                      .replace(/\s/g, "")
                      .toUpperCase(),
                })}
                aria-invalid={!!form.formState.errors.gstin}
              />
              {gstinFormatOk ? (
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-emerald-600">
                  <Check className="size-5" aria-label="Valid format" />
                </span>
              ) : null}
            </div>
            {form.formState.errors.gstin?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.gstin.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan_number">PAN number</Label>
            <Input
              id="pan_number"
              className={cn(inputClass, "uppercase")}
              maxLength={10}
              {...form.register("pan_number", {
                setValueAs: (v) => String(v ?? "").toUpperCase().trim(),
              })}
              aria-invalid={!!form.formState.errors.pan_number}
            />
            {form.formState.errors.pan_number?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.pan_number.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Industry</CardTitle>
          <CardDescription>
            Helps buyers and our team benchmark your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Controller
              name="industry"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (v == null) return;
                    field.onChange(v);
                    const nextSubs = SUB_CATEGORIES[v]?.[0];
                    if (nextSubs) form.setValue("sub_category", nextSubs);
                  }}
                >
                  <SelectTrigger className={cn("w-full", inputClass)}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.industry?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.industry.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Sub-category</Label>
            <Controller
              name="sub_category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full", inputClass)}>
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.sub_category?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.sub_category.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Registered address</CardTitle>
          <CardDescription>Principal place of business as per records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addr_line1">Address line 1</Label>
            <Input
              id="addr_line1"
              className={inputClass}
              {...form.register("registered_address.line1")}
              aria-invalid={!!form.formState.errors.registered_address?.line1}
            />
            {form.formState.errors.registered_address?.line1?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.registered_address.line1.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addr_line2">Address line 2 (optional)</Label>
            <Input
              id="addr_line2"
              className={inputClass}
              {...form.register("registered_address.line2")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr_city">City</Label>
            <Input
              id="addr_city"
              className={inputClass}
              {...form.register("registered_address.city")}
              aria-invalid={!!form.formState.errors.registered_address?.city}
            />
            {form.formState.errors.registered_address?.city?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.registered_address.city.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>State / UT</Label>
            <Controller
              name="registered_address.state"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full", inputClass)}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.registered_address?.state?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.registered_address.state.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addr_pin">Pincode</Label>
            <Input
              id="addr_pin"
              className={inputClass}
              maxLength={6}
              inputMode="numeric"
              {...form.register("registered_address.pincode")}
              aria-invalid={!!form.formState.errors.registered_address?.pincode}
            />
            {form.formState.errors.registered_address?.pincode?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.registered_address.pincode.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Operating locations</CardTitle>
          <CardDescription>
            Cities where you run day-to-day operations (add all major ones).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((f, index) => (
            <div
              key={f.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-end"
            >
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`op_city_${index}`}>City</Label>
                  <Input
                    id={`op_city_${index}`}
                    className={inputClass}
                    {...form.register(`operating_locations.${index}.city`)}
                    aria-invalid={
                      !!form.formState.errors.operating_locations?.[index]?.city
                    }
                  />
                  {form.formState.errors.operating_locations?.[index]?.city
                    ?.message ? (
                    <p className="text-sm text-red-600">
                      {
                        form.formState.errors.operating_locations[index]?.city
                          ?.message
                      }
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Controller
                    name={`operating_locations.${index}.state`}
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn("w-full", inputClass)}>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
                aria-label="Remove location"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            onClick={() => append({ city: "", state: "Maharashtra" })}
          >
            <Plus className="size-4" />
            Add location
          </Button>
          {form.formState.errors.operating_locations?.root?.message ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.operating_locations.root.message}
            </p>
          ) : null}
          {typeof form.formState.errors.operating_locations?.message ===
          "string" ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.operating_locations.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}
