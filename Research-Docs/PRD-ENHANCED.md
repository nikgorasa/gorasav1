# GoRASA — Enhanced Product Requirement Document

> **Version:** 2.0 — Seasoned PM Perspective
> **Date:** 2026-06-11
> **Author:** Product Strategy Team
> **Status:** Living Document — Updated after each sprint

---

## Executive Summary

**GoRASA** is a luxury travel platform targeting affluent Indian travelers, built on modern web technologies (Next.js 16, React 19, Supabase, TBO API). The platform differentiates through AI-first concierge services, curated luxury experiences, and WhatsApp-style communication.

**Current State:** Internal Beta — Flight and Hotel search live with real TBO API. Pricing engine and payment gateway not yet implemented.

**Vision:** Become the "Apple of Travel" — premium, curated, effortless.

---

## 1. Product Vision & Strategy

### 1.1 Vision Statement

> "Make luxury travel effortless for Indian professionals — from dream to destination, powered by AI."

### 1.2 Strategic Pillars

| Pillar | Description | Competitive Moat |
|--------|-------------|------------------|
| **AI-First** | LLM-powered concierge that understands context | No competitor has this |
| **Luxury Positioning** | Curated experiences, not commodity travel | Higher margins, loyal customers |
| **WhatsApp-Native** | Familiar UX for Indian users | Lower friction than apps |
| **Corporate B2B** | Integrated wallet + negotiated rates | Sticky, high-value customers |

### 1.3 Target Segments

| Segment | Profile | Needs | Revenue Potential |
|---------|---------|-------|-------------------|
| **Primary** | Indian professionals, 28-45, ₹20L+ income | Premium experiences, time-saving | High |
| **Secondary** | Corporate travel managers | Policy compliance, cost control | Very High |
| **Tertiary** | NRI/OCI travelers visiting India | Authentic luxury, family packages | Medium |

---

## 2. User Stories & Jobs-to-be-Done

### 2.1 Core User Stories

#### Discovery Phase
```
As a busy professional,
I want to discover curated travel experiences
So that I can plan a memorable vacation without spending hours researching.
```

**Acceptance Criteria:**
- [ ] User can search by destination, dates, and preferences
- [ ] Results show curated options with clear value proposition
- [ ] AI suggests personalized recommendations based on profile

#### Search & Compare Phase
```
As a traveler comparing options,
I want to see transparent pricing with all fees included
So that I can make an informed decision without surprises at checkout.
```

**Acceptance Criteria:**
- [ ] All prices include taxes and service fees
- [ ] Price breakdown shows base rate, markup, and taxes separately
- [ ] Can compare 2-3 options side by side
- [ ] Filters for price range, star rating, amenities

#### Booking Phase
```
As a ready-to-book traveler,
I want a seamless checkout with familiar payment methods
So that I can complete my booking in under 2 minutes.
```

**Acceptance Criteria:**
- [ ] Guest details pre-filled from profile
- [ ] Multiple payment options (UPI, cards, wallets)
- [ ] Promo code field with instant validation
- [ ] Loyalty points redemption option
- [ ] Clear cancellation policy displayed

#### Post-Booking Phase
```
As a booked traveler,
I want instant confirmation and easy access to my itinerary
So that I feel confident about my booking and can plan accordingly.
```

**Acceptance Criteria:**
- [ ] Email confirmation within 30 seconds
- [ ] WhatsApp notification with booking details
- [ ] Boarding pass / hotel voucher downloadable
- [ ] Trip appears in "My Trips" immediately

---

## 3. Feature Requirements

### 3.1 Pricing Engine (P0 — Revenue Blocker)

**Problem:** Prices pass through from TBO with no markup. No revenue generation.

**Solution:** Implement `PricingService` that applies rules from `PricingRule` table.

#### Pricing Pipeline
```
TBO Base Rate
    ↓
PricingService.calculate()
    ↓
┌─────────────────────────────────────┐
│ 1. Lookup PricingRule (by destination, hotel, product type) │
│ 2. Apply markup (percentage or flat) │
│ 3. Apply corporate discount (if B2B) │
│ 4. Apply promo code (if valid) │
│ 5. Apply loyalty redemption (if requested) │
│ 6. Calculate GST (5% for hotels, varies for flights) │
│ 7. Return price breakdown │
└─────────────────────────────────────┘
    ↓
Display to User
```

