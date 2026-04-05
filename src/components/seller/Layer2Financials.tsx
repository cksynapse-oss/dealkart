"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPLOYEE_RANGES,
  GST_FILING_OPTIONS,
  ITR_FILING_OPTIONS,
  REASON_FOR_SALE,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn, formatIndianNumber } from "@/lib/utils";
import {
  layer2FormToRow,
  layer2Schema,
  paiseToRupeesInput,
  type Layer2FormValues,
} from "@/lib/validations/seller";
import type { SellerFinancials, SellerProfile } from "@/types/database";
import { IndianRupee } from "lucide-react";

const inputClass = "h-11 text-base pl-9";

function formatRupeesInputOnBlur(raw: string): string {
  const cleaned = raw.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return "";
  const neg = cleaned.startsWith("-");
  const n = parseFloat(neg ? cleaned.slice(1) : cleaned);
  if (Number.isNaN(n)) return raw;
  const intPart = Math.floor(Math.abs(n));
  const frac = Math.abs(n) - intPart;
  const intStr = formatIndianNumber(intPart);
  const fracStr =
    frac > 0.001
      ? `.${(Math.round(frac * 100) / 100).toFixed(2).replace(/^0\./, ".")}`.replace(
          /\.?0+$/,
          ""
        )
      : "";
  return `${neg ? "-" : ""}${intStr}${fracStr}`;
}

function financialsToDefaults(f: SellerFinancials | null): Layer2FormValues {
  if (!f) {
    return {
      revenue_current_fy: "",
      revenue_fy_minus_1: "",
      revenue_fy_minus_2: "",
      ebitda_latest: "",
      net_profit_latest: "",
      asking_price: "",
      open_to_negotiation: true,
      reason_for_sale: "RETIREMENT",
      reason_details: "",
      gst_filing_status: "REGULAR",
      itr_filing_status: "FILED_2YR",
      outstanding_tax: false,
      outstanding_tax_details: "",
      employee_count_range: "RANGE_0_5",
      monthly_opex: "",
    };
  }
  return {
    revenue_current_fy: paiseToRupeesInput(f.revenue_current_fy),
    revenue_fy_minus_1: paiseToRupeesInput(f.revenue_fy_minus_1),
    revenue_fy_minus_2: paiseToRupeesInput(f.revenue_fy_minus_2),
    ebitda_latest: paiseToRupeesInput(f.ebitda_latest),
    net_profit_latest: paiseToRupeesInput(f.net_profit_latest),
    asking_price: paiseToRupeesInput(f.asking_price),
    open_to_negotiation: f.open_to_negotiation,
    reason_for_sale: f.reason_for_sale ?? "RETIREMENT",
    reason_details: f.reason_details ?? "",
    gst_filing_status: f.gst_filing_status ?? "REGULAR",
    itr_filing_status: f.itr_filing_status ?? "FILED_2YR",
    outstanding_tax: f.outstanding_tax,
    outstanding_tax_details: f.outstanding_tax_details ?? "",
    employee_count_range: f.employee_count_range ?? "RANGE_0_5",
    monthly_opex: paiseToRupeesInput(f.monthly_opex),
  };
}

type Layer2FinancialsProps = {
  sellerProfileId: string;
  profile: SellerProfile;
  financials: SellerFinancials | null;
  onSaved: () => void;
};

