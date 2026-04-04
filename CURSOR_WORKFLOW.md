# 🎯 DealKart MVP — Cursor Workflow (Step-by-Step)

## How Cursor Works (60-second crash course)

Cursor is VS Code with AI built in. Three tools you'll use:

1. **Composer** (`Cmd+I` on Mac, `Ctrl+I` on Windows) → Tell it to build entire features. This is your main weapon.
2. **Chat** (`Cmd+L`) → Ask questions, debug errors, understand code.
3. **Tab completion** → Just start typing and Cursor autocompletes. Accept with Tab.

**Golden rule:** Always have the `.cursorrules` file in your project root. Cursor reads it automatically.

---

## PHASE 0: Setup (Do This First — 20 min)

### Step 1: Create Next.js project
Open your terminal and run:
```bash
npx create-next-app@latest dealkart --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd dealkart
git init
git add -A
git commit -m "init"
```

### Step 2: Install packages
```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod zustand lucide-react sonner clsx tailwind-merge
```

### Step 3: Install shadcn/ui
```bash
npx shadcn@latest init
# Choose: New York style, Slate color, CSS variables: yes

npx shadcn@latest add button card input label select textarea badge dialog tabs separator sheet toast checkbox radio-group progress dropdown-menu table avatar
```

### Step 4: Copy the scaffold files
Copy these files from the downloaded scaffold into your project (replacing any existing files):
- `.cursorrules` → project root
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `src/lib/constants.ts`
- `src/lib/utils.ts` (REPLACE the existing one from shadcn)
- `src/types/database.ts`
- `.env.example` → copy to `.env.local` and fill in your Supabase keys

### Step 5: Run the SQL migration
- Go to supabase.com → your project → SQL Editor
- Paste the contents of `001_initial_schema.sql`
- Click "Run"
- You should see "Success. No rows returned" — that's correct

### Step 6: Create Supabase Storage bucket
- Go to Supabase → Storage → New Bucket
- Name: `seller-documents`
- Public: OFF (unchecked)
- Click Create

### Step 7: Start dev server
```bash
npm run dev
```
Open http://localhost:3000 — you should see the default Next.js page.

**Commit:**
```bash
git add -A && git commit -m "setup: supabase + shadcn + scaffold"
```

---

## PHASE 1: Auth System (Cursor Composer — 1 hr)

Open Cursor. Press `Cmd+I` (Composer). Paste this prompt:

---

### Composer Prompt 1.1: Auth Pages

```
Build the authentication system for DealKart. Read .cursorrules for context.

Create these files:

1. src/app/auth/login/page.tsx
- Clean centered card with "DealKart" branding (emerald-600 color theme)
- Email input field (we'll use email magic link for MVP)
- "Send Login Link" button that calls supabase.auth.signInWithOtp({ email })
- After sending: show "Check your email" confirmation with a resend timer (30s)
- Handle errors with toast notifications (use sonner)
- Link to register page at bottom

2. src/app/auth/register/page.tsx
- Step 1: Two large clickable cards for role selection:
  - "I want to sell my business" (icon: Store) → role = SELLER
  - "I want to acquire a business" (icon: Search) → role = BUYER
- Step 2: After role selection, show form: Full Name, Email
- Submit calls supabase.auth.signUp({ email, options: { data: { full_name, role } } })
- Show "Check your email to verify" confirmation
- Link to login page at bottom

3. src/app/auth/callback/route.ts
- Handle the auth callback from magic link
- Exchange code for session
- Fetch the user's profile role from the profiles table
- Redirect: SELLER → /seller/dashboard, BUYER → /buyer/marketplace, ADMIN → /admin/dashboard

4. src/components/shared/Navbar.tsx
- Logo: "DealKart" text in emerald-600, font-bold, text-xl
- Desktop: Login + Register buttons on right (if not logged in)
- Desktop: User name + role badge + Logout dropdown (if logged in)
- Mobile: hamburger menu
- Sticky top, white background, subtle bottom border

5. Update src/app/layout.tsx
- Import and render Navbar
- Add Toaster from sonner
- Set metadata title to "DealKart — India's MSME M&A Marketplace"

Use shadcn/ui components (Button, Card, Input, Label).
Use lucide-react icons (Store, Search, Mail, LogOut, Menu).
Import createClient from @/lib/supabase/client for client components.
Import createClient from @/lib/supabase/server for server components.
```