#### Database Schema (Already Exists)
```sql
-- PricingRule table (5 rows seeded)
CREATE TABLE "PricingRule" (
  id TEXT PRIMARY KEY,
  type TEXT, -- 'HOTEL_MARKUP', 'FLIGHT_TDS'
  destination TEXT, -- 'Goa', 'Kerala', etc.
  hotelName TEXT, -- Specific hotel (optional)
  markupPercent FLOAT, -- 22.0 for Goa
  isActive BOOLEAN DEFAULT true
);

-- PromoCode table (4 rows)
CREATE TABLE "PromoCode" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE, -- 'WELCOME20'
  discountValue FLOAT, -- 20.0
  type TEXT, -- 'flat' or 'percent'
  minBookingValue FLOAT, -- 5000.0
  isActive BOOLEAN DEFAULT true
);
```

#### Implementation Priority
| Phase | What | Effort | Impact |
|-------|------|--------|--------|
| P0-1 | Markup engine (query PricingRule, apply to search results) | 2 days | Revenue |
| P0-2 | Promo code validation + application | 1 day | Conversion |
| P0-3 | Price breakdown display in UI | 1 day | Transparency |
| P0-4 | Corporate discount integration | 1 day | B2B revenue |

---

### 3.2 Payment Gateway (P0 — Booking Blocker)

**Problem:** Users can search but can't actually pay. No booking completion.

**Solution:** Integrate PhonePe / Razorpay for Indian payments.

#### Payment Flow
```
User clicks "Pay Now"
    ↓
Create payment order (amount, currency, receipt)
    ↓
Redirect to PhonePe / Razorpay checkout
    ↓
User completes payment
    ↓
Webhook confirms payment
    ↓
Update booking status to "Confirmed"
    ↓
Send confirmation email + WhatsApp
```

#### Implementation Priority
| Phase | What | Effort | Impact |
|-------|------|--------|--------|
| P0-1 | Razorpay integration (test mode) | 3 days | Foundation |
| P0-2 | Payment order creation API | 1 day | Backend |
| P0-3 | Webhook handling + booking update | 1 day | Reliability |
| P0-4 | Payment success/failure UI | 1 day | UX |
| P0-5 | Production credentials + go-live | 1 day | Launch |

---

### 3.3 AI Concierge (P1 — Differentiation)

**Problem:** Current support is keyword-based. No real intelligence.

**Solution:** LLM-powered concierge that understands context and assists with bookings.

#### AI Capabilities
| Capability | Description | Priority |
|------------|-------------|----------|
| **Context-Aware** | Remembers user preferences, past trips | P1 |
| **Proactive** | Suggests destinations based on season, budget | P1 |
| **Conversational** | Natural language booking assistance | P1 |
| **Multi-Language** | Hindi, Tamil, Telugu support | P2 |
| **Voice** | Speech-to-text for hands-free | P3 |

#### AI Architecture
```
User Message
    ↓
Context Manager (user profile, trip history, preferences)
    ↓
LLM (GPT-4 / Claude)
    ↓
Tool Router (search, book, cancel, modify)
    ↓
Response Generator
    ↓
WhatsApp / Web Chat
```

---

### 3.4 Search Filters (P1 — UX Improvement)

**Problem:** No way to narrow down search results. Users must scroll through everything.

**Solution:** Add filters for price range, star rating, amenities, etc.

#### Hotel Filters
| Filter | Type | Options |
|--------|------|---------|
| Price Range | Slider | ₹0 - ₹50,000+ |
| Star Rating | Multi-select | 3★, 4★, 5★ |
| Amenities | Multi-select | WiFi, Pool, Spa, Restaurant |
| Property Type | Multi-select | Hotel, Resort, Villa, Homestay |
| Cancellation | Toggle | Free cancellation only |
| Meal Plan | Multi-select | Room Only, Breakfast, Half Board, Full Board |

