# GoRASA Sprint -1 — Full Stack Migration & Foundation

> **Sprint Goal:** Migrate from Vite+Express to Next.js 15, set up Google OAuth, build admin dashboard, Package CMS, and deploy to Vercel for June 12 Internal Beta.
>
> **Stack:** Next.js 15 + Supabase (PostgreSQL + Auth) + Vercel + Tailwind + Tiptap
>
> **Timeline:** June 8–12, 2026 (5 days)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | **DONE** — Completed and verified |
| 🔄 | **IN PROGRESS** — Actively being worked on |
| 📋 | **PLANNED** — Scoped and ready to execute |
| ⏳ | **BLOCKED** — Waiting on external input (API keys, credentials) |
| ❌ | **DROPPED** — No longer needed |

---

## Phase 0: Completed Work (Pre-Sprint -1)

### Infrastructure & Deployment ✅

| Task | Status | Notes |
|------|--------|-------|
| Supabase project created (`isubgeemvhvhnhikxbjb`) | ✅ | PostgreSQL + Auth + Storage |
| Database schema — 11 Prisma models | ✅ | User, Company, Lead, Activity, Package, PricingRule, Booking, Payment, Invoice, CancellationRequest |
| Database seeded with test data | ✅ | 6 users, 2 companies, 12 packages, 5 leads, 3 activities, 5 bookings, 5 pricing rules |
| Supabase Auth demo users created | ✅ | All 6 emails, password: `demo123` |
| GitHub repo created | ✅ | [github.com/nikgorasa/gorasav1](https://github.com/nikgorasa/gorasav1) |
| Vercel project deployed | ✅ | `rasa-zero-app-main-chi.vercel.app` |
| Environment variables on Vercel | ✅ | DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY |

### Backend API (Vercel Serverless Functions) ✅

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/health` | GET | ✅ | Health check |
| `/api/auth/login` | POST | ✅ | Supabase Auth login |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/packages` | GET | ✅ | List 12 packages |
| `/api/bookings/my` | GET | ✅ | User bookings (authenticated) |
| `/api/bookings/[id]/cancel` | PATCH | ✅ | Cancel booking |
| `/api/leads` | GET | ✅ | List leads (role-restricted) |
| `/api/dashboard/stats` | GET | ✅ | Admin stats |

### Frontend Components ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Navbar | ✅ | Tab navigation, auth state |
| LoginModal | ✅ | Email/password + 3 demo buttons |
| CustomCarousels | ✅ | 7 carousels (1 backend + 6 static) |
| Footer | ✅ | Editorial design, saffron accents |
| MyTrips | ✅ | Booking list, boarding pass, invoice, WhatsApp modals |
| ConciergeChat | ✅ | AI chat (mock), voice synthesis |
| WhatsAppChannel | ✅ | WhatsApp desk (simulated) |
| PremiumDashboard | ✅ | Admin dashboard (6 sub-tabs, mostly mock data) |
| UserProfile | ✅ | Profile (5 sub-tabs, state-only persistence) |
| GoRasaLogo | ✅ | SVG logo |
| App.tsx | ✅ | Main shell (1,785 lines, state-based routing) |

### Services ✅

| Service | Status | Notes |
|---------|--------|-------|
| apiClient.ts | ✅ | Supabase session tokens, all endpoints |
| supabase.ts | ✅ | Supabase client initialization |
| geminiService.ts | ✅ | Mock AI (keyword matching, no real API) |
| flightService.ts | ✅ | Static JSON (11 flights, Mumbai-Delhi only) |
| hotelService.ts | ✅ | Static JSON (19 hotels) |
| globalService.ts | ✅ | Static JSON (8 packages) |
| vendorService.ts | ✅ | Simulated rate verification |
| cacheService.ts | ✅ | In-memory + localStorage cache |

### Known Issues with Current Build

| Issue | Impact |
|-------|--------|
| No URL routing (state-based tabs) | No SEO, no deep linking |
| Tailwind via CDN (not installed) | No tree-shaking, no custom config |
| 1,785-line App.tsx monolith | Hard to maintain |
| Dual backend (Express + Vercel functions) | Confusion, maintenance burden |
| Mock data everywhere | No real flights/hotels/payments |
| No Google OAuth | PRD requires it |
| Only 3 demo logins | Should be all 6 |
| No Package CMS | PRD requires Tiptap editor |

---

## Phase 1: DAY 1 (June 8) — Foundation + Auth

### 1.1 Initialize Next.js 15 Project 📋

| Task | Status |
|------|--------|
| Create Next.js 15 app with TypeScript + Tailwind + App Router | 📋 |
| Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@prisma/client`, `prisma`, `motion`, `lucide-react`, `@tiptap/react`, `@tiptap/starter-kit` | 📋 |
| Configure `tailwind.config.ts` with GoRASA brand colors | 📋 |
| Configure `next.config.ts` | 📋 |
| Set up path aliases (`@/`) | 📋 |

### 1.2 Project Structure 📋

```
gorasa/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, AuthProvider)
│   ├── page.tsx                # Homepage
│   ├── login/page.tsx          # Login page
│   ├── flights/page.tsx        # Flight search
│   ├── hotels/page.tsx         # Hotel search
│   ├── holidays/page.tsx       # Plan My Holiday
│   ├── trips/page.tsx          # My Trips
│   ├── profile/page.tsx        # User profile
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with auth guard
│   │   ├── page.tsx            # Dashboard
│   │   ├── leads/page.tsx      # Lead CRM
│   │   ├── packages/page.tsx   # Package CMS
│   │   └── users/page.tsx      # User management
│   └── api/
│       ├── auth/callback/route.ts   # Google OAuth callback
│       ├── auth/me/route.ts         # Current user
│       ├── packages/route.ts        # CRUD
│       ├── bookings/route.ts        # CRUD
│       ├── leads/route.ts           # CRUD
│       └── dashboard/route.ts       # Stats
├── components/
│   ├── Navbar.tsx
│   ├── LoginModal.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── PackageCarousel.tsx
│   ├── CheckoutModal.tsx
│   ├── InquiryModal.tsx
│   └── ui/
├── lib/
│   ├── supabase.ts            # Browser client
│   ├── supabase-server.ts     # Server client
│   ├── prisma.ts              # Prisma singleton
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useBookings.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── public/data/               # Static JSON (temporary)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 1.3 Supabase Google OAuth Setup (via MCP) 📋

