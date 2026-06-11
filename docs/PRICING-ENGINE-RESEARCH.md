# Travel Pricing Engine Research — GoRASA

> **Date:** June 11, 2026  
> **Purpose:** How OTAs implement pricing layers on top of base API rates  
> **Context:** TBO gives base rates; GoRASA needs markup, margins, promotions, discounts

---

## 1. Current State in GoRASA

| What | Status | Evidence |
|------|--------|----------|
| `PricingRule` DB model | EXISTS, seeded with 5 rules | `prisma/schema.prisma:96-105`, `seed.ts:429-445` |
| `PricingRule` lookup | **NEVER USED** in runtime | No code queries this table |
| Hotel markup | **NOT APPLIED** | `tbo-hotel-client.ts:80` — hardcoded `* 1.2` for display only |
| Flight markup | **NOT APPLIED** | `tbo-flight-client.ts` — fares pass through as-is |
| Promo code CRUD | EXISTS | `api/promos/route.ts` |
| Promo code application | **NEVER IMPLEMENTED** | No validation/apply logic |
| Corporate `discountRate` | Displayed in admin, **never applied** | `admin/b2b/page.tsx:105` |
| "22% markup" text | **UI placeholder only** | `hotels/page.tsx:214` |
| GST calculation | Fixed 5% (only runtime pricing math) | `InvoiceModal.tsx:37` |

**Bottom line:** The data model and admin UI exist, but the actual price transformation pipeline is not built.

---

## 2. How OTAs Do It — Industry Patterns

### 2.1 Revenue Models

| Model | How It Works | Who Uses It |
|-------|-------------|-------------|
| **Markup on Base Rate** | Add X% or flat ₹ amount on top of supplier rate | MakeMyTrip, Cleartrip, Yatra |
| **Commission from Supplier** | Supplier pays OTA 10-25% commission on each booking | Booking.com, Expedia, Hotels.com |
| **Service Fee to Customer** | Charge customer a convenience/booking fee | Skyscanner (redirect), some agents |
| **Hybrid** | Markup + commission + service fee | Most large OTAs |
| **Rate Parity + Hidden Margin** | Show same price as supplier, earn via commission | Agoda, some GDS agents |

### 2.2 Pricing Engine Architecture (Industry Standard)

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRICING PIPELINE                             │
│                                                                  │
│  TBO/Supplier API                                                │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐                                                │
│  │ Base Rate   │  ← Raw rate from supplier (e.g., ₹5,000/night)│
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Markup      │  ← Global markup (e.g., +15%)                  │
│  │ Engine      │  → Category markup (e.g., Premium hotels +5%)  │
│  └──────┬──────┘  → Destination markup (e.g., Goa +3%)         │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Dynamic     │  ← Time-based (peak season, last-minute)       │
│  │ Pricing     │  ← Demand-based (occupancy %)                  │
│  └──────┬──────┘  ← Competitor-based                            │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Corporate   │  ← Company-specific negotiated rates            │
│  │ / B2B Rate  │  → Volume discounts                             │
│  └──────┬──────┘  → Wallet deductions                            │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Displayed   │  ← Price user sees                              │
│  │ Price       │  → "Starting from ₹X,XXX"                      │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼  (at checkout)                                         │
│  ┌─────────────┐                                                │
│  │ Promo Code  │  ← Coupon discount (flat or %)                  │
│  │ / Discount  │  → Minimum booking value check                  │
│  └──────┬──────┘  → Validity check (expiry, usage limit)        │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Loyalty     │  ← Points redemption (1 point = ₹1)            │
│  │ / Wallet    │  → Corporate wallet deduction                   │
│  └──────┬──────┘  → Cashback credits                             │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Final Price │  ← Amount charged to user                       │
│  │ + GST       │  → GST breakdown (5% CGST + 5% SGST)          │
│  └─────────────┘  → Invoice generation                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Pricing Rule Hierarchy (What Big OTAs Use)

```
Global Rules (applies to everything)
  └── Category Rules (Hotels, Flights, Packages)
        └── Destination Rules (Goa, Kerala, Rajasthan)
              └── Supplier/Hotel Rules (Specific hotel or airline)
                    └── Room/Fare Class Rules (Deluxe, Suite, Economy, Business)
```

**Priority:** Most specific rule wins. If a hotel-specific rule exists, it overrides the destination rule, which overrides the category rule, which overrides the global rule.

### 2.4 Database Schema Patterns

#### Pattern A: Simple Markup Table (Small OTAs)