**After Cursor generates the code:** Test it. Go to localhost:3000/auth/register. Make sure the page renders. Fix any errors by pasting them into Cursor Chat (`Cmd+L`).

**Commit:** `git add -A && git commit -m "feat: auth system"`

---

## PHASE 2: Seller Onboarding (Cursor Composer — 2 hrs)

This is the biggest piece. Break it into sub-prompts:

### Composer Prompt 2.1: Onboarding Stepper + Layer 1

```
Build the seller onboarding wizard. Read .cursorrules for full context.
Import types from @/types/database and constants from @/lib/constants.

Create:

1. src/components/seller/OnboardingStepper.tsx
- Horizontal 4-step stepper: "Business Identity" → "Financials" → "Documents" → "Preferences"
- Props: currentStep (1-4), completedSteps (number[])
- Completed steps: green checkmark + emerald bg
- Current step: highlighted with emerald border
- Future steps: grey, but visible
- Mobile: show "Step 2 of 4" text with dot indicators
- Clicking a completed step navigates back to it

2. src/app/seller/onboarding/page.tsx
- "use client" component
- Fetch seller_profile from Supabase on mount (create one if doesn't exist)
- Show OnboardingStepper at top
- Render the current layer component based on step state
- Store current step in URL search params (?step=1) for resume capability
- "Save & Continue" and "Back" buttons at bottom of each layer

3. src/components/seller/Layer1BusinessIdentity.tsx
- "use client" form using React Hook Form + Zod validation
- Fields (use constants from @/lib/constants for dropdown options):
  * Sale Intent: 3 radio cards using SALE_INTENTS (clickable cards, not plain radio buttons)
  * Business Legal Name: text input
  * DBA/Brand Name: text input (optional)
  * Business Type: select dropdown using BUSINESS_TYPES
  * GSTIN: text input with regex validation (REGEX.GSTIN from constants) + green checkmark on valid format
  * PAN Number: text input with regex validation (REGEX.PAN)
  * Industry: select using INDUSTRIES constant
  * Sub-Category: select that dynamically populates from SUB_CATEGORIES[selectedIndustry]
  * Year Established: number input (1950 to current year)
  * Registered Address: line1, line2, city, state (select from INDIAN_STATES), pincode
  * Operating Locations: dynamic list — add/remove city+state pairs
- Auto-save: on form blur, debounced 1s, PUT to save seller_profile in Supabase
- On "Save & Continue": validate all required fields, save, advance to step 2
- Green toast on successful save

Use Zod schema for validation. All required fields should show red error messages inline.
Use shadcn Card, Input, Select, RadioGroup, Label, Button.
```

### Composer Prompt 2.2: Layer 2 (Financials)

```
Build Layer 2 of the seller onboarding. Read .cursorrules for context.
Import constants from @/lib/constants and types from @/types/database.

Create src/components/seller/Layer2Financials.tsx:
- "use client" form with React Hook Form + Zod
- Fields:
  * Revenue Current FY (₹): currency input that formats with Indian commas as you type
  * Revenue FY-1 (₹): same format
  * Revenue FY-2 (₹): optional, same format
  * EBITDA Latest FY (₹): can be negative
  * Net Profit Latest FY (₹): optional
  * Asking Price (₹): minimum ₹50L for business, ₹5L for assets. Show helper text.
  * Open to Negotiation: toggle/switch, default ON
  * Reason for Sale: select from REASON_FOR_SALE constant + optional text if "OTHER"
  * GST Filing Status: radio group from GST_FILING_OPTIONS
  * ITR Filing Status: radio group from ITR_FILING_OPTIONS
  * Outstanding Tax Liabilities: toggle. If YES, show text area for details.
  * Employee Count Range: select from EMPLOYEE_RANGES
  * Monthly Operating Expense (₹): optional

- If the seller's sale_intent (from Layer 1 data) is ASSET_SALE, show a simplified version:
  * Asset Type dropdown (Machinery / Vehicle / Equipment / Inventory / IP / Real Estate / Other)
  * Asset Description textarea
  * Purchase Year
  * Original Purchase Price (₹)
  * Current Estimated Value (₹)
  * Condition radio (Excellent / Good / Fair / Needs Repair)
  * Quantity (number, default 1)
  * Location of Asset (address fields)

- Save to seller_financials table in Supabase (upsert by seller_profile_id)
- All ₹ values: display in rupees but store as paise (multiply by 100) using parseINRtoPaise from utils
- Auto-save on blur
```