| Task | Status |
|------|--------|
| Enable Google provider in Supabase via MCP | 📋 |
| Configure redirect URL to Vercel domain | 📋 |
| Create `/auth/callback/route.ts` for OAuth redirect handling | 📋 |
| Add "Sign in with Google" button to LoginModal | 📋 |
| Implement cookie-based session with `@supabase/ssr` | 📋 |

**Auth Flow:**
```
User clicks "Sign in with Google"
  → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
  → Google consent screen
  → Redirect to /auth/callback?code=...
  → Server exchanges code for session
  → Check if user exists in Prisma (by email)
  → If not, create with role CUSTOMER
  → Set session cookies (httpOnly, secure)
  → Redirect to /
```

### 1.4 LoginModal — Clean Design + 6 Demo Users 📋

| Task | Status |
|------|--------|
| Redesign modal: Google button (primary) + email/password (secondary) | 📋 |
| Add all 6 demo login buttons with role badges | 📋 |
| Remove old 3-button layout | 📋 |

**Demo Users Grid:**

| Button | Email | Role | Badge Color |
|--------|-------|------|-------------|
| Super Admin | hmittal@gorasa.in | SUPER_ADMIN | Orange |
| Admin | admin@gorasa.in | ADMIN | Blue |
| Sales | sales@gorasa.in | SALES | Green |
| Corporate | neha@corp.in | CORPORATE_USER | Purple |
| Customer | amit@example.com | CUSTOMER | Gray |
| Customer | priya@example.com | CUSTOMER | Gray |