```sql
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY,
  type VARCHAR(50),          -- 'GLOBAL', 'CATEGORY', 'DESTINATION', 'HOTEL'
  category VARCHAR(50),      -- 'HOTEL', 'FLIGHT', 'PACKAGE'
  destination VARCHAR(100),  -- 'Goa', 'Kerala', NULL (all)
  hotel_name VARCHAR(200),   -- Specific hotel, NULL (all)
  markup_type VARCHAR(20),   -- 'PERCENT' or 'FLAT'
  markup_value DECIMAL(10,2), -- 15.00 (% or ₹ amount)
  min_price DECIMAL(10,2),   -- Floor price (don't go below this)
  max_price DECIMAL(10,2),   -- Ceiling price (don't go above this)
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,    -- Higher = wins conflicts
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Pattern B: Multi-Layer Pricing Table (Large OTAs)

```sql
-- Separate tables for each pricing layer
CREATE TABLE markup_rules (...);      -- Base markup
CREATE TABLE dynamic_pricing (...);   -- Time/demand adjustments
CREATE TABLE promo_codes (...);       -- Promotions
CREATE TABLE corporate_rates (...);   -- B2B negotiated rates
CREATE TABLE loyalty_rules (...);     -- Points/cashback
CREATE TABLE pricing_audit (...);     -- Price change history
```

#### Pattern C: Rule Engine (Enterprise)

```sql
-- Flexible rule conditions stored as JSON
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  conditions JSONB,  -- {"destination": "Goa", "season": "peak", "daysBeforeDeparture": {"lt": 7}}
  action JSONB,      -- {"type": "MULTIPLY", "value": 1.15}
  priority INT,
  is_active BOOLEAN
);
```

### 2.5 How Specific Companies Do It

#### MakeMyTrip / Goibibo
- **Markup:** 12-25% on hotel base rates (varies by destination)
- **Dynamic:** Prices change based on search frequency, time of day, device (mobile gets 2-3% discount)
- **Promotions:** "MMTBLACK" (loyalty), bank offers (10% instant discount), flash sales
- **Corporate:** Separate portal with negotiated rates (8-15% below public)

#### Cleartrip
- **Markup:** 10-20% on hotels, fixed service fee on flights
- **Dynamic:** Real-time competitor price matching
- **Promotions:** "CTFIRST" (first booking), bank partnerships
- **Corporate:** Cleartrip for Work — company wallet + negotiated rates

#### Booking.com
- **Commission Model:** 15-25% commission from hotels (not markup)
- ** Genius Program:** 10-20% discount for loyalty members (funded by commission)
- **Mobile-only deals:** Additional 5-10% off for app users

#### Expedia / Hotels.com
- **Opaque Pricing:** "Secret Prices" for members
- **Bundle Discount:** Flight+Hotel 10-15% cheaper than separate
- **Rewards:** Hotels.com "10 nights = 1 free" (commission-based)

---

## 3. Recommended Approach for GoRASA

### 3.1 Architecture: Pricing Middleware

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  TBO Hotel API ──┐                                               │
│                  ├──→ PricingService.applyPricing() ──→ Frontend │
│  TBO Flight API ─┘                                               │
│                                                                  │
│  PricingService:                                                 │
│    1. Fetch base rate from TBO response                          │
│    2. Query PricingRule table (cascading lookup)                 │
│    3. Apply markup (percent or flat)                             │
│    4. Apply dynamic adjustments (if enabled)                     │
│    5. Apply corporate rate (if user is CORPORATE_USER)           │
│    6. Return displayed price + original price                    │
│                                                                  │
│  At Checkout:                                                    │
│    7. Apply promo code (validate + discount)                     │
│    8. Apply loyalty points redemption                            │
│    9. Apply corporate wallet deduction                           │
│   10. Calculate GST                                              │
│   11. Return final amount + save booking                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema (Recommended)

```prisma
// Enhanced PricingRule - replaces current simple model
model PricingRule {
  id            String   @id @default(cuid())
  name          String                              // "Goa Hotel Markup"
  type          String                              // "GLOBAL", "CATEGORY", "DESTINATION", "HOTEL"
  category      String                              // "HOTEL", "FLIGHT", "PACKAGE"
  destination   String?                             // "Goa", null = all destinations
  hotelName     String?                             // Specific hotel name, null = all
  airlineCode   String?                             // "6E", "AI", null = all airlines
  roomType      String?                             // "DELUXE", "SUITE", null = all
  markupType    String   @default("PERCENT")        // "PERCENT" or "FLAT"
  markupValue   Float                               // 15.00 (% or ₹)
  minPrice      Float?                              // Floor price
  maxPrice      Float?                              // Ceiling price
  priority      Int      @default(0)                // Higher wins
  isActive      Boolean  @default(true)
  validFrom     DateTime?                           // Promo start date
  validTo       DateTime?                           // Promo end date
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// New: PromoCode with validation rules
model PromoCode {
  id              String   @id @default(cuid())
  code            String   @unique                  // "GORASA10", "FIRST500"
  description     String?
  discountType    String                              // "FLAT" or "PERCENT"
  discountValue   Float                               // 500 (flat) or 10 (%)
  maxDiscount     Float?                              // Cap for percentage discounts
  minBookingValue Float?                              // Minimum ₹ to apply
  maxUses         Int?                                // Total usage limit
  usedCount       Int      @default(0)               // Current usage
  applicableTo    String   @default("ALL")           // "ALL", "HOTEL", "FLIGHT", "PACKAGE"
  isFirstBooking  Boolean  @default(false)           // Only for first-time bookers
  isActive        Boolean  @default(true)
  validFrom       DateTime?
  validTo         DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// New: CorporateRate (per-company negotiated rates)
model CorporateRate {
  id            String   @id @default(cuid())
  companyId     String
  company       Company @relation(fields: [companyId], references: [id])
  category      String                              // "HOTEL", "FLIGHT", "PACKAGE"
  destination   String?                             // null = all destinations
  discountType  String                              // "FLAT" or "PERCENT"
  discountValue Float                               // 10.00 (% or ₹)
  maxDiscount   Float?                              // Cap
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Enhanced Company (add wallet fields)
model Company {
  id              String   @id @default(cuid())
  name            String
  domain          String?
  walletBalance   Float    @default(0)
  discountRate    Float    @default(0)              // Legacy: global discount %
  isActive        Boolean  @default(true)
  approvedBy      String?
  employees       User[]
  corporateRates  CorporateRate[]                   // NEW: per-category rates
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 3.3 Pricing Service Implementation

```typescript
// src/lib/pricing-service.ts

import { createClient } from "@/lib/supabase-admin";

interface PricingContext {
  category: "HOTEL" | "FLIGHT" | "PACKAGE";
  destination?: string;
  hotelName?: string;
  airlineCode?: string;
  roomType?: string;
  companyId?: string;
}

interface PricingResult {
  baseRate: number;           // TBO/supplier rate
  markupAmount: number;       // ₹ markup applied
  displayedPrice: number;     // Price shown to user
  originalPrice: number;      // Strikethrough price (base + higher markup)
  markupRules: string[];      // Which rules were applied (for audit)
}

export async function calculatePrice(
  baseRate: number,
  context: PricingContext
): Promise<PricingResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch all active rules, ordered by priority (most specific first)
  const { data: rules } = await supabase
    .from("PricingRule")
    .select("*")
    .eq("isActive", true)
    .order("priority", { ascending: false });

  if (!rules || rules.length === 0) {
    return {
      baseRate,
      markupAmount: 0,
      displayedPrice: baseRate,
      originalPrice: baseRate,
      markupRules: [],
    };
  }

  // 2. Find the most specific applicable rule
  let applicableRule = null;
  let appliedRules: string[] = [];

  for (const rule of rules) {
    const matches =
      rule.category === context.category &&
      (!rule.destination || rule.destination === context.destination) &&
      (!rule.hotelName || rule.hotelName === context.hotelName) &&
      (!rule.airlineCode || rule.airlineCode === context.airlineCode) &&
      (!rule.roomType || rule.roomType === context.roomType);

    if (matches) {
      if (!applicableRule) {
        applicableRule = rule;
        appliedRules.push(rule.name);
      }
    }
  }

  // 3. Calculate markup
  let markupAmount = 0;
  if (applicableRule) {
    if (applicableRule.markupType === "PERCENT") {
      markupAmount = baseRate * (applicableRule.markupValue / 100);
    } else {
      markupAmount = applicableRule.markupValue;
    }

    // Apply min/max constraints
    if (applicableRule.minPrice && baseRate + markupAmount < applicableRule.minPrice) {
      markupAmount = applicableRule.minPrice - baseRate;
    }
    if (applicableRule.maxPrice && baseRate + markupAmount > applicableRule.maxPrice) {
      markupAmount = applicableRule.maxPrice - baseRate;
    }
  }

  const displayedPrice = Math.round(baseRate + markupAmount);
  const originalPrice = Math.round(baseRate + markupAmount * 1.3); // 30% higher for strikethrough

  return {
    baseRate,
    markupAmount: Math.round(markupAmount),
    displayedPrice,
    originalPrice,
    markupRules: appliedRules,
  };
}
```

### 3.4 Promo Code Application

```typescript
// src/lib/promo-service.ts

interface PromoResult {
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
}

export async function applyPromoCode(
  code: string,
  bookingAmount: number,
  category: string,
  userId: string
): Promise<PromoResult> {
  const supabase = createClient(/*...*/);

  // 1. Fetch promo code
  const { data: promo } = await supabase
    .from("PromoCode")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("isActive", true)
    .single();

  if (!promo) return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Invalid promo code" };

  // 2. Check expiry
  if (promo.validTo && new Date(promo.validTo) < new Date()) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code expired" };
  }

  // 3. Check usage limit
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code usage limit reached" };
  }

  // 4. Check minimum booking value
  if (promo.minBookingValue && bookingAmount < promo.minBookingValue) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: `Minimum booking ₹${promo.minBookingValue} required` };
  }

  // 5. Check category applicability
  if (promo.applicableTo !== "ALL" && promo.applicableTo !== category) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code not applicable for this booking type" };
  }

  // 6. Check first booking restriction
  if (promo.isFirstBooking) {
    const { count } = await supabase
      .from("Booking")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);
    if (count && count > 0) {
      return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code for first booking only" };
    }
  }

  // 7. Calculate discount
  let discount = 0;
  if (promo.discountType === "FLAT") {
    discount = promo.discountValue;
  } else {
    discount = Math.round(bookingAmount * (promo.discountValue / 100));
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  }

  // 8. Increment usage count
  await supabase
    .from("PromoCode")
    .update({ usedCount: promo.usedCount + 1 })
    .eq("id", promo.id);

  return {
    valid: true,
    discountAmount: discount,
    finalPrice: Math.max(0, bookingAmount - discount),
  };
}
```

### 3.5 Integration Points

| Location | What to Add |
|----------|-------------|
| `tbo-hotel-client.ts` → `toDisplay()` | Call `calculatePrice()` before returning results |
| `tbo-flight-client.ts` → `toDisplay()` | Call `calculatePrice()` before returning results |
| `api/tbo-hotels/route.ts` | Inject pricing context (destination, hotel) |
| `api/tbo/route.ts` | Inject pricing context (destination, airline) |
| `api/bookings/route.ts` | Apply promo code, loyalty points, corporate wallet |
| `HotelBookingModal.tsx` | Add promo code input, show discount breakdown |
| `FlightBookingModal.tsx` | Add promo code input, show discount breakdown |
| `InvoiceModal.tsx` | Update GST calculation with new pricing |
| `admin/promos/page.tsx` | Already has CRUD — add usage stats display |
| `admin/` (new page) | Pricing rules management UI |

---

## 4. Pricing Flow Summary

### Search Time (User sees prices)

```
TBO returns ₹5,000/night
    ↓
PricingRule lookup: Goa Hotel → +22% markup
    ↓
Displayed price: ₹6,100/night
Original price: ₹6,630/night (for strikethrough)
    ↓
User sees: ₹6,100 (was ₹6,630)
```

### Checkout Time (Final amount)

```
Base: ₹12,200 (2 nights × ₹6,100)
    ↓
Promo code "FIRST500": -₹500
    ↓
Loyalty points (2,400 pts): -₹2,400
    ↓
Subtotal: ₹9,300
    ↓
GST (5%): +₹465
    ↓
Total charged: ₹9,765
```

---

## 5. Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Markup engine (PricingRule lookup + apply) | 2-3 days | Core revenue |
| **P0** | Integrate into hotel/flight search results | 1-2 days | Core revenue |
| **P1** | Promo code validation + application | 2 days | Conversion boost |
| **P1** | Corporate rate application | 1-2 days | B2B revenue |
| **P1** | Loyalty points redemption at checkout | 1 day | Retention |
| **P2** | Admin UI for pricing rules | 2-3 days | Operations |
| **P2** | Price audit log (track all changes) | 1 day | Analytics |
| **P3** | Dynamic pricing (time/demand-based) | 3-5 days | Optimization |
| **P3** | A/B test pricing (show different prices) | 2-3 days | Optimization |

---

*Research compiled by MiMo Code Agent*  
*Sources: GoRASA codebase analysis, OTA industry patterns, TBO API documentation*