### Composer Prompt 2.3: Layer 3 (Documents)

```
Build Layer 3 of seller onboarding — document uploads. Read .cursorrules.
Import UNIVERSAL_DOCUMENTS and INDUSTRY_DOCUMENTS from @/lib/constants.

Create src/components/seller/Layer3Documents.tsx:
- Show document upload slots based on UNIVERSAL_DOCUMENTS (always shown)
- Also show industry-specific documents from INDUSTRY_DOCUMENTS[seller's industry]
- Each slot shows:
  * Document name + priority badge (REQUIRED = red, RECOMMENDED = blue, OPTIONAL = grey)
  * Accepted formats text
  * Upload button (or drag-drop zone)
  * After upload: show filename + file size + green check + "Remove" button
  * "Upload Later" button → marks slot as skipped (amber warning icon)

- File upload flow:
  * Use Supabase Storage: supabase.storage.from('seller-documents').upload(path, file)
  * Path format: {seller_profile_id}/{document_type}_{timestamp}.{ext}
  * After upload: create record in seller_documents table
  * Show upload progress

- Bottom note: "You can skip documents now and upload them later from your dashboard.
  Your listing cannot go live until all REQUIRED documents are uploaded."

- CRITICAL UX: This layer does NOT block progression. Seller can proceed to Layer 4
  even with missing documents. But track which are uploaded vs skipped.

Use shadcn Card, Badge, Button, Progress. Use lucide-react Upload, File, Check, AlertTriangle icons.
```

### Composer Prompt 2.4: Layer 4 (Preferences) + Completion

```
Build Layer 4 of seller onboarding + completion logic. Read .cursorrules.
Import constants from @/lib/constants.

Create src/components/seller/Layer4Preferences.tsx:
- Fields:
  * Preferred Deal Structure: multi-select checkboxes (Full Acquisition / Partial Stake / Asset Sale / Open to All)
  * Desired Closing Timeline: select from CLOSING_TIMELINES
  * Preferred Buyer Type: multi-select checkboxes from BUYER_TYPES
  * Minimum Buyer Budget (₹): optional currency input
  * Confidentiality Level: 3 radio cards from CONFIDENTIALITY_LEVELS (show description for each)
  * Key Strengths: tag input — type + Enter to add, max 5 tags, X to remove
  * Growth Opportunities: textarea (50-500 chars)
  * Contact Preference: multi-select checkboxes from CONTACT_PREFERENCES
  * Preferred Language: select (English / Hindi)
  * Authorised Signatory Name: text input (required)
  * Authorised Signatory Role: text input (required)
  * Terms & Conditions: checkbox "I agree to DealKart's Terms of Service and Privacy Policy" (required, blocking)

- On "Submit & Complete Onboarding":
  * Validate all 4 layers have required fields filled
  * Save preferences to seller_preferences table
  * Check if all REQUIRED documents are uploaded
  * If yes: set onboarding_status = 'ACTIVE', set onboarding_completed_at
  * If no: set onboarding_status = 'PENDING_DOCUMENTS'
  * Show celebration screen: confetti-style card with "You're verified!" message
  * CTA: "Go to Dashboard" → /seller/dashboard

Save to seller_preferences table in Supabase.
```

**Commit after each layer works:** `git add -A && git commit -m "feat: seller onboarding layer N"`

---

## PHASE 3: Seller Dashboard (Cursor Composer — 30 min)

### Composer Prompt 3:

