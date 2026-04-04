// ============================================
// DealKart Constants — Single Source of Truth
// ============================================

export const INDUSTRIES = [
  { value: "FNB", label: "Food & Beverage" },
  { value: "HEALTHCARE", label: "Healthcare & Pharma" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "RETAIL", label: "Retail / D2C" },
  { value: "SERVICES", label: "Professional Services" },
  { value: "TECH", label: "Technology & SaaS" },
  { value: "AGRICULTURE", label: "Agriculture & Allied" },
  { value: "OTHER", label: "Other" },
] as const;

export const SUB_CATEGORIES: Record<string, string[]> = {
  FNB: [
    "QSR Chain", "Cloud Kitchen", "Fine Dining Restaurant",
    "Bakery & Confectionery", "Catering Service", "Food Processing",
    "Beverage Brand", "Bar & Lounge", "Café",
  ],
  HEALTHCARE: [
    "Clinic / Polyclinic", "Hospital", "Diagnostic Lab",
    "Pharmacy Chain", "Dental Practice", "Physiotherapy Centre",
    "Ayurveda / Wellness", "Veterinary", "Telemedicine",
  ],
  MANUFACTURING: [
    "CNC / Precision", "Textile / Garment", "Food Processing",
    "Plastics / Packaging", "Auto Components", "Chemical",
    "Electronics Assembly", "Pharma Manufacturing", "Steel & Metal",
  ],
  RETAIL: [
    "Fashion / Apparel", "Electronics", "FMCG",
    "Jewellery", "Home & Living", "Beauty & Personal Care",
    "Specialty Retail", "E-Commerce Brand", "Grocery",
  ],
  SERVICES: [
    "IT Services / Consulting", "Staffing / HR", "Logistics / Courier",
    "Education / EdTech", "Real Estate Services", "Financial Services",
    "Legal / Consulting", "Marketing Agency", "Design Studio",
  ],
  TECH: [
    "SaaS Product", "Mobile App", "Marketplace / Platform",
    "AI / ML Company", "IoT / Hardware", "Fintech",
    "HealthTech", "AgriTech", "Cybersecurity",
  ],
  AGRICULTURE: [
    "Farming / Plantation", "Dairy", "Poultry / Livestock",
    "Organic Produce", "Agri Input (Seeds/Fertilizer)",
    "Food Grain Processing", "Export Business", "Farm Equipment",
  ],
  OTHER: ["Other"],
};

export const BUSINESS_TYPES = [
  { value: "PVT_LTD", label: "Private Limited" },
  { value: "LLP", label: "LLP" },
  { value: "PROPRIETORSHIP", label: "Proprietorship" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "HUF", label: "HUF" },
  { value: "OPC", label: "One Person Company" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Delhi NCR", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Jammu & Kashmir",
] as const;

export const SALE_INTENTS = [
  { value: "FULL_BUSINESS", label: "Sell Entire Business", description: "Transfer 100% ownership of your business" },
  { value: "PARTIAL_STAKE", label: "Sell Partial Stake", description: "Sell a percentage of equity to an investor" },
  { value: "ASSET_SALE", label: "Sell Business Assets", description: "Sell machinery, equipment, IP, or inventory" },
] as const;

export const DEAL_TYPES = [
  { value: "all", label: "All Deals" },
  { value: "full_acquisition", label: "Full Acquisition" },
  { value: "majority_stake", label: "Majority Stake" },
  { value: "strategic_investment", label: "Strategic Investment" },
  { value: "asset_purchase", label: "Asset Purchase" },
  { value: "merger", label: "Merger" },
  { value: "management_buyout", label: "Management Buyout" },
  { value: "distressed", label: "Distressed / IBC" },
] as const;

export const REVENUE_RANGES = [
  { value: "50l_2cr", label: "₹50L — ₹2Cr", min: 5000000, max: 20000000 },
  { value: "2cr_10cr", label: "₹2Cr — ₹10Cr", min: 20000000, max: 100000000 },
  { value: "10cr_50cr", label: "₹10Cr — ₹50Cr", min: 100000000, max: 500000000 },
  { value: "50cr_100cr", label: "₹50Cr — ₹100Cr", min: 500000000, max: 1000000000 },
  { value: "100cr_plus", label: "₹100Cr+", min: 1000000000, max: Infinity },
] as const;

export const EBITDA_RANGES = [
  { value: "lt_10", label: "< 10%", min: 0, max: 10 },
  { value: "10_20", label: "10% — 20%", min: 10, max: 20 },
  { value: "20_30", label: "20% — 30%", min: 20, max: 30 },
  { value: "30_plus", label: "30%+", min: 30, max: 100 },
] as const;

export const EMPLOYEE_RANGES = [
  { value: "RANGE_0_5", label: "1 — 5 employees" },
  { value: "RANGE_6_20", label: "6 — 20 employees" },
  { value: "RANGE_21_50", label: "21 — 50 employees" },
  { value: "RANGE_51_200", label: "51 — 200 employees" },
  { value: "RANGE_200_PLUS", label: "200+ employees" },
] as const;

export const YEARS_IN_BUSINESS = [
  { value: "lt_2", label: "< 2 years" },
  { value: "2_5", label: "2 — 5 years" },
  { value: "5_10", label: "5 — 10 years" },
  { value: "10_20", label: "10 — 20 years" },
  { value: "20_plus", label: "20+ years" },
] as const;

export const REASON_FOR_SALE = [
  { value: "RETIREMENT", label: "Retirement" },
  { value: "NEW_VENTURE", label: "Starting New Venture" },
  { value: "HEALTH", label: "Health Reasons" },
  { value: "FINANCIAL", label: "Financial Pressure" },
  { value: "DISPUTE", label: "Partnership Dispute" },
  { value: "OTHER", label: "Other" },
] as const;

export const GST_FILING_OPTIONS = [
  { value: "REGULAR", label: "Regular Filer" },
  { value: "IRREGULAR", label: "Irregular (gaps in filing)" },
  { value: "COMPOSITION", label: "Composition Scheme" },
  { value: "NA", label: "Not Applicable" },
] as const;

export const ITR_FILING_OPTIONS = [
  { value: "FILED_2YR", label: "Filed last 2 years" },
  { value: "FILED_1YR", label: "Filed last year only" },
  { value: "NOT_FILED", label: "Not filed" },
  { value: "NA", label: "Not applicable" },
] as const;

export const CLOSING_TIMELINES = [
  { value: "ASAP", label: "ASAP (< 1 month)" },
  { value: "ONE_TO_THREE", label: "1 — 3 months" },
  { value: "THREE_TO_SIX", label: "3 — 6 months" },
  { value: "FLEXIBLE", label: "Flexible" },
  { value: "NO_RUSH", label: "No Rush" },
] as const;

export const CONFIDENTIALITY_LEVELS = [
  { value: "STANDARD", label: "Standard", description: "Anonymised teaser visible on marketplace + NDA for details" },
  { value: "HIGH", label: "High", description: "VDR access only after admin vetting of buyer" },
  { value: "ULTRA", label: "Ultra", description: "No teaser shown — admin refers qualified buyers only" },
] as const;

export const BUYER_TYPES = [
  { value: "individual", label: "Individual Entrepreneur" },
  { value: "family_business", label: "Family Business" },
  { value: "private_equity", label: "Private Equity / Search Fund" },
  { value: "strategic", label: "Strategic Acquirer" },
  { value: "no_preference", label: "No Preference" },
] as const;

export const CONTACT_PREFERENCES = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "platform", label: "Platform Messaging Only" },
] as const;