### 1.5 Auth Middleware (`middleware.ts`) 📋

| Task | Status |
|------|--------|
| Protect `/trips`, `/profile`, `/admin/*` routes | 📋 |
| Redirect unauthenticated users to `/login` | 📋 |
| Check role for `/admin/*` (ADMIN, SUPER_ADMIN only) | 📋 |
| Use `@supabase/ssr` for cookie-based auth | 📋 |

### 1.6 Deploy to Vercel 📋

| Task | Status |
|------|--------|
| Connect GitHub repo `nikgorasa/gorasav1` | 📋 |
| Set env vars on Vercel | 📋 |
| Verify deployment | 📋 |

**Day 1 Deliverables:**
- [ ] Next.js 15 project running locally
- [ ] Google OAuth working
- [ ] 6 demo logins functional
- [ ] Auth middleware protecting routes
- [ ] Deployed to Vercel

---

## Phase 2: DAY 2 (June 9) — Homepage + Core Pages

### 2.1 Homepage (`app/page.tsx`) 📋

| Task | Status |
|------|--------|
| Hero section with 3 search tabs (Flights, Hotels, Plan My Holiday) | 📋 |
| Value propositions section | 📋 |
| Curated Journeys carousel (from DB) | 📋 |
| Corporate Travel section | 📋 |
| Testimonials section | 📋 |
| WhatsApp support float | 📋 |
| Footer | 📋 |

### 2.2 Package Carousels 📋

| Task | Status |
|------|--------|
| Fetch packages from `/api/packages` (server-side for SSR) | 📋 |
| 7 carousels: Live from DB + 6 static categories | 📋 |
| Horizontal scroll with arrows | 📋 |
| "Interested" button → InquiryModal | 📋 |

### 2.3 My Trips Page (`app/trips/page.tsx`) 📋

| Task | Status |
|------|--------|
| Fetch bookings from `/api/bookings` | 📋 |
| Booking list with type icons, status badges | 📋 |
| Boarding pass modal (digital pass with QR) | 📋 |
| Invoice modal (tax invoice with GST) | 📋 |
| WhatsApp delivery modal | 📋 |
| Cancel booking flow | 📋 |

### 2.4 Profile Page (`app/profile/page.tsx`) 📋

| Task | Status |
|------|--------|
| Personal Info sub-tab (name, email, mobile, passport, GST) | 📋 |
| Saved Travellers sub-tab (CRUD) | 📋 |
| Travel Preferences sub-tab (meal, seat, hotel, carrier, notifications) | 📋 |
| Loyalty & Referrals sub-tab (points, referral code) | 📋 |
| Wishlist sub-tab (CRUD) | 📋 |
| Persist all data to backend | 📋 |

### 2.5 New API Routes 📋

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/user/profile` | GET/PUT | 📋 |
| `/api/user/passengers` | POST/DELETE | 📋 |
| `/api/user/wishlist` | POST/DELETE | 📋 |
| `/api/user/loyalty` | GET | 📋 |

**Day 2 Deliverables:**
- [ ] Homepage with search tabs + carousels
- [ ] My Trips page with booking modals
- [ ] Profile page with backend persistence
- [ ] New user data API routes

---

## Phase 3: DAY 3 (June 10) — Admin Dashboard + Package CMS

### 3.1 Admin Dashboard (`app/admin/page.tsx`) 📋

| Task | Status |
|------|--------|
| Real KPIs from `/api/dashboard/stats` | 📋 |
| Lead pipeline summary | 📋 |
| Recent bookings table | 📋 |
| Revenue overview | 📋 |

### 3.2 Lead CRM (`app/admin/leads/page.tsx`) 📋

| Task | Status |
|------|--------|
| Pipeline view: New → Qualified → Meeting → Proposal → Negotiation → Won → Lost | 📋 |
| Lead detail panel | 📋 |
| Stage update via API | 📋 |
| Activity timeline | 📋 |
| Assign lead to sales user | 📋 |

### 3.3 Package CMS (`app/admin/packages/page.tsx`) 📋

| Task | Status |
|------|--------|
| List all packages (active + inactive) | 📋 |
| Create/Edit package form | 📋 |
| Tiptap rich text editor for: overview, itinerary, inclusions, exclusions, importantNotes | 📋 |
| Image management (paste public URLs) | 📋 |
| Status toggle (DRAFT/PUBLISHED) | 📋 |
| Preview mode | 📋 |

### 3.4 Tiptap Integration 📋

```tsx
// Rich text editor component
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// Supports: headings, bold, italic, lists, links, images, blockquotes
```

### 3.5 User Management (`app/admin/users/page.tsx`) 📋

| Task | Status |
|------|--------|
| List all users with role badges | 📋 |
| Role change dropdown (SUPER_ADMIN only) | 📋 |
| Activate/deactivate users | 📋 |

### 3.6 New API Routes 📋

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/admin/users` | GET | 📋 |
| `/api/admin/users/[id]/role` | PATCH | 📋 |
| `/api/leads/stats` | GET | 📋 |

