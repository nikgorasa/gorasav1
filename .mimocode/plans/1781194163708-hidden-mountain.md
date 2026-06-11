# Pricing Module Implementation Plan for GoRASA

## Problem Statement

GoRASA currently has **zero pricing logic** despite having a `PricingRule` table with 5 seeded rules. Hotel markups are hardcoded at `* 1.2` for strikethrough only — users see raw TBO cost prices. Flight fares pass through untouched. No promo code validation at checkout. GST is hardcoded at 5% for all services. The booking API accepts any client-supplied price without server-side validation.

## Recommended Architecture

**Pattern A: Simple Markup Table** — single `PricingRule` table with hierarchical resolution, applied at search time. Promo/corporate/loyalty discounts applied at checkout.

### Pricing Pipeline

```
TBO Base Rate
  → Markup Engine (PricingRule lookup by priority)
  → Displayed Price (what user sees)
  → [At Checkout] Promo Code → Corporate Discount → Loyalty Points → Final Price
  → GST (dynamic: 5% hotels, 18% flights)
```

---

## Implementation Phases

### Phase 1: Foundation — Markup Engine (P0, ~3-4 days)

#### 1.1 Enhanced PricingRule Schema

**File:** `gorasa-next/prisma/schema.prisma`

Replace current minimal PricingRule model:

```prisma
model PricingRule {
  id            String   @id @default(cuid())
  name          String                              // "Goa Hotel Markup"
  type          String                              // "GLOBAL", "CATEGORY", "DESTINATION", "HOTEL"
  category      String                              // "HOTEL", "FLIGHT", "PACKAGE"
  destination   String?                             // "Goa", null = all
  hotelName     String?                             // Specific hotel, null = all
  airlineCode   String?                             // "6E", "AI", null = all
  roomType      String?                             // "DELUXE", "SUITE", null = all
  markupType    String   @default("PERCENT")        // "PERCENT" or "FLAT"
  markupValue   Float                               // 15.00 (% or ₹)
  minPrice      Float?                              // Floor price
  maxPrice      Float?                              // Ceiling price
  priority      Int      @default(0)                // Higher = wins
  isActive      Boolean  @default(true)
  validFrom     DateTime?                           // Promo start
  validTo       DateTime?                           // Promo end
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Migration:** Add new columns, migrate existing 5 seeded rules, drop old `markupPercent` column.

#### 1.2 PricingService

**New file:** `gorasa-next/src/lib/pricing-service.ts`

```typescript
export interface PricingContext {
  category: "HOTEL" | "FLIGHT" | "PACKAGE";
  destination?: string;
  hotelName?: string;
  airlineCode?: string;
  roomType?: string;
}

export interface PricingResult {
  baseRate: number;
  markupAmount: number;
  displayedPrice: number;
  originalPrice: number;       // For strikethrough
  appliedRules: string[];      // Audit trail
  currency: string;
}

