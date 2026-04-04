import { z } from "zod";

import {
  BUSINESS_TYPES,
  CLOSING_TIMELINES,
  CONFIDENTIALITY_LEVELS,
  EMPLOYEE_RANGES,
  GST_FILING_OPTIONS,
  ITR_FILING_OPTIONS,
  INDIAN_STATES,
  INDUSTRIES,
  INDUSTRY_DOCUMENTS,
  REASON_FOR_SALE,
  REGEX,
  SALE_INTENTS,
  SUB_CATEGORIES,
  UNIVERSAL_DOCUMENTS,
} from "@/lib/constants";
import { formatIndianNumber } from "@/lib/utils";
import type {
  BusinessType,
  ClosingTimeline,
  ConfidentialityLevel,
  DocumentType,
  EmployeeRange,
  GSTFilingStatus,
  ITRFilingStatus,
  ReasonForSale,
  SellerDocument,
} from "@/types/database";

const industryEnum = z.enum(
  INDUSTRIES.map((i) => i.value) as [string, ...string[]]
);

const saleIntentEnum = z.enum(
  SALE_INTENTS.map((s) => s.value) as [string, ...string[]]
);

const businessTypeEnum = z.enum(
  BUSINESS_TYPES.map((b) => b.value) as [BusinessType, ...BusinessType[]]
);

const gstFilingEnum = z.enum(
  GST_FILING_OPTIONS.map((g) => g.value) as [string, ...string[]]
);

const itrFilingEnum = z.enum(
  ITR_FILING_OPTIONS.map((i) => i.value) as [string, ...string[]]
);

const employeeRangeEnum = z.enum(
  EMPLOYEE_RANGES.map((e) => e.value) as [string, ...string[]]
);

const reasonForSaleEnum = z.enum(
  REASON_FOR_SALE.map((r) => r.value) as [string, ...string[]]
);

const indianStateEnum = z.enum(
  INDIAN_STATES as unknown as [string, ...string[]]
);

const operatingLocationSchema = z.object({
  city: z.string().trim().min(1, "City is required"),
  state: indianStateEnum,
});

export const layer1Schema = z
  .object({
    sale_intent: saleIntentEnum,
    business_legal_name: z.string().trim().min(1, "Legal name is required"),
    dba_name: z.string().trim().optional(),
    business_type: businessTypeEnum,
    gstin: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .refine((s) => REGEX.GSTIN.test(s), "Enter a valid 15-character GSTIN"),
    pan_number: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .refine((s) => REGEX.PAN.test(s), "Enter a valid PAN (e.g. ABCDE1234F)"),
    industry: industryEnum,
    sub_category: z.string().trim().min(1, "Select a sub-category"),
    year_established: z.coerce
      .number()
      .int()
      .min(1950, "Year must be 1950 or later")
      .max(2026, "Year cannot be after 2026"),
    registered_address: z.object({
      line1: z.string().trim().min(1, "Address line 1 is required"),
      line2: z.string().trim().optional(),
      city: z.string().trim().min(1, "City is required"),
      state: indianStateEnum,
      pincode: z
        .string()
        .trim()
        .refine((s) => REGEX.PINCODE.test(s), "Enter a valid 6-digit pincode"),
    }),
    operating_locations: z
      .array(operatingLocationSchema)
      .min(1, "Add at least one operating location"),
  })
  .superRefine((data, ctx) => {
    const subs = SUB_CATEGORIES[data.industry];
    if (!subs || !subs.includes(data.sub_category)) {
      ctx.addIssue({
        code: "custom",
        message: "Sub-category must match the selected industry",
        path: ["sub_category"],
      });
    }
  });

export type Layer1FormValues = z.input<typeof layer1Schema>;
export type Layer1Payload = z.infer<typeof layer1Schema>;

/** Minimum annual revenue ₹25L in paise (BIGINT in DB). */
export const MIN_ANNUAL_REVENUE_PAISE = 25_00_000 * 100;

export function parseRupeesStringToPaise(s: string): number | null {
  const t = s.replace(/[₹,\s]/g, "").trim();
  if (!t) return null;
  const neg = t.startsWith("-");
  const abs = parseFloat(neg ? t.slice(1) : t);
  if (Number.isNaN(abs)) return null;
  const paise = Math.round(abs * 100);
  return neg ? -paise : paise;
}

