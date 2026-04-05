# TheBuzSale / DealKart — Project Handoff Document
**Last updated:** 5 April 2026, 3:20 PM IST
**Purpose:** Upload this file to any new AI chat (Claude, Cursor, Windsurf, etc.) to resume work instantly.

---

## What Is This?
TheBuzSale (codebase name: DealKart) is India's first verification-first marketplace for buying/selling MSME businesses. Think "Zillow for businesses" with CA-verified financials, NDAs, and structured deal flow. Target: 63M+ Indian MSMEs. Deal range: ₹50L — ₹100Cr.

## Tech Stack
- **Next.js 16** (App Router, TypeScript, `src/` directory)
- **Supabase** (PostgreSQL, Auth, Storage, Row Level Security)
- **Tailwind CSS 4** + shadcn/ui (base-nova style)
- **React Hook Form** + Zod for forms
- **Zustand** for client state (planned, not yet built)
- **Sonner** for toast notifications
- **Lucide React** for icons
- Local dev: `npm run dev` at `~/Projects/dealkart`
- Secrets in `.env.local`

## Project Location
```
~/Projects/dealkart
```

## Current State (What Works ✅)

### Auth System ✅
- Password-based login (primary) + magic link (optional)
- Registration with role selection (Seller/Buyer), phone number collection
- Auto-sign-in after registration (bypasses email confirmation)
- Role-based middleware route protection (SELLER/BUYER/ADMIN)
- Auth check on login/register pages — redirects if already logged in
- Auth callback for magic link flows

### Seller Flow ✅
- 4-layer onboarding wizard (Business Identity → Financials → Documents → Preferences)
- All 4 layers save to Supabase independently
- Seller dashboard with stats (Total Listings, Views, NDAs, Profile Status)
- Listings table showing seller's own listings
- Create Listing button (with duplicate prevention)
- Seller sidebar layout with Dashboard, My Listings, Messages (coming soon), Settings (coming soon)
- Document upload to Supabase Storage bucket "seller-documents"

### Buyer Flow ✅
- Public marketplace (no login required to browse)
- Listing cards with industry, location, revenue, EBITDA, asking price
- Listing detail page with verification badges
- NDA modal with legal text, name input, checkbox, submit
- NDA submission creates record in ndas table
- "Express interest" redirects to register if not logged in

### Admin Panel ✅
- Dashboard with stats (Users, Sellers, Buyers, Live Listings, Pending Review, Pending NDAs)
- Listings page — approve/reject listings (updates status directly via Supabase client)
- NDA Requests page — approve/reject NDAs
- Users page — view all users
- Documents page — view/approve/reject uploaded seller documents (uses signed URLs)
- Sidebar with Dashboard, Listings, Documents, NDA Requests, Users

### Landing Page ✅
- Hero with CTAs (List your business / Browse businesses)
- Trust bar (Verified listings, CA-reviewed financials, NDA-protected)
- How it works (3-step)
- Stats section
- CTA + Footer

### Infrastructure ✅
- 16 shadcn UI components
- Database types (src/types/database.ts)
- Zod validations (auth + seller)
- Utility functions (formatINR, formatINRShort, parseINRtoPaise, etc.)
- Constants (industries, states, business types, document types, etc.)
- Supabase clients (browser + server + middleware)

## What's NOT Built Yet ❌
- `src/hooks/` — no custom hooks (useAuth, useOnboarding, useListings)
- `src/stores/` — no Zustand stores (onboardingStore, filterStore)
- Save to Watchlist feature (UI exists, backend not wired)
- Seller Messages page (placeholder "Coming Soon")
- Seller Settings page (placeholder "Coming Soon")
- Admin API routes for approve/reject (actions currently use direct Supabase client calls, may fail with RLS)

## Known Issues / Bugs 🐛
1. **Middleware deprecation warning** — Next.js 16 wants "proxy" instead of "middleware". Works fine, cosmetic warning.
2. **EBITDA display** — may show wrong values if financial data wasn't entered in correct paise format during onboarding
3. **RLS on admin actions** — admin approve/reject uses client-side Supabase. If RLS is enabled on listings/ndas tables, these may fail. May need service role client for admin operations.
4. **Email confirmation still ON in Supabase** — registration works around it via auto-sign-in, but should be turned off in Supabase Dashboard → Auth → Providers → Email for cleaner flow
5. **No auto-creation of profiles on signup trigger** — profiles are created via app code upsert, not via database trigger. If the upsert fails, user exists in auth but has no profile → middleware blocks access.