export async function calculatePrice(
  baseRate: number,
  context: PricingContext,
  currency?: string
): Promise<PricingResult>
```

Logic:
1. Fetch all active rules from Supabase, ordered by `priority` DESC
2. Find most-specific matching rule (iterate: category → destination → hotel/airline → room)
3. Calculate markup (PERCENT or FLAT), apply min/max constraints
4. `displayedPrice = baseRate + markupAmount`
5. `originalPrice = baseRate + markupAmount * 1.3` (30% higher for strikethrough)
6. Convert currency if needed (INR base + static rates)

#### 1.3 Integrate into Hotel Client

**File:** `gorasa-next/src/lib/tbo-hotel-client.ts`

Modify `toDisplay()` function (lines 19-82):
- Replace hardcoded `originalPrice: minFare * 1.2` with PricingService result
- Apply markup to `totalFare` and `minTotalFare`
- Pass pricing context (destination, hotelName) from `_hotelDetailsCache`

#### 1.4 Integrate into Flight Client

**File:** `gorasa-next/src/lib/tbo-flight-client.ts`

Modify `toDisplay()` function (lines 50-81):
- Apply PricingService to `publishedFare` and `offeredFare`
- Use `commissionEarned` from TBO as floor for markup calculation
- Pass pricing context (airlineCode from segments)

#### 1.5 Seed Default Rules

Create migration seed:
- `GLOBAL_HOTEL`: PERCENT 15%, priority 0
- `GLOBAL_FLIGHT`: FLAT ₹500, priority 0
- `GOA_HOTEL`: PERCENT 22%, priority 10 (overrides global for Goa)
- `PREMIUM_HOTEL`: PERCENT 25%, priority 20 (for 4-5 star hotels)

---

### Phase 2: Promo Code & Checkout (P1, ~2-3 days)

#### 2.1 Enhanced PromoCode Schema

**File:** `gorasa-next/prisma/schema.prisma`

Add fields to existing PromoCode (already in Supabase):
- `maxDiscount Float?` — cap for percentage discounts
- `applicableTo String @default("ALL")` — "ALL", "HOTEL", "FLIGHT", "PACKAGE"
- `isFirstBooking Boolean @default(false)`
- `maxUses Int?` — total usage limit
- `usedCount Int @default(0)` — current usage
- `validFrom DateTime?`
- `validTo DateTime?`

#### 2.2 Promo Validation Service

**New file:** `gorasa-next/src/lib/promo-service.ts`

```typescript
export async function applyPromoCode(
  code: string,
  bookingAmount: number,
  category: string,
  userId: string
): Promise<{ valid: boolean; discountAmount: number; finalPrice: number; error?: string }>
```

Checks: validity → expiry → usage limit → min booking value → category applicability → first-booking restriction → calculate discount → increment usage.

#### 2.3 Corporate Rate Service

**New file:** `gorasa-next/src/lib/corporate-service.ts`

```typescript
export async function getCorporateDiscount(
  companyId: string,
  category: string,
  destination?: string
): Promise<{ discountType: string; discountValue: number; maxDiscount?: number } | null>
```

#### 2.4 Enhanced Booking API

**File:** `gorasa-next/src/app/api/bookings/route.ts`

POST handler changes:
- Accept `promoCode` and `loyaltyPointsRedeemed` in request body
- **Recalculate price server-side** using PricingService (don't trust client price)
- Apply promo code validation
- Apply corporate discount if user has companyId
- Apply loyalty points deduction
- Calculate GST dynamically (5% hotels, 18% flights)
- Store full price breakdown in Booking record

#### 2.5 InvoiceModal Update

**File:** `gorasa-next/src/components/InvoiceModal.tsx`

- Dynamic GST: 5% for HOTEL, 18% for FLIGHT
- Show promo code discount line
- Show loyalty points deduction line
- Show corporate discount line (if applicable)

---

### Phase 3: Admin & Operations (P2, ~2-3 days)

#### 3.1 Pricing Rules Admin Page

**New file:** `gorasa-next/src/app/admin/pricing/page.tsx`

- CRUD interface for PricingRule records
- Table view with filters (category, destination, active status)
- Create/Edit modal with all fields
- Bulk enable/disable toggle
- Usage analytics (how many bookings used each rule)

#### 3.2 Pricing Audit Log

**New file:** `gorasa-next/prisma/schema.prisma` addition

```prisma
model PricingAuditLog {
  id            String   @id @default(cuid())
  bookingId     String?
  category      String
  destination   String?
  baseRate      Float
  markupAmount  Float
  displayedPrice Float
  appliedRules  String   @default("[]")   // JSON array of rule names
  promoCode     String?
  promoDiscount Float?
  loyaltyPoints Int?
  corporateDiscount Float?
  gstAmount     Float
  finalPrice    Float
  createdAt     DateTime @default(now())
}
```

#### 3.3 Enhanced Admin Promo Page

**File:** `gorasa-next/src/app/admin/promos/page.tsx`

- Add usage stats display (usedCount / maxUses)
- Add validity period fields
- Add category filter display

---

### Phase 4: Advanced (P3, ~3-5 days, future)

- Dynamic pricing (time/demand-based adjustments)
- Multi-currency support (INR base + live conversion)
- A/B testing framework for markup percentages
- Price lock feature (hold price for 15 min)
- Competitor price monitoring

---

## Files to Create

| File | Purpose |
|------|---------|
| `gorasa-next/src/lib/pricing-service.ts` | Core pricing engine — `calculatePrice()` |
| `gorasa-next/src/lib/promo-service.ts` | Promo code validation and application |
| `gorasa-next/src/lib/corporate-service.ts` | Corporate rate lookup |
| `gorasa-next/src/app/admin/pricing/page.tsx` | Admin UI for pricing rules |
| `gorasa-next/prisma/migrations/XXXX-enhance-pricing-rule/migration.sql` | Schema migration |

## Files to Modify

| File | Change |
|------|--------|
| `gorasa-next/prisma/schema.prisma` | Enhance PricingRule, add PricingAuditLog |
| `gorasa-next/src/lib/tbo-hotel-client.ts` | Wire PricingService into `toDisplay()` |
| `gorasa-next/src/lib/tbo-flight-client.ts` | Wire PricingService into `toDisplay()` |
| `gorasa-next/src/app/api/bookings/route.ts` | Server-side pricing, promo, GST |
| `gorasa-next/src/app/api/tbo-hotels/route.ts` | Pass pricing context |
| `gorasa-next/src/app/api/tbo/route.ts` | Pass pricing context |
| `gorasa-next/src/components/InvoiceModal.tsx` | Dynamic GST, full price breakdown |
| `gorasa-next/src/app/api/promos/route.ts` | Enhanced validation |
| `gorasa-next/src/app/admin/layout.tsx` | Add pricing nav item |

## Verification

1. **TypeScript**: `npx tsc --noEmit` in `gorasa-next/` — must pass
2. **Search test**: Search hotels for Goa → verify markup applied (price > TBO base rate)
3. **Search test**: Search flights → verify markup applied
4. **Promo test**: Create promo via admin, apply at booking → verify discount
5. **Invoice test**: Generate invoice for hotel → verify 5% GST; flight → verify 18% GST
6. **Admin test**: Create/edit/delete pricing rules via admin UI
7. **Fallback test**: If PricingService fails, show base rate (don't block booking)

## Risk Mitigation

- **Fallback on pricing failure**: If Supabase is down or pricing service errors, pass through TBO base rate unchanged. Log warning.
- **Backward compatibility**: Existing bookings with `originalPrice` null will still display correctly (InvoiceModal handles this).
- **Migration safety**: New columns are nullable or have defaults. Existing data preserved.