export const layer2Schema = z
  .object({
    revenue_current_fy: z.string().min(1, "Current FY revenue is required"),
    revenue_fy_minus_1: z.string().min(1, "Prior FY revenue is required"),
    revenue_fy_minus_2: z.string().optional(),
    ebitda_latest: z.string().min(1, "EBITDA is required"),
    net_profit_latest: z.string().optional(),
    asking_price: z.string().min(1, "Asking price is required"),
    open_to_negotiation: z.boolean(),
    reason_for_sale: reasonForSaleEnum,
    reason_details: z.string().optional(),
    gst_filing_status: gstFilingEnum,
    itr_filing_status: itrFilingEnum,
    outstanding_tax: z.boolean(),
    outstanding_tax_details: z.string().optional(),
    employee_count_range: employeeRangeEnum,
    monthly_opex: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const rc = parseRupeesStringToPaise(data.revenue_current_fy);
    if (rc === null || rc < MIN_ANNUAL_REVENUE_PAISE) {
      ctx.addIssue({
        code: "custom",
        message: `Minimum revenue is ₹${(MIN_ANNUAL_REVENUE_PAISE / 100).toLocaleString("en-IN")} (₹25L)`,
        path: ["revenue_current_fy"],
      });
    }
    const r1 = parseRupeesStringToPaise(data.revenue_fy_minus_1);
    if (r1 === null || r1 <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount for FY-1 revenue",
        path: ["revenue_fy_minus_1"],
      });
    }
    const ebitda = parseRupeesStringToPaise(data.ebitda_latest);
    if (ebitda === null) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid EBITDA amount",
        path: ["ebitda_latest"],
      });
    }
    const ask = parseRupeesStringToPaise(data.asking_price);
    if (ask === null || ask <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid asking price",
        path: ["asking_price"],
      });
    }
    if (data.reason_for_sale === "OTHER") {
      const d = data.reason_details?.trim();
      if (!d) {
        ctx.addIssue({
          code: "custom",
          message: "Please describe your reason",
          path: ["reason_details"],
        });
      }
    }
    if (data.outstanding_tax) {
      const d = data.outstanding_tax_details?.trim();
      if (!d) {
        ctx.addIssue({
          code: "custom",
          message: "Please provide details of tax liabilities",
          path: ["outstanding_tax_details"],
        });
      }
    }
    const r2 = data.revenue_fy_minus_2?.trim()
      ? parseRupeesStringToPaise(data.revenue_fy_minus_2)
      : null;
    if (
      data.revenue_fy_minus_2?.trim() &&
      (r2 === null || r2 <= 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount or leave blank",
        path: ["revenue_fy_minus_2"],
      });
    }
    const np = data.net_profit_latest?.trim()
      ? parseRupeesStringToPaise(data.net_profit_latest)
      : null;
    if (
      data.net_profit_latest?.trim() &&
      np === null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount or leave blank",
        path: ["net_profit_latest"],
      });
    }
    const opex = data.monthly_opex?.trim()
      ? parseRupeesStringToPaise(data.monthly_opex)
      : null;
    if (data.monthly_opex?.trim() && (opex === null || opex < 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount or leave blank",
        path: ["monthly_opex"],
      });
    }
  });

export type Layer2FormValues = z.infer<typeof layer2Schema>;