```
Build the seller dashboard. Read .cursorrules.

Create src/app/seller/layout.tsx:
- Sidebar navigation (desktop) / bottom tabs (mobile):
  * Dashboard (LayoutDashboard icon)
  * My Listings (FileText icon)
  * Messages (MessageSquare icon) — show "Coming Soon" badge
  * Settings (Settings icon) — show "Coming Soon" badge
- Show seller's business name + onboarding status badge in sidebar header
- Main content area to the right of sidebar

Create src/app/seller/dashboard/page.tsx:
- If onboarding not complete: show prominent card with progress bar + "Continue Onboarding" button
- Stats row (4 cards): Total Listings (count), Views This Week (sum), Active NDAs (count), Profile Status (badge)
- "Create Listing" button — for MVP, this creates a listing from seller_profile + financials data:
  * Auto-fills headline, industry, financials from onboarding data
  * Sets status = PENDING_REVIEW
  * Redirects to a success message "Your listing has been submitted for review!"
- Listings table: columns = Headline, Status (badge), Asking Price, Views, Created Date
- Each row: View button

Fetch data server-side using createClient from @/lib/supabase/server.
Use formatINRShort and getStatusColor from @/lib/utils.
```

---

## PHASE 4: Buyer Marketplace (Cursor Composer — 1.5 hrs)

### Composer Prompt 4.1: Marketplace Page

```
Build the buyer marketplace. Read .cursorrules for full context.
Import all filter constants from @/lib/constants.

Create src/app/buyer/layout.tsx:
- Simple layout with Navbar (already created)
- No sidebar needed for buyers

Create src/app/buyer/marketplace/page.tsx:
- Header section: "DealKart Marketplace" title + total listing count + sort dropdown
- Deal type filter bar: horizontal scrollable tabs using DEAL_TYPES constant
  * Single-select, "All Deals" active by default
  * Active tab: emerald-600 bottom border + emerald-50 bg
- Filter sidebar (left, 280px wide, collapsible on mobile via Sheet):
  * Industry: checkboxes with expand/collapse for each of the 8 industries
  * Location: radio buttons from INDIAN_STATES (with "Pan India" at top)
  * Revenue Range: radio buttons from REVENUE_RANGES
  * EBITDA Margin: radio buttons from EBITDA_RANGES
  * Employee Count: radio buttons from EMPLOYEE_RANGES
  * Years in Business: radio buttons from YEARS_IN_BUSINESS
  * Toggle: "Close-Ready Only" switch
  * Toggle: "Fully Verified Only" switch
  * "Clear All Filters" button at bottom
- Active filter chips shown above the listing grid (dismissible with X)
- Main content: responsive grid of ListingCard components (2 cols desktop, 1 mobile)
- Client-side filtering: filter the listings array based on selected filters
- Load all LIVE listings from Supabase on page mount

Create src/components/buyer/ListingCard.tsx:
- Card with subtle hover effect (translate-y, shadow-lg, emerald border)
- Badge row at top: industry pill, city pill, close-ready badge (if true), deal type pill
- Headline: bold, text-lg, truncate to 2 lines
- Metrics grid (2x2):
  * Revenue: label + value in emerald using formatINRShort
  * EBITDA: value + margin% in parentheses
  * Asking Price: in emerald-700, font-bold
  * Founded: year
- Verification badges row: 3 small badges with Check icon (green) or X (grey):
  "GST ✓" "Bank ✓" "CA ✓"
- Footer: eye icon + view count, clock icon + "X days ago", "View Details →" link
- Heart/bookmark icon (top right corner) for save — toggle on click

Use shadcn Card, Badge, Button, Sheet (for mobile filters), Switch.
Use lucide-react icons extensively.
Link each card to /buyer/listing/[id].
```

### Composer Prompt 4.2: Listing Detail + NDA