export function Layer2Financials({
  sellerProfileId,
  profile,
  financials,
  onSaved,
}: Layer2FinancialsProps) {
  const supabase = createClient();
  const defaults = useMemo(
    () => financialsToDefaults(financials),
    [financials]
  );

  const form = useForm<Layer2FormValues>({
    resolver: zodResolver(layer2Schema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const reasonForSale = form.watch("reason_for_sale");
  const outstandingTax = form.watch("outstanding_tax");

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = layer2Schema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    // Persist amounts as paise (BIGINT): layer2FormToRow uses parseRupeesStringToPaise (rupees × 100).
    const row = layer2FormToRow(parsed.data, sellerProfileId);

    if (financials?.id) {
      const { seller_profile_id: _sp, ...updatePayload } = row;
      void _sp;
      const { error } = await supabase
        .from("seller_financials")
        .update(updatePayload)
        .eq("id", financials.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("seller_financials").insert(row);
      if (error) {
        toast.error(error.message);
        return;
      }
    }

    const { error: profileErr } = await supabase
      .from("seller_profiles")
      .update({
        onboarding_layer_completed: Math.max(profile.onboarding_layer_completed, 2),
        onboarding_status: "IN_PROGRESS",
      })
      .eq("id", sellerProfileId);

    if (profileErr) {
      toast.error(profileErr.message);
      return;
    }

    toast.success("Financials saved.");
    onSaved();
  });

  const rupeeField = (
    name: keyof Pick<
      Layer2FormValues,
      | "revenue_current_fy"
      | "revenue_fy_minus_1"
      | "revenue_fy_minus_2"
      | "ebitda_latest"
      | "net_profit_latest"
      | "asking_price"
      | "monthly_opex"
    >,
    label: string,
    helper?: string
  ) => {
    const reg = form.register(name);
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        {helper ? (
          <p className="text-xs text-muted-foreground">{helper}</p>
        ) : null}
        <div className="relative">
          <IndianRupee
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={name}
            className={inputClass}
            inputMode="decimal"
            {...reg}
            onBlur={(e) => {
              reg.onBlur(e);
              const next = formatRupeesInputOnBlur(e.target.value);
              if (next !== e.target.value) {
                form.setValue(name, next, { shouldValidate: true });
              }
            }}
            aria-invalid={!!form.formState.errors[name]}
          />
        </div>
        {form.formState.errors[name]?.message ? (
          <p className="text-sm text-red-600">
            {form.formState.errors[name]?.message}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form
      id="onboarding-layer-form"
      className="space-y-10"
      onSubmit={(e) => void onSubmit(e)}
    >
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Revenue & profitability</CardTitle>
          <CardDescription>
            Figures in Indian Rupees (₹). We store values precisely in paise.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          {rupeeField("revenue_current_fy", "Revenue — current FY")}
          {rupeeField("revenue_fy_minus_1", "Revenue — FY minus 1")}
          {rupeeField(
            "revenue_fy_minus_2",
            "Revenue — FY minus 2 (optional)"
          )}
          {rupeeField(
            "ebitda_latest",
            "EBITDA — latest year (can be negative)"
          )}
          {rupeeField(
            "net_profit_latest",
            "Net profit — latest year (optional)"
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Deal expectations</CardTitle>
          <CardDescription>
            Indicative numbers help us match serious buyers faster.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rupeeField(
            "asking_price",
            "Asking price",
            "Our AI will suggest a valuation range"
          )}
          <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4">
            <div className="space-y-0.5">
              <Label htmlFor="open_neg" className="text-base">
                Open to negotiation
              </Label>
              <p className="text-sm text-muted-foreground">
                Buyers may propose structured deals within a range.
              </p>
            </div>
            <Controller
              name="open_to_negotiation"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="open_neg"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Reason for sale</Label>
            <Controller
              name="reason_for_sale"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full", inputClass.replace("pl-9", "pl-3"))}>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_FOR_SALE.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.reason_for_sale?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.reason_for_sale.message}
              </p>
            ) : null}
          </div>
          {reasonForSale === "OTHER" ? (
            <div className="space-y-2">
              <Label htmlFor="reason_details">Describe your reason</Label>
              <Textarea
                id="reason_details"
                className="min-h-24 text-base"
                {...form.register("reason_details")}
                aria-invalid={!!form.formState.errors.reason_details}
              />
              {form.formState.errors.reason_details?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.reason_details.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Compliance snapshot</CardTitle>
          <CardDescription>
            GST and income tax filing posture for buyer diligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label className="text-base">GST filing status</Label>
            <Controller
              name="gst_filing_status"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {GST_FILING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors",
                        field.value === opt.value &&
                          "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30"
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={`gst-${opt.value}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {form.formState.errors.gst_filing_status?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.gst_filing_status.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            <Label className="text-base">ITR filing status</Label>
            <Controller
              name="itr_filing_status"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {ITR_FILING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors",
                        field.value === opt.value &&
                          "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30"
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={`itr-${opt.value}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {form.formState.errors.itr_filing_status?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.itr_filing_status.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg">Tax liabilities & team</CardTitle>
          <CardDescription>
            Transparency here speeds up buyer confidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4">
            <div className="space-y-0.5">
              <Label htmlFor="out_tax" className="text-base">
                Outstanding tax liabilities
              </Label>
              <p className="text-sm text-muted-foreground">
                Any demand, dispute, or instalment plan with authorities.
              </p>
            </div>
            <Controller
              name="outstanding_tax"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="out_tax"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {outstandingTax ? (
            <div className="space-y-2">
              <Label htmlFor="outstanding_tax_details">Details</Label>
              <Textarea
                id="outstanding_tax_details"
                className="min-h-28 text-base"
                {...form.register("outstanding_tax_details")}
                aria-invalid={!!form.formState.errors.outstanding_tax_details}
              />
              {form.formState.errors.outstanding_tax_details?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.outstanding_tax_details.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Employee count range</Label>
            <Controller
              name="employee_count_range"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn("w-full sm:max-w-md", inputClass.replace("pl-9", "pl-3"))}>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.employee_count_range?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.employee_count_range.message}
              </p>
            ) : null}
          </div>
          {rupeeField(
            "monthly_opex",
            "Monthly operating expense (optional)"
          )}
        </CardContent>
      </Card>
    </form>
  );
}