// Required documents for ALL sellers
export const UNIVERSAL_DOCUMENTS = [
  { type: "PAN", label: "PAN Card (Business)", priority: "required" as const, formats: "PDF, JPG, PNG", maxSizeMB: 5 },
  { type: "GST_CERT", label: "GST Certificate", priority: "required" as const, formats: "PDF", maxSizeMB: 5 },
  { type: "GSTR1", label: "GST Returns (GSTR-1)", priority: "required" as const, formats: "PDF, Excel", maxSizeMB: 10 },
  { type: "GSTR3B", label: "GST Returns (GSTR-3B)", priority: "required" as const, formats: "PDF, Excel", maxSizeMB: 10 },
  { type: "BANK_STMT", label: "Bank Statements (12 months)", priority: "required" as const, formats: "PDF (bank-issued)", maxSizeMB: 20 },
  { type: "ITR", label: "ITR (Last 2 years)", priority: "required" as const, formats: "PDF", maxSizeMB: 10 },
  { type: "PNL", label: "Audited P&L Statement", priority: "required" as const, formats: "PDF", maxSizeMB: 10 },
  { type: "BALANCE_SHEET", label: "Audited Balance Sheet", priority: "required" as const, formats: "PDF", maxSizeMB: 10 },
  { type: "UDYAM", label: "MSME / Udyam Registration", priority: "recommended" as const, formats: "PDF", maxSizeMB: 5 },
] as const;

// Industry-specific documents
export const INDUSTRY_DOCUMENTS: Record<string, Array<{ type: string; label: string; priority: "required" | "recommended" | "optional" }>> = {
  FNB: [
    { type: "FSSAI", label: "FSSAI License", priority: "required" },
    { type: "OTHER", label: "Health / Trade License", priority: "recommended" },
    { type: "OTHER", label: "Fire NOC", priority: "recommended" },
  ],
  HEALTHCARE: [
    { type: "OTHER", label: "Clinical Establishment License", priority: "required" },
    { type: "OTHER", label: "Drug License", priority: "recommended" },
    { type: "OTHER", label: "NABH / NABL Accreditation", priority: "recommended" },
  ],
  MANUFACTURING: [
    { type: "FACTORY_LICENSE", label: "Factory License", priority: "required" },
    { type: "OTHER", label: "Pollution Control NOC", priority: "required" },
    { type: "OTHER", label: "BIS Certification", priority: "recommended" },
  ],
  TECH: [
    { type: "OTHER", label: "Domain / IP Ownership Proof", priority: "required" },
    { type: "OTHER", label: "DPIIT Recognition", priority: "optional" },
  ],
};

// Validation regex patterns
export const REGEX = {
  INDIAN_MOBILE: /^[6-9]\d{9}$/,
  GSTIN: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
  PAN: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
  PINCODE: /^[1-9]\d{5}$/,
  FSSAI: /^\d{14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