```
Build the listing detail page and NDA flow. Read .cursorrules.

Create src/app/buyer/listing/[id]/page.tsx:
- Server component. Fetch listing by ID from Supabase.
- Call increment_view_count RPC on load.
- If listing not found or not LIVE: show 404.

Page sections:
1. HERO: Large headline, badge row (deal type, industry, city, close-ready), listing ID (shortId from utils), days listed, view count
2. KEY METRICS BAR: 5-column grid on desktop, scrollable on mobile
   Revenue | EBITDA + margin% | Asking Price | Employees | Founded Year
   Values in emerald-600, large font. Labels in grey.
3. WHY BUY THIS BUSINESS: heading + 5 numbered items from listing.why_buy JSON array
   First item gets a highlighted card. Rest are bullet points with emerald numbers.
4. VERIFICATION STATUS: 3-item checklist with green checkmarks or grey X
   GST Verified | Bank Statement Verified | CA Reviewed
5. CTA SECTION:
   - If not logged in: "Login to Request Access" → link to /auth/login
   - If logged in as BUYER and no NDA exists: "Sign NDA & Request Access" button → opens NDAModal
   - If NDA already exists: show status badge (Submitted/Approved/Rejected)
   - "Save to Watchlist" toggle button with heart icon

Create src/components/buyer/NDAModal.tsx:
- "use client" component using shadcn Dialog
- Scrollable NDA text (hardcode a standard confidentiality agreement, ~300 words)
- Form at bottom:
  * "Full Legal Name (as per PAN)" text input, min 3 chars
  * Checkbox: "I have read and agree to the terms of this Non-Disclosure Agreement"
  * "Sign & Submit" button — disabled until name entered + checkbox checked
- On submit:
  * Check if buyer has < 5 active NDAs (if not, show error toast)
  * Insert into ndas table: buyer_id, listing_id, legal_name, status='SUBMITTED'
  * Show success: "NDA submitted successfully! Our team will review within 24 hours."
  * Close modal, update button state to show "NDA Submitted — Under Review"
- Animate with subtle fade-in

Use formatINRShort, shortId, daysSince, getIndustryLabel from @/lib/utils.
```

**Commit:** `git add -A && git commit -m "feat: buyer marketplace + NDA flow"`

---

## PHASE 5: Admin Panel (Cursor Composer — 1.5 hrs)

### Composer Prompt 5:

```
Build the admin panel. Read .cursorrules. All admin routes require role=ADMIN (middleware handles this).

Create src/app/admin/layout.tsx:
- Sidebar with navigation:
  * Dashboard (LayoutDashboard icon)
  * Listings Review (FileCheck icon) — show pending count badge
  * NDA Requests (Shield icon) — show pending count badge
  * Users (Users icon)
- "DealKart Admin" header with admin avatar
- Main content area right of sidebar

Create src/app/admin/dashboard/page.tsx:
- Stats grid (6 cards): Total Users, Sellers, Buyers, Live Listings, Pending Reviews, Open NDAs
- Fetch counts using createAdminClient from @/lib/supabase/server (bypasses RLS)
- Recent activity feed: last 10 records combining new users + new listings + new NDAs, sorted by created_at

Create src/app/admin/listings/page.tsx:
- Tabs: All | Pending Review | Live | Rejected
- Table columns: Headline, Seller Name (joined from profiles), Industry, Asking Price, Status (badge), Submitted Date, Actions
- Actions per row:
  * "Approve" button (green) → sets status='LIVE', gst_verified=true, bank_verified=true, ca_reviewed=true
  * "Reject" button (red) → opens dialog with textarea for reason → sets status='REJECTED', saves admin_notes
  * "View" button → expandable row or dialog showing full listing details
- Use shadcn Table, Badge, Dialog, Textarea, Button, Tabs

Create src/app/admin/ndas/page.tsx:
- Table columns: Buyer Name, Listing Headline, Signed Date, Status (badge), Actions
- Actions:
  * "Approve" → sets status='APPROVED', admin_reviewer_id = current admin
  * "Reject" → dialog with reason → sets status='REJECTED', saves admin_notes
- Expandable row showing buyer profile details

Create src/app/admin/users/page.tsx:
- Tabs: All | Sellers | Buyers | Admins
- Table columns: Name, Email, Role (badge), Status, Joined Date, Actions
- Actions: View Details (expandable), Suspend/Activate toggle
- For sellers: show onboarding status in an extra column

All data fetched server-side using createAdminClient (service_role key, bypasses RLS).
Use getNDAStatusColor, getStatusColor from @/lib/utils.
```

**Commit:** `git add -A && git commit -m "feat: admin panel"`

---

## PHASE 6: Landing Page + Seed Data (Cursor Composer — 30 min)

### Composer Prompt 6:

