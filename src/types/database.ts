// ============================================
// DealKart Database Types
// ============================================

export type UserRole = "SELLER" | "BUYER" | "ADMIN";
export type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "PENDING_DOCUMENTS" | "ACTIVE" | "SUSPENDED";
export type SaleIntent = "FULL_BUSINESS" | "PARTIAL_STAKE" | "ASSET_SALE";
export type BusinessType = "PVT_LTD" | "LLP" | "PROPRIETORSHIP" | "PARTNERSHIP" | "HUF" | "OPC";
export type IndustryType = "FNB" | "HEALTHCARE" | "MANUFACTURING" | "RETAIL" | "SERVICES" | "TECH" | "AGRICULTURE" | "OTHER";
export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "LIVE" | "UNDER_OFFER" | "CLOSED" | "WITHDRAWN" | "REJECTED";
export type NDAStatus = "SUBMITTED" | "APPROVED" | "REJECTED";
export type ReasonForSale = "RETIREMENT" | "NEW_VENTURE" | "HEALTH" | "FINANCIAL" | "DISPUTE" | "OTHER";
export type ConfidentialityLevel = "STANDARD" | "HIGH" | "ULTRA";
export type GSTFilingStatus = "REGULAR" | "IRREGULAR" | "COMPOSITION" | "NA";
export type ITRFilingStatus = "FILED_2YR" | "FILED_1YR" | "NOT_FILED" | "NA";
export type EmployeeRange = "RANGE_0_5" | "RANGE_6_20" | "RANGE_21_50" | "RANGE_51_200" | "RANGE_200_PLUS";
export type ClosingTimeline = "ASAP" | "ONE_TO_THREE" | "THREE_TO_SIX" | "FLEXIBLE" | "NO_RUSH";
export type DocumentType = "PAN" | "GST_CERT" | "GSTR1" | "GSTR3B" | "BANK_STMT" | "ITR" | "PNL" | "BALANCE_SHEET" | "COI" | "MOA" | "AOA" | "PARTNERSHIP_DEED" | "UDYAM" | "FSSAI" | "FACTORY_LICENSE" | "OTHER";
export type DocUploadStatus = "UPLOADING" | "UPLOADED" | "FAILED";
export type DocVerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REUPLOAD";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  mobile: string | null;
  avatar_url: string | null;
  kyc_level: number;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  sale_intent: SaleIntent | null;
  business_legal_name: string | null;
  dba_name: string | null;
  business_type: BusinessType | null;
  gstin: string | null;
  gstin_verified: boolean;
  pan_number: string | null;
  industry: IndustryType | null;
  sub_category: string | null;
  year_established: number | null;
  registered_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  operating_locations: Array<{ city: string; state: string }>;
  onboarding_status: OnboardingStatus;
  onboarding_layer_completed: number;
  onboarding_started_at: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerFinancials {
  id: string;
  seller_profile_id: string;
  revenue_current_fy: number | null;
  revenue_fy_minus_1: number | null;
  revenue_fy_minus_2: number | null;
  ebitda_latest: number | null;
  net_profit_latest: number | null;
  asking_price: number | null;
  open_to_negotiation: boolean;
  reason_for_sale: ReasonForSale | null;
  reason_details: string | null;
  gst_filing_status: GSTFilingStatus | null;
  itr_filing_status: ITRFilingStatus | null;
  outstanding_tax: boolean;
  outstanding_tax_details: string | null;
  employee_count_range: EmployeeRange | null;
  monthly_opex: number | null;
  created_at: string;
  updated_at: string;
}

export interface SellerDocument {
  id: string;
  seller_profile_id: string;
  document_type: DocumentType;
  storage_path: string;
  original_filename: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  upload_status: DocUploadStatus;
  verification_status: DocVerificationStatus;
  license_number: string | null;
  expiry_date: string | null;
  rejection_reason: string | null;
  uploaded_at: string;
}

export interface SellerPreferences {
  id: string;
  seller_profile_id: string;
  deal_structures: string[];
  closing_timeline: ClosingTimeline | null;
  preferred_buyer_types: string[];
  min_buyer_budget: number | null;
  confidentiality_level: ConfidentialityLevel;
  key_strengths: string[];
  growth_opportunities: string | null;
  contact_preference: string[];
  preferred_language: string;
  authorised_signatory_name: string | null;
  authorised_signatory_role: string | null;
  tnc_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller_profile_id: string | null;
  status: ListingStatus;
  headline: string | null;
  description: string | null;
  vertical: string;
  industry: IndustryType | null;
  sub_category: string | null;
  city: string | null;
  state: string | null;
  asking_price: number | null;
  revenue_latest: number | null;
  ebitda_latest: number | null;
  ebitda_margin: number | null;
  year_founded: number | null;
  employee_count_range: EmployeeRange | null;
  deal_type: string;
  close_ready: boolean;
  gst_verified: boolean;
  bank_verified: boolean;
  ca_reviewed: boolean;
  key_strengths: string[];
  why_buy: string[];
  growth_opportunities: string | null;
  view_count: number;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NDA {
  id: string;
  buyer_id: string;
  listing_id: string;
  legal_name: string;
  status: NDAStatus;
  signed_at: string;
  ip_address: string | null;
  admin_reviewer_id: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined data
  buyer?: Profile;
  listing?: Listing;
}

export interface SavedListing {
  id: string;
  buyer_id: string;
  listing_id: string;
  created_at: string;
}