**Day 3 Deliverables:**
- [ ] Admin dashboard with real stats
- [ ] Lead CRM with pipeline view
- [ ] Package CMS with Tiptap editor
- [ ] User management page

---

## Phase 4: DAY 4 (June 11) — TBO Integration + Booking Flow

### 4.1 TBO Integration Layer 📋

| Task | Status |
|------|--------|
| Create TBO API proxy routes | 📋 |
| Flight search endpoint | ⏳ Waiting for TBO API credentials |
| Hotel search endpoint | ⏳ Waiting for TBO API credentials |
| Pricing engine (markup rules from DB) | 📋 |

### 4.2 Flight Search (`app/flights/page.tsx`) 📋

| Task | Status |
|------|--------|
| Search form: origin, destination, dates, passengers, trip type | 📋 |
| Results list with airline, price, duration, stops | 📋 |
| Pricing: Published Fare + 2% TDS (retail) | 📋 |
| Pricing: Corporate/Business/First fares (corporate users) | 📋 |
| Select → Checkout flow | 📋 |

### 4.3 Hotel Search (`app/hotels/page.tsx`) 📋

| Task | Status |
|------|--------|
| Search form: location, check-in/out, guests | 📋 |
| Results grid with hotel cards | 📋 |
| Pricing: 22% default markup | 📋 |
| Override hierarchy: Hotel > Destination > Global | 📋 |
| Select → Checkout flow | 📋 |

### 4.4 Plan My Holiday (`app/holidays/page.tsx`) 📋

| Task | Status |
|------|--------|
| Inquiry form (destination, days, inclusions, notes) | 📋 |
| Submit → creates Lead in DB | 📋 |
| Display: "Starting From ₹XX,XXX* Per Person on Twin Sharing Basis" | 📋 |

### 4.5 Booking Flow 📋

| Task | Status |
|------|--------|
| CheckoutModal: details, pricing breakdown, payment method | 📋 |
| Create booking in DB (POST /api/bookings) | 📋 |
| Payment integration | ⏳ Waiting for PhonePe credentials |

### 4.6 Pricing Engine 📋

| Task | Status |
|------|--------|
| Apply PricingRules from DB | 📋 |
| Flight: Published Fare + 2% TDS | 📋 |
| Hotel: markup with override hierarchy | 📋 |
| Package: inquiry only | 📋 |

**Day 4 Deliverables:**
- [ ] TBO integration layer (ready for API keys)
- [ ] Flight search page
- [ ] Hotel search page
- [ ] Plan My Holiday page
- [ ] Booking creation flow
- [ ] Pricing engine

---

## Phase 5: DAY 5 (June 12) — Polish + Launch

### 5.1 Corporate Travel 📋

| Task | Status |
|------|--------|
| Company approval workflow | 📋 |
| Employee invite system | 📋 |
| Corporate wallet management | 📋 |