#### Flight Filters
| Filter | Type | Options |
|--------|------|---------|
| Price Range | Slider | ₹0 - ₹50,000+ |
| Stops | Multi-select | Non-stop, 1 stop, 2+ stops |
| Airlines | Multi-select | IndiGo, SpiceJet, Air India, etc. |
| Departure Time | Multi-select | Morning, Afternoon, Evening, Night |
| Duration | Slider | 0 - 24 hours |

---

### 3.5 SEO & Content Marketing (P1 — Growth)

**Problem:** No organic discovery. Users can't find GoRASA via search.

**Solution:** SSR for key pages + content marketing strategy.

#### SEO Strategy
| Page | Strategy | Priority |
|------|----------|----------|
| Homepage | SSR + structured data | P1 |
| Destination pages | `/goa-hotels`, `/mumbai-flights` | P1 |
| Blog | Travel guides, tips, experiences | P2 |
| Package pages | `/luxury-maldives-package` | P1 |

#### Content Calendar
| Week | Content | Channel |
|------|---------|---------|
| 1 | "Top 10 Luxury Hotels in Goa" | Blog + LinkedIn |
| 2 | "Best Time to Visit Kerala" | Blog + Instagram |
| 3 | "Corporate Travel Guide for India" | Blog + Email |
| 4 | "Hidden Gems of Rajasthan" | Blog + YouTube |

---

## 4. Technical Requirements

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 16 + React 19 + Tailwind 4 + Motion               │
├─────────────────────────────────────────────────────────────┤
│                        API LAYER                             │
│  /api/flights  /api/tbo-hotels  /api/bookings  /api/payments│
├─────────────────────────────────────────────────────────────┤
│                      SERVICES                                │
│  PricingService  PaymentService  NotificationService  AI    │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  Supabase (PostgreSQL) + Prisma + Redis (future)            │
├─────────────────────────────────────────────────────────────┤
│                      EXTERNAL APIs                           │
│  TBO (Flights + Hotels)  Razorpay  WhatsApp  OpenAI         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| Page Load (LCP) | < 2.5s | ~3.5s |
| Search Response | < 3s | ~4s |
| Time to Interactive | < 3.5s | ~5s |
| Lighthouse Score | > 90 | ~75 |

### 4.3 Security Requirements

| Requirement | Status | Priority |
|-------------|--------|----------|
| API route authentication | ❌ Missing | Critical |
| Rate limiting | ❌ Missing | High |
| Input validation | ⚠️ Partial | High |
| CORS configuration | ✅ Done | — |
| Environment variable security | ✅ Done | — |

---

## 5. Success Metrics & KPIs

### 5.1 Business Metrics