export function layer2FormToRow(
  data: Layer2FormValues,
  sellerProfileId: string
): {
  seller_profile_id: string;
  revenue_current_fy: number;
  revenue_fy_minus_1: number;
  revenue_fy_minus_2: number | null;
  ebitda_latest: number;
  net_profit_latest: number | null;
  asking_price: number;
  open_to_negotiation: boolean;
  reason_for_sale: ReasonForSale;
  reason_details: string | null;
  gst_filing_status: GSTFilingStatus;
  itr_filing_status: ITRFilingStatus;
  outstanding_tax: boolean;
  outstanding_tax_details: string | null;
  employee_count_range: EmployeeRange;
  monthly_opex: number | null;
} {
  const net = data.net_profit_latest?.trim()
    ? parseRupeesStringToPaise(data.net_profit_latest)
    : null;
  const r2 = data.revenue_fy_minus_2?.trim()
    ? parseRupeesStringToPaise(data.revenue_fy_minus_2)
    : null;
  const opex = data.monthly_opex?.trim()
    ? parseRupeesStringToPaise(data.monthly_opex)
    : null;

  return {
    seller_profile_id: sellerProfileId,
    revenue_current_fy: parseRupeesStringToPaise(data.revenue_current_fy)!,
    revenue_fy_minus_1: parseRupeesStringToPaise(data.revenue_fy_minus_1)!,
    revenue_fy_minus_2: r2 && r2 > 0 ? r2 : null,
    ebitda_latest: parseRupeesStringToPaise(data.ebitda_latest)!,
    net_profit_latest: net,
    asking_price: parseRupeesStringToPaise(data.asking_price)!,
    open_to_negotiation: data.open_to_negotiation,
    reason_for_sale: data.reason_for_sale as ReasonForSale,
    reason_details:
      data.reason_for_sale === "OTHER"
        ? data.reason_details?.trim() ?? null
        : null,
    gst_filing_status: data.gst_filing_status as GSTFilingStatus,
    itr_filing_status: data.itr_filing_status as ITRFilingStatus,
    outstanding_tax: data.outstanding_tax,
    outstanding_tax_details: data.outstanding_tax
      ? data.outstanding_tax_details?.trim() ?? null
      : null,
    employee_count_range: data.employee_count_range as EmployeeRange,
    monthly_opex: opex && opex >= 0 ? opex : null,
  };
}

export function paiseToRupeesInput(paise: number | null | undefined): string {
  if (paise == null) return "";
  const rupees = paise / 100;
  if (Number.isNaN(rupees)) return "";
  const neg = rupees < 0;
  const abs = Math.abs(rupees);
  return `${neg ? "-" : ""}${formatIndianNumber(Math.round(abs))}`;
}

// —— Layer 3: document slots (slot keys stored in seller_documents.license_number)

export function slugifyDocLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function universalDocumentSlotKey(documentType: string): string {
  return `u:${documentType}`;
}

export function industryDocumentSlotKey(
  industry: string,
  index: number,
  doc: { type: string; label: string }
): string {
  return `i:${industry}:${index}:${doc.type}:${slugifyDocLabel(doc.label)}`;
}

export type Layer3SlotMeta = {
  slotKey: string;
  documentType: DocumentType;
  label: string;
  priority: "required" | "recommended" | "optional";
  formats: string;
  maxSizeMB: number;
};

export function buildLayer3Slots(industry: string | null): Layer3SlotMeta[] {
  const slots: Layer3SlotMeta[] = [];
  for (const d of UNIVERSAL_DOCUMENTS) {
    slots.push({
      slotKey: universalDocumentSlotKey(d.type),
      documentType: d.type as DocumentType,
      label: d.label,
      priority: d.priority,
      formats: d.formats,
      maxSizeMB: d.maxSizeMB,
    });
  }
  const indDocs = industry ? (INDUSTRY_DOCUMENTS[industry] ?? []) : [];
  indDocs.forEach((d, index) => {
    slots.push({
      slotKey: industryDocumentSlotKey(industry!, index, d),
      documentType: d.type as DocumentType,
      label: d.label,
      priority: d.priority,
      formats: "PDF, JPG, PNG",
      maxSizeMB: 10,
    });
  });
  return slots;
}

export function getRequiredDocumentSlotKeys(
  industry: string | null
): string[] {
  const keys: string[] = [];
  for (const d of UNIVERSAL_DOCUMENTS) {
    if (d.priority === "required") {
      keys.push(universalDocumentSlotKey(d.type));
    }
  }
  const indDocs = industry ? (INDUSTRY_DOCUMENTS[industry] ?? []) : [];
  indDocs.forEach((d, index) => {
    if (d.priority === "required") {
      keys.push(industryDocumentSlotKey(industry!, index, d));
    }
  });
  return keys;
}

/** Row satisfies a slot if license_number matches or legacy universal match. */
export function documentRowMatchesSlot(
  row: Pick<SellerDocument, "document_type" | "license_number">,
  slot: Layer3SlotMeta
): boolean {
  if (row.license_number === slot.slotKey) return true;
  if (
    slot.slotKey.startsWith("u:") &&
    row.document_type === slot.documentType &&
    (row.license_number == null || row.license_number === "")
  ) {
    return true;
  }
  return false;
}