## File Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── layout.tsx
│   │   ├── listings/page.tsx
│   │   ├── ndas/page.tsx
│   │   └── users/page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── documents/route.ts
│   │   │   └── make-admin/route.ts
│   │   ├── seed/route.ts
│   │   └── seller/listings/route.ts
│   ├── auth/
│   │   ├── callback/route.ts
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── buyer/
│   │   ├── layout.tsx
│   │   ├── listing/[id]/page.tsx
│   │   └── marketplace/page.tsx
│   ├── seller/
│   │   ├── dashboard/page.tsx
│   │   ├── layout.tsx
│   │   ├── listings/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── settings/page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (landing page)
├── components/
│   ├── admin/
│   │   ├── AdminDocumentActions.tsx
│   │   ├── AdminListingActions.tsx
│   │   └── AdminNDAActions.tsx
│   ├── auth/
│   │   └── AuthBrandPanel.tsx
│   ├── buyer/
│   │   ├── ListingCTA.tsx
│   │   ├── ListingCard.tsx
│   │   ├── MarketplaceClient.tsx
│   │   └── NDAModal.tsx
│   ├── seller/
│   │   ├── DashboardCreateListingButton.tsx
│   │   ├── Layer1BusinessIdentity.tsx
│   │   ├── Layer2Financials.tsx
│   │   ├── Layer3Documents.tsx
│   │   ├── Layer4Preferences.tsx
│   │   ├── OnboardingContinueBanner.tsx
│   │   └── OnboardingStepper.tsx
│   ├── shared/
│   │   └── Navbar.tsx
│   └── ui/ (16 shadcn components — do NOT edit)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   └── seller.ts
│   ├── constants.ts
│   └── utils.ts
├── middleware.ts
└── types/
    └── database.ts
```

## Database Tables (Supabase)
- `profiles` — extends auth.users, stores role (SELLER/BUYER/ADMIN), full_name, email, mobile
- `seller_profiles` — business identity, onboarding state/layer
- `seller_financials` — revenue, EBITDA, asking price (all in paise)
- `seller_documents` — uploaded doc metadata, verification status
- `seller_preferences` — deal preferences, confidentiality, T&C
- `listings` — marketplace listings with status workflow (DRAFT → PENDING_REVIEW → LIVE → CLOSED etc.)
- `ndas` — buyer NDA records per listing
- `saved_listings` — buyer watchlist (table exists, feature not wired)

Full schema: `supabase/migrations/001_initial_schema.sql`

## Key Conventions
- Server Components by default. `"use client"` only for forms/interactivity/hooks.
- All financial values as BIGINT (paise) in DB, formatted to ₹ in UI via `formatINR()`/`formatINRShort()`
- Indian number system: 12,34,567 (not 1,234,567)
- Primary color: emerald-600 (#059669)
- Component files: PascalCase. Utility files: camelCase.
- No `any` types. TypeScript strict mode.
- Use lucide-react for all icons.
- Toast via sonner.

## Test Accounts in Supabase
- **Admin/Seller:** cksynapse@gmail.com (role set manually in profiles table)
- **Buyer:** buyer@test.com / buyer123456
- **Test Seller:** test-seller@test.com (created via Supabase dashboard)

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://ydepwsaditaoclhltnyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_SECRET=dealkart-admin-2026
```
⚠️ These keys were exposed in chat and should be rotated.

## When Helping Me
- Read .cursorrules / .windsurfrules / CLAUDE.md for full rules
- Match existing patterns in src/
- Use Supabase clients from @/lib/supabase/*, not raw SQL
- Don't invent tables — match database.ts types
- Use existing UI components from src/components/ui/
- Financial amounts: paise in DB, rupees in UI

## What I Want To Build Next
(Update this section with your current task before uploading)
- [ ] Fix any build errors
- [ ] Zustand stores for onboarding auto-save
- [ ] Custom hooks (useAuth, useListings)
- [ ] Save to Watchlist backend
- [ ] Seller Messages / Settings pages
- [ ] Production deployment on Vercel