### 5.2 Cancellation Workflow 📋

| Task | Status |
|------|--------|
| Customer submits cancellation request | 📋 |
| Admin reviews in dashboard | 📋 |
| Process through TBO (manual) | 📋 |

### 5.3 WhatsApp Integration 📋

| Task | Status |
|------|--------|
| WhatsApp Business API integration | ⏳ Waiting for credentials |
| Booking confirmation messages | 📋 |
| Lead notifications | 📋 |

### 5.4 PhonePe Integration 📋

| Task | Status |
|------|--------|
| Replace Razorpay with PhonePe | ⏳ Waiting for credentials |
| Payment verification webhook | 📋 |

### 5.5 Final Polish 📋

| Task | Status |
|------|--------|
| Mobile responsive testing | 📋 |
| Error handling & loading states | 📋 |
| SEO metadata on all pages | 📋 |
| Open Graph tags | 📋 |
| Performance audit | 📋 |

### 5.6 Beta Launch 📋

| Task | Status |
|------|--------|
| Final deployment to Vercel | 📋 |
| Smoke test all flows | 📋 |
| Share with team | 📋 |

**Day 5 Deliverables:**
- [ ] Corporate travel features
- [ ] Cancellation workflow
- [ ] WhatsApp integration (if credentials ready)
- [ ] PhonePe integration (if credentials ready)
- [ ] Final polish and beta launch

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Routing | App Router (not Pages) | Latest Next.js pattern, RSC support |
| Auth | Supabase SSR (`@supabase/ssr`) | Cookie-based, works with middleware |
| State management | React Context + hooks | Simple enough for this scale |
| Rich text | Tiptap | PRD specifies, React-native, extensible |
| Styling | Tailwind CSS (proper config) | Already using, just needs real config |
| API pattern | Next.js Route Handlers | Single backend, no Express needed |
| DB access | Prisma (server-side) | Already have schema, type-safe |
| Images | `next/image` + Unsplash URLs | Auto-optimization, lazy loading |

---

## What We Need From You

| Item | When Needed | Purpose |
|------|-------------|---------|
| Google OAuth Client ID | Day 1 | Supabase Google provider config |
| TBO API credentials | Day 4 | Flight/hotel search |
| PhonePe credentials | Day 5 | Payment processing |
| WhatsApp Business API | Day 5 | Notifications |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 5-day timeline too tight | Medium | High | Focus on core features, defer nice-to-haves |
| TBO API not ready by Day 4 | Medium | Medium | Use static JSON as fallback, build UI first |
| PhonePe not ready by Day 5 | Medium | Medium | Keep Razorpay test mode as fallback |
| Google OAuth config issues | Low | Medium | Supabase MCP handles most of it |
| Next.js learning curve | Low | Low | Components are standard React, minimal change |

---

## Files to Delete (After Migration)

| File/Directory | Reason |
|----------------|--------|
| `packages/frontend/` | Replaced by Next.js `app/` |
| `packages/backend/` | Replaced by Next.js `api/` |
| `api/` (Vercel functions) | Replaced by Next.js `api/` |
| `vercel.json` | Next.js auto-configures |

---

## Sprint Summary

| Phase | Days | Focus | Status |
|-------|------|-------|--------|
| Phase 0 | Pre-sprint | Foundation, DB, basic API | ✅ DONE |
| Phase 1 | Day 1 (June 8) | Next.js + Auth + Google OAuth | 📋 PLANNED |
| Phase 2 | Day 2 (June 9) | Homepage + Core Pages | 📋 PLANNED |
| Phase 3 | Day 3 (June 10) | Admin Dashboard + Package CMS | 📋 PLANNED |
| Phase 4 | Day 4 (June 11) | TBO Integration + Booking Flow | 📋 PLANNED |
| Phase 5 | Day 5 (June 12) | Polish + Launch | 📋 PLANNED |

---

*Last updated: June 7, 2026*
*Next review: After Day 1 completion*