```
Build the landing page and seed data API. Read .cursorrules.

Create src/app/page.tsx:
- Hero section (full width, emerald-50 bg):
  * "India's Most Trusted MSME M&A Marketplace" — large heading
  * "Verified businesses. CA-reviewed financials. Close in 4 weeks." — subtitle
  * Two CTA buttons: "List Your Business" (emerald, → /auth/register) and "Browse Businesses" (outline, → /buyer/marketplace)
- Trust bar: "100% Verified Listings | CA-Reviewed | NDA-Protected" — 3 items with Shield, CheckCircle, Lock icons
- How It Works: 3-step visual with numbered circles
  1. Register & Verify — "Complete your profile, get GST-verified"
  2. List or Browse — "Sellers list, buyers discover verified businesses"
  3. Close the Deal — "NDA, due diligence, LOI — all on one platform"
- Stats section: "15+ Verified Listings | ₹50Cr+ Active Deals | 100+ Buyers"
- Footer: "DealKart © 2026 | Built for Indian MSMEs | Contact: hello@dealkart.in"

Professional, clean design. Emerald as primary color. Trust-focused.

Create src/app/api/seed/route.ts:
- POST endpoint (protected by ADMIN_SECRET env var in request header)
- Creates 5 demo listings directly in the listings table with status='LIVE':
  1. "Profitable 12-Outlet QSR Chain — Bengaluru" (FNB, ₹8.5Cr rev, ₹2.4Cr EBITDA, asking ₹15Cr)
  2. "Established Diagnostic Lab Network — Mumbai" (HEALTHCARE, ₹3.2Cr rev, ₹1.1Cr EBITDA, asking ₹6Cr)
  3. "25-Year Auto Components Manufacturer — Pune" (MANUFACTURING, ₹18Cr rev, ₹3.6Cr EBITDA, asking ₹22Cr)
  4. "Growing D2C Beauty Brand — Delhi NCR" (RETAIL, ₹1.8Cr rev, ₹45L EBITDA, asking ₹3.5Cr)
  5. "Profitable IT Services Company — Hyderabad" (TECH, ₹5Cr rev, ₹1.5Cr EBITDA, asking ₹8Cr)
- Each listing needs: realistic why_buy (5 reasons array), key_strengths (5 items), all verification badges true, realistic employee counts, year_founded, ebitda_margin calculated
- Use a dummy seller_id (you'll need to create one seller account first)
- All financial values in PAISE (multiply rupees by 100)
- Return { success: true, count: 5 }

Create src/app/api/admin/make-admin/route.ts:
- POST endpoint. Body: { email, secret }
- Verify secret matches ADMIN_SECRET env var
- Update profiles set role='ADMIN' where email matches
- Return success/error
```

**Commit:** `git add -A && git commit -m "feat: landing page + seed data"`

---

## PHASE 7: Deploy (15 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard (Settings → Environment Variables):
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# ADMIN_SECRET

# Redeploy with env vars
vercel --prod
```

### Post-deploy checklist:
1. Register as a Seller → complete onboarding
2. Make yourself admin: POST to /api/admin/make-admin with your email + secret
3. Seed listings: POST to /api/seed with ADMIN_SECRET header
4. Register as a Buyer (different email) → browse → sign NDA
5. Go to /admin → approve listings and NDAs
6. Share the URL 🚀

---

## DEBUGGING IN CURSOR

When something breaks, use Cursor Chat (`Cmd+L`):

```
I'm getting this error: [paste error]
The file is src/app/buyer/marketplace/page.tsx
Fix it.
```

For styling issues:
```
The marketplace page looks broken on mobile. The filter sidebar overlaps the cards.
Fix the responsive layout. Use a Sheet component for mobile filters.
```

For Supabase issues:
```
I'm getting "new row violates row-level security policy" when trying to insert into the listings table.
My user role is SELLER. Check the RLS policies and fix them.
```

---

## KEY TIPS FOR CURSOR

1. **One prompt, one feature.** Don't ask for 5 things at once.
2. **Always accept the full diff.** Don't cherry-pick — Cursor's edits are interdependent.
3. **Test after every prompt.** Check localhost:3000 before moving on.
4. **If Cursor breaks something:** Undo with `Cmd+Z` or `git checkout .` to reset.
5. **Keep the terminal open.** Watch for compilation errors.
6. **When stuck:** paste the error into Chat, not Composer.
