import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind classname merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format paise (BIGINT) to Indian Rupee display
export function formatINR(paise: number | null | undefined): string {
  if (paise == null) return "—";
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Format paise to short form (₹1.5Cr, ₹50L)
export function formatINRShort(paise: number | null | undefined): string {
  if (paise == null) return "—";
  const rupees = paise / 100;

  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  return formatINR(paise);
}

// Parse Indian currency input string to paise
export function parseINRtoPaise(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, "");
  const rupees = parseFloat(cleaned);
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

// Format number with Indian comma system (12,34,567)
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

// Calculate EBITDA margin percentage
export function calcEBITDAMargin(ebitda: number | null, revenue: number | null): number | null {
  if (!ebitda || !revenue || revenue === 0) return null;
  return Math.round((ebitda / revenue) * 100 * 100) / 100; // 2 decimal places
}

// Calculate days since a date
export function daysSince(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Generate a short display ID from UUID
export function shortId(uuid: string): string {
  return `DK-${uuid.slice(0, 6).toUpperCase()}`;
}

// Get industry label from enum value
export function getIndustryLabel(value: string): string {
  const map: Record<string, string> = {
    FNB: "Food & Beverage",
    HEALTHCARE: "Healthcare",
    MANUFACTURING: "Manufacturing",
    RETAIL: "Retail / D2C",
    SERVICES: "Services",
    TECH: "Technology",
    AGRICULTURE: "Agriculture",
    OTHER: "Other",
  };
  return map[value] || value;
}

// Get employee range label
export function getEmployeeLabel(value: string | null): string {
  const map: Record<string, string> = {
    RANGE_0_5: "1-5",
    RANGE_6_20: "6-20",
    RANGE_21_50: "21-50",
    RANGE_51_200: "51-200",
    RANGE_200_PLUS: "200+",
  };
  return value ? map[value] || value : "—";
}

// Listing status badge color
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    LIVE: "bg-emerald-100 text-emerald-700",
    UNDER_OFFER: "bg-blue-100 text-blue-700",
    CLOSED: "bg-purple-100 text-purple-700",
    WITHDRAWN: "bg-slate-100 text-slate-500",
    REJECTED: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

// NDA status badge color
export function getNDAStatusColor(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}