export function allRequiredDocumentsPresent(
  rows: SellerDocument[],
  industry: string | null
): boolean {
  const required = getRequiredDocumentSlotKeys(industry);
  const slots = buildLayer3Slots(industry);
  for (const key of required) {
    const slot = slots.find((s) => s.slotKey === key);
    if (!slot) return false;
    const ok = rows.some((r) => documentRowMatchesSlot(r, slot));
    if (!ok) return false;
  }
  return true;
}

/** Layer 3 “continue” — no field validation; uploads handled per slot. */
export const layer3ContinueSchema = z.object({});

export type Layer3ContinueValues = z.infer<typeof layer3ContinueSchema>;

export const DEAL_STRUCTURE_CHECKBOX_VALUES = [
  "full_acquisition",
  "partial_stake",
  "asset_sale",
  "open_to_all",
] as const;

export const DEAL_STRUCTURE_CHECKBOX_LABELS: Record<
  (typeof DEAL_STRUCTURE_CHECKBOX_VALUES)[number],
  string
> = {
  full_acquisition: "Full Acquisition",
  partial_stake: "Partial Stake",
  asset_sale: "Asset Sale",
  open_to_all: "Open to All",
};

const closingTimelineEnum = z.enum(
  CLOSING_TIMELINES.map((c) => c.value) as [string, ...string[]]
);

const confidentialityEnum = z.enum(
  CONFIDENTIALITY_LEVELS.map((c) => c.value) as [
    ConfidentialityLevel,
    ...ConfidentialityLevel[],
  ]
);

const dealStructureCheckboxEnum = z.enum(DEAL_STRUCTURE_CHECKBOX_VALUES);

export const layer4Schema = z
  .object({
    deal_structures: z
      .array(dealStructureCheckboxEnum)
      .min(1, "Select at least one deal structure"),
    closing_timeline: closingTimelineEnum,
    preferred_buyer_types: z
      .array(z.string())
      .min(1, "Select at least one buyer type"),
    min_buyer_budget: z.string().optional(),
    confidentiality_level: confidentialityEnum,
    key_strengths: z.array(z.string().trim().min(1)).max(5),
    growth_opportunities: z
      .string()
      .trim()
      .min(50, "Use at least 50 characters")
      .max(500, "Maximum 500 characters"),
    contact_preference: z
      .array(z.string())
      .min(1, "Select at least one contact method"),
    preferred_language: z.enum(["English", "Hindi"]),
    authorised_signatory_name: z.string().trim().min(1, "Name is required"),
    authorised_signatory_role: z.string().trim().min(1, "Role is required"),
    tnc_accepted: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.min_buyer_budget?.trim()) {
      const p = parseRupeesStringToPaise(data.min_buyer_budget);
      if (p === null || p <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid minimum budget or leave blank",
          path: ["min_buyer_budget"],
        });
      }
    }
  });

export type Layer4FormValues = z.infer<typeof layer4Schema>;

export function layer4FormToPreferencesRow(
  data: Layer4FormValues,
  sellerProfileId: string
): {
  seller_profile_id: string;
  deal_structures: string[];
  closing_timeline: ClosingTimeline;
  preferred_buyer_types: string[];
  min_buyer_budget: number | null;
  confidentiality_level: ConfidentialityLevel;
  key_strengths: string[];
  growth_opportunities: string;
  contact_preference: string[];
  preferred_language: string;
  authorised_signatory_name: string;
  authorised_signatory_role: string;
  tnc_accepted_at: string;
} {
  const minBud = data.min_buyer_budget?.trim()
    ? parseRupeesStringToPaise(data.min_buyer_budget)
    : null;
  return {
    seller_profile_id: sellerProfileId,
    deal_structures: [...data.deal_structures],
    closing_timeline: data.closing_timeline as ClosingTimeline,
    preferred_buyer_types: [...data.preferred_buyer_types],
    min_buyer_budget: minBud && minBud > 0 ? minBud : null,
    confidentiality_level: data.confidentiality_level,
    key_strengths: data.key_strengths,
    growth_opportunities: data.growth_opportunities.trim(),
    contact_preference: [...data.contact_preference],
    preferred_language: data.preferred_language,
    authorised_signatory_name: data.authorised_signatory_name.trim(),
    authorised_signatory_role: data.authorised_signatory_role.trim(),
    tnc_accepted_at: new Date().toISOString(),
  };
}