| Metric | Target (3 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Monthly Active Users | 1,000 | 50,000 |
| Bookings per Month | 50 | 2,000 |
| Average Order Value | ₹25,000 | ₹35,000 |
| Conversion Rate | 2% | 4% |
| Customer Acquisition Cost | ₹500 | ₹300 |
| Revenue per User | ₹2,000 | ₹5,000 |

### 5.2 Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search-to-Book Rate | > 5% | Funnel analytics |
| Time to Book | < 3 minutes | Session duration |
| Return User Rate | > 30% | 30-day cohort |
| NPS Score | > 50 | Post-trip survey |
| Support Ticket Rate | < 5% | Per booking |

### 5.3 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Status page |
| Error Rate | < 0.1% | Sentry |
| API Response Time | < 500ms (p95) | Monitoring |
| Build Time | < 2 minutes | CI/CD |

---

## 6. Competitive Analysis

### 6.1 Feature Comparison

| Feature | GoRASA | MakeMyTrip | Booking.com | Cleartrip | Airbnb |
|---------|--------|------------|-------------|-----------|--------|
| **AI Concierge** | ✅ (Planned) | ❌ | ❌ | ❌ | ❌ |
| **Flight Search** | ✅ Live | ✅ | ✅ | ✅ | ❌ |
| **Hotel Search** | ✅ Live | ✅ | ✅ | ✅ | ✅ |
| **Packages** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Corporate B2B** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Loyalty Program** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **WhatsApp** | ✅ (Planned) | ✅ | ✅ | ✅ | ❌ |
| **Voice** | ✅ (Planned) | ❌ | ❌ | ❌ | ❌ |
| **Multi-Language** | ✅ (Planned) | ✅ | ✅ | ✅ | ✅ |

### 6.2 Pricing Comparison

| OTA | Hotel Markup | Flight Markup | Service Fee |
|-----|--------------|---------------|-------------|
| **GoRASA** | 18-25% | 3-5% | ₹0 |
| MakeMyTrip | 12-25% | 2-5% | ₹0-200 |
| Booking.com | 15-25% (commission) | N/A | ₹0 |
| Cleartrip | 10-20% | 2-4% | ₹0 |
| Goibibo | 10-15% | 1-3% | ₹0 |

### 6.3 Unique Value Propositions

1. **AI-First Experience** — No competitor has LLM-powered booking assistance
2. **Luxury Positioning** — Curated experiences, not commodity travel
3. **WhatsApp-Native** — Familiar UX for Indian users
4. **Integrated B2B** — Corporate wallet + negotiated rates in one platform
5. **Indian Market Focus** — 1,083 cities, Hindi support, local payments

---

## 7. Roadmap

### Phase 1: Revenue Foundation (Weeks 1-2)
- [ ] Pricing engine (PricingService)
- [ ] Payment gateway (Razorpay)
- [ ] Checkout flow
- [ ] Email notifications

### Phase 2: Growth Engine (Weeks 3-4)
- [ ] SEO (SSR for key pages)
- [ ] Content marketing launch
- [ ] Referral program
- [ ] Search filters

### Phase 3: Differentiation (Weeks 5-6)
- [ ] AI concierge (LLM integration)
- [ ] WhatsApp notifications
- [ ] Multi-language support (Hindi)
- [ ] Mobile PWA

### Phase 4: Optimization (Weeks 7-8)
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Performance optimization
- [ ] Security hardening

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **No revenue without payment** | High | Critical | Prioritize Razorpay integration |
| **TBO credential expiry** | Medium | High | Get production credentials |
| **Security breach (no auth)** | Medium | Critical | Add auth to all API routes |
| **Competitor launches AI** | Medium | Medium | Accelerate LLM integration |
| **User churn (no mobile)** | High | Medium | Build PWA |

---

## 9. Dependencies

### External Dependencies
| Dependency | Status | Blocker |
|------------|--------|---------|
| TBO Production Credentials | ⚠️ Test only | Hotel booking |
| Razorpay Account | ❌ Not created | Payment gateway |
| OpenAI API Key | ❌ Not configured | AI concierge |
| WhatsApp Business API | ❌ Not configured | Notifications |
| Google OAuth Client ID | ❌ Not configured | User signup |

### Internal Dependencies
| Dependency | Status | Blocker |
|------------|--------|---------|
| PricingService | ❌ Not built | Revenue |
| Auth middleware | ❌ Not built | Security |
| Error monitoring | ❌ Not configured | Observability |
| CI/CD pipeline | ❌ Not configured | Deployment |

---

## 10. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **TBO** | Travel Boutiques Online — Flight and Hotel API provider |
| **Markup** | Percentage added to base rate for revenue |
| **Commission** | Percentage paid by supplier to OTA |
| **PreBook** | TBO's availability check before booking |
| **PublishedFare** | Fare displayed to user (before discounts) |
| **OfferedFare** | Fare after supplier discount |

### B. References

1. Marty Cagan, "Inspired: How to Create Tech Products Customers Love" (SVPG, 2020)
2. Travel Agency Pricing Models (Wikipedia, 2026)
3. GoRASA Codebase Analysis (Internal, 2026)
4. TBO API Documentation (Internal, 2026)
5. Research Brief: Travel Pricing Engine (Internal, 2026)
6. Research Brief: PRD Best Practices (Internal, 2026)

---

*This is a living document. Updated after each sprint review.*
