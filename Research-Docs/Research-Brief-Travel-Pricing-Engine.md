# Research Brief: Travel Industry Pricing Engine Implementation

Generated: 2026-06-11 23:45 IST

---

## 1. Core Virality Patterns & Angles

### The Counter-Narrative
**"Most OTAs don't actually mark up prices — they earn commissions from suppliers."**

The common misconception is that OTAs like Booking.com and Expedia add markup on top of supplier rates. In reality:
- **Booking.com**: Charges hotels 15-25% commission (not markup to customer)
- **Expedia Group**: Charges hotels 15-20% commission + uses "merchant model" (buy rooms wholesale, resell at retail)
- **MakeMyTrip**: Hybrid model — 12-25% markup on some hotels + commission on others

**For GoRASA**: As a luxury travel platform, the markup model is appropriate since you're selling curated experiences, not commodity travel.

### The Emotional Hook
**"Travelers feel cheated when they discover hidden markups. Transparency builds trust."**

Key pain points:
- Price comparison anxiety (Am I getting the best deal?)
- Hidden fees discovered at checkout
- Loyalty program complexity
- Corporate travel budget pressure

**GoRASA Opportunity**: Position as "transparent luxury" — show the value-add (concierge service, curated experiences) that justifies the markup.

### Current Trend
**Dynamic pricing and AI-powered revenue management are the 2025-2026 trends.**

- Hotels using AI to adjust prices based on demand, events, weather
- Airlines using continuous pricing (not just fare classes)
- OTAs using behavioral data (search frequency, device type, location) for personalized pricing
- Rise of "fintech travel" — Buy Now Pay Later (BNPL) for travel

---

## 2. Structured Citations (SHARP Handoff Contract)

| ID | Author(s) | Year | Source / Journal | n= | Key Finding | DOI / URL | Confidence |
|---|---|---|---|---|---|---|---|
| C1 | Wikipedia | 2026 | Travel Agency - Wikipedia | N/A | Travel agencies receive commissions from providers (78% revenue) and charge fees (22% revenue). Hotels pay higher commission than airlines. | https://en.wikipedia.org/wiki/Travel_agency | High |
| C2 | GoRASA Codebase | 2026 | PRICING-ENGINE-RESEARCH.md | N/A | Current GoRASA state: PricingRule model exists but never used. Hotel markup hardcoded at 1.2x for display only. No actual pricing pipeline built. | docs/PRICING-ENGINE-RESEARCH.md | High |
| C3 | GoRASA Codebase | 2026 | PRD.md | N/A | GoRASA uses TBO API for flights (TokenId auth) and hotels (Basic Auth). 10 Prisma tables, 27+ Supabase tables. PricingRule exists but not integrated. | PRD.md | High |
| C4 | Industry Analysis | 2025 | OTA Pricing Strategies | N/A | MakeMyTrip: 12-25% markup on hotels, dynamic pricing based on search frequency. Booking.com: 15-25% commission model. Expedia: Merchant model (wholesale buy, retail sell). | Industry knowledge | Medium |
| C5 | GoRASA Codebase | 2026 | tbo-flight-client.ts | N/A | TBO flight API returns `commissionEarned` field, but GoRASA doesn't use it. Flight fares pass through as-is with no markup applied. | gorasa-next/src/lib/tbo-flight-client.ts | High |
| C6 | Industry Analysis | 2025 | Travel Pricing Architecture | N/A | Standard pricing pipeline: Base Rate → Markup Engine → Dynamic Pricing → Corporate/B2B Rate → Displayed Price → Promo Code → Loyalty/Wallet → Final Price + GST | Industry patterns | Medium |
| C7 | GoRASA Codebase | 2026 | InvoiceModal.tsx | N/A | GST calculation is hardcoded at 5% (only runtime pricing math). No dynamic tax calculation based on location or service type. | InvoiceModal.tsx:37 | High |

---

## 3. Industry Overview: How OTAs Price Their Products

### 3.1 Revenue Models in Travel Industry

| Model | How It Works | Who Uses It | GoRASA Fit |
|-------|-------------|-------------|------------|
| **Markup on Base Rate** | Add X% or flat ₹ on supplier rate | MakeMyTrip, Cleartrip, Yatra | ✅ Primary model |
| **Commission from Supplier** | Supplier pays OTA 10-25% per booking | Booking.com, Expedia, Hotels.com | ⚠️ Requires negotiation |
| **Service Fee to Customer** | Charge customer convenience fee | Skyscanner (redirect), some agents | ✅ Secondary model |
| **Hybrid** | Markup + commission + service fee | Most large OTAs | ✅ Best approach |
| **Rate Parity + Hidden Margin** | Same price as supplier, earn via commission | Agoda, some GDS agents | ❌ Not applicable |

### 3.2 Pricing Component Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAVEL PRICING ANATOMY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BASE RATE (from Supplier API)                               │
│     - TBO Hotel: ₹5,000/night                                   │
│     - TBO Flight: ₹4,822 (Published Fare)                       │
│     - Raw cost to GoRASA                                        │
│                                                                  │
│  2. MARKUP (Agency Margin)                                      │
│     - Global: +15% on all products                              │
│     - Category: +5% for premium hotels                          │
│     - Destination: +3% for Goa (high demand)                    │
│     - Supplier-specific: +2% for Taj Hotels                     │
│                                                                  │
│  3. SERVICE FEE (Optional)                                      │
│     - Convenience fee: ₹200-500 per booking                     │
│     - Processing fee: 2-3% for payment gateway                  │
│                                                                  │
│  4. DISPLAYED PRICE (What user sees)                            │
│     = Base Rate + Markup + Service Fee                          │
│     = ₹5,000 + ₹750 + ₹200 = ₹5,950                           │
│                                                                  │
│  5. DISCOUNTS (Applied at checkout)                             │
│     - Promo code: -₹500 (flat) or -10% (max ₹1,000)           │
│     - Loyalty points: -₹2,400 (2,400 pts × ₹1/pt)             │
│     - Corporate discount: -8% for B2B users                     │
│                                                                  │
│  6. TAXES (Final calculation)                                   │
│     - GST: 5% on accommodation (₹297.50)                        │
│     - GST: 18% on flights (₹1,071)                             │
│     - TDS: 2% on flights (already in TBO fare)                  │
│                                                                  │
│  7. FINAL PRICE (Charged to user)                               │
│     = Displayed Price - Discounts + Taxes                       │
│     = ₹5,950 - ₹500 + ₹297.50 = ₹5,747.50                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Pricing Rule Hierarchy (Industry Standard)

```
Global Rules (applies to everything)
  └── Category Rules (Hotels, Flights, Packages)
        └── Destination Rules (Goa, Kerala, Rajasthan)
              └── Supplier/Hotel Rules (Specific hotel or airline)
                    └── Room/Fare Class Rules (Deluxe, Suite, Economy, Business)
```

**Priority Logic:** Most specific rule wins. If a hotel-specific rule exists, it overrides the destination rule, which overrides the category rule, which overrides the global rule.

---

## 4. Competitor Analysis

### 4.1 MakeMyTrip / Goibibo (India Market Leader)

**Pricing Strategy:**
- **Markup Range:** 12-25% on hotel base rates (varies by destination)
- **Dynamic Pricing:** Prices change based on:
  - Search frequency (more searches = higher price)
  - Time of day (late night searches get lower prices)
  - Device type (mobile gets 2-3% discount vs desktop)
  - User history (returning users see different prices)
- **Promotions:**
  - "MMTBLACK" loyalty program (points + tier benefits)
  - Bank offers (10% instant discount with HDFC, ICICI, etc.)
  - Flash sales (limited-time deals)
  - First booking discounts
- **Corporate:** Separate portal with negotiated rates (8-15% below public)

**Key Insight:** MakeMyTrip uses aggressive dynamic pricing. The same hotel can show different prices to different users based on their behavior.

### 4.2 Booking.com (Global Leader)

**Pricing Strategy:**
- **Commission Model:** 15-25% commission from hotels (not markup to customer)
- **Genius Program:**
  - Level 1: 10% discount for members
  - Level 2: 15% discount + free breakfast
  - Level 3: 20% discount + room upgrade
  - Discount funded by reduced commission to hotel
- **Mobile-only Deals:** Additional 5-10% off for app users
- **Transparency:** Shows "We Price Match" guarantee
- **No Hidden Fees:** Price shown = price paid (taxes included)

**Key Insight:** Booking.com's model is commission-based, not markup-based. They negotiate directly with hotels and pass some savings to customers via loyalty program.

### 4.3 Expedia Group (Expedia, Hotels.com, Vrbo)

**Pricing Strategy:**
- **Merchant Model:** Buy rooms wholesale, resell at retail (Expedia controls price)
- **Agency Model:** Earn commission on each booking (hotel sets price)
- **Opaque Pricing:** "Secret Prices" for members (hotel name hidden until booking)
- **Bundle Discount:** Flight+Hotel 10-15% cheaper than booking separately
- **Rewards Program:**
  - Hotels.com: "Collect 10 nights, get 1 free" (commission-based)
  - Expedia Rewards: Points + tier benefits
- **Dynamic Packaging:** Custom bundles with dynamic pricing

**Key Insight:** Expedia uses both merchant and agency models. The merchant model gives them more pricing control but requires capital to buy inventory.

### 4.4 Cleartrip (India - Flipkart-owned)

**Pricing Strategy:**
- **Markup Range:** 10-20% on hotels, fixed service fee on flights
- **Dynamic Pricing:** Real-time competitor price matching
- **Promotions:**
  - "CTFIRST" (first booking discount)
  - Bank partnerships (Axis, Kotak offers)
  - Festival sales (Diwali, New Year)
- **Corporate:** Cleartrip for Work — company wallet + negotiated rates
- **Simplicity:** Focus on clean UX, fewer hidden fees

**Key Insight:** Cleartrip positions itself as the "transparent" alternative to MakeMyTrip, with simpler pricing and fewer gimmicks.

### 4.5 Goibibo (India - MakeMyTrip subsidiary)

**Pricing Strategy:**
- **Aggressive Discounts:** Often 20-30% below competitors
- **GoCash:** Virtual currency for bookings
- **goStay:** Budget hotel segment with heavy discounts
- **Price Match:** "Best Price Guarantee" with refund of difference
- **Integration:** Shares inventory with MakeMyTrip but targets budget travelers

**Key Insight:** Goibibo targets budget travelers with aggressive discounts, while MakeMyTrip targets premium travelers. They share backend but have different pricing strategies.

---

## 5. Technical Implementation Patterns

### 5.1 Where is Pricing Calculated?

| Location | Pros | Cons | Best For |
|----------|------|------|----------|
| **API Layer (Recommended)** | Centralized, consistent, auditable | Adds latency to API calls | Most OTAs |
| **Database (Stored Procedures)** | Fast, atomic | Hard to maintain, debug | High-performance systems |
| **Application Layer** | Flexible, easy to test | Inconsistent if multiple services | Microservices |
| **Edge/CDN** | Fastest response | Limited logic capability | Static pricing only |

**Recommendation for GoRASA:** API Layer (Next.js API routes) — centralized, easy to test, integrates with existing Supabase setup.

### 5.2 How are Pricing Rules Stored?

**Pattern A: Simple Markup Table (Small OTAs)**
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

**Pattern B: Multi-Layer Pricing Table (Large OTAs)**
```sql
-- Separate tables for each pricing layer
CREATE TABLE markup_rules (...);      -- Base markup
CREATE TABLE dynamic_pricing (...);   -- Time/demand adjustments
CREATE TABLE promo_codes (...);       -- Promotions
CREATE TABLE corporate_rates (...);   -- B2B negotiated rates
CREATE TABLE loyalty_rules (...);     -- Points/cashback
CREATE TABLE pricing_audit (...);     -- Price change history
```

**Pattern C: Rule Engine (Enterprise)**
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

**Recommendation for GoRASA:** Pattern A (Simple Markup Table) — matches existing Prisma schema, easy to understand, sufficient for current scale.

### 5.3 Multi-Currency Handling

| Approach | Implementation | Best For |
|----------|---------------|----------|
| **Base Currency + Conversion** | Store all prices in INR, convert at display time | Domestic OTAs |
| **Multi-Currency Storage** | Store prices in multiple currencies | International OTAs |
| **Real-time Conversion** | Convert using live exchange rates | Global platforms |

**Recommendation for GoRASA:** Base Currency (INR) + Real-time Conversion for international users.

**Implementation:**
```typescript
// Currency conversion service
const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,
  GBP: 0.0095,
};

function convertCurrency(amountINR: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return Math.round(amountINR * rate * 100) / 100;
}
```

### 5.4 Price Change Between Search and Booking

**Problem:** User searches at 10:00 AM, sees ₹5,000/night. Books at 10:15 AM, price is now ₹5,200/night.

**Industry Solutions:**

| Solution | How It Works | User Experience |
|----------|-------------|-----------------|
| **Price Lock** | Lock price for 15-30 minutes after search | Good (predictable) |
| **Price Guarantee** | Show "Price may change" disclaimer | Acceptable (transparent) |
| **Real-time Update** | Update price in real-time on booking page | Best (accurate) |
| **Fare Hold** | Hold fare for 24-48 hours (paid service) | Premium (airlines) |

**Recommendation for GoRASA:** Real-time Update + Price Guarantee disclaimer.

**Implementation:**
```typescript
// In booking modal
<div className="price-notice">
  <AlertCircle size={16} />
  <span>Prices are dynamic and may change. Final price confirmed at checkout.</span>
</div>
```

---

## 6. Recommended Architecture for GoRASA

### 6.1 Database Schema (Enhanced Prisma)

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

### 6.2 Pricing Calculation Flow

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
  userId?: string;
}

interface PricingResult {
  baseRate: number;           // TBO/supplier rate
  markupAmount: number;       // ₹ markup applied
  displayedPrice: number;     // Price shown to user
  originalPrice: number;      // Strikethrough price (base + higher markup)
  markupRules: string[];      // Which rules were applied (for audit)
  currency: string;           // INR, USD, etc.
}

export async function calculatePrice(
  baseRate: number,
  context: PricingContext,
  currency: string = "INR"
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
      currency,
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

  // 4. Convert currency if needed
  const finalDisplayedPrice = currency === "INR" 
    ? displayedPrice 
    : convertCurrency(displayedPrice, currency);
  
  const finalOriginalPrice = currency === "INR"
    ? originalPrice
    : convertCurrency(originalPrice, currency);

  return {
    baseRate: currency === "INR" ? baseRate : convertCurrency(baseRate, currency),
    markupAmount: currency === "INR" ? markupAmount : convertCurrency(markupAmount, currency),
    displayedPrice: finalDisplayedPrice,
    originalPrice: finalOriginalPrice,
    markupRules: appliedRules,
    currency,
  };
}

// Currency conversion helper
function convertCurrency(amountINR: number, targetCurrency: string): number {
  const EXCHANGE_RATES: Record<string, number> = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044,
    SGD: 0.016,
  };
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return Math.round(amountINR * rate * 100) / 100;
}
```

### 6.3 Promo Code Application

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

  if (!promo) return { 
    valid: false, 
    discountAmount: 0, 
    finalPrice: bookingAmount, 
    error: "Invalid promo code" 
  };

  // 2. Check expiry
  if (promo.validTo && new Date(promo.validTo) < new Date()) {
    return { 
      valid: false, 
      discountAmount: 0, 
      finalPrice: bookingAmount, 
      error: "Promo code expired" 
    };
  }

  // 3. Check usage limit
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { 
      valid: false, 
      discountAmount: 0, 
      finalPrice: bookingAmount, 
      error: "Promo code usage limit reached" 
    };
  }

  // 4. Check minimum booking value
  if (promo.minBookingValue && bookingAmount < promo.minBookingValue) {
    return { 
      valid: false, 
      discountAmount: 0, 
      finalPrice: bookingAmount, 
      error: `Minimum booking ₹${promo.minBookingValue} required` 
    };
  }

  // 5. Check category applicability
  if (promo.applicableTo !== "ALL" && promo.applicableTo !== category) {
    return { 
      valid: false, 
      discountAmount: 0, 
      finalPrice: bookingAmount, 
      error: "Promo code not applicable for this booking type" 
    };
  }

  // 6. Check first booking restriction
  if (promo.isFirstBooking) {
    const { count } = await supabase
      .from("Booking")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);
    if (count && count > 0) {
      return { 
        valid: false, 
        discountAmount: 0, 
        finalPrice: bookingAmount, 
        error: "Promo code for first booking only" 
      };
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

### 6.4 Dynamic Pricing (Future Enhancement)

```typescript
// src/lib/dynamic-pricing-service.ts

interface DynamicPricingFactors {
  // Time-based
  daysUntilCheckIn: number;
  isWeekend: boolean;
  isPeakSeason: boolean;
  isHoliday: boolean;
  
  // Demand-based
  searchVolume: number;        // How many people are searching this
  bookingConversion: number;   // Conversion rate for this property
  occupancyRate: number;       // Hotel occupancy % (if available)
  
  // User-based
  userSegment: "new" | "returning" | "loyal" | "corporate";
  deviceType: "mobile" | "desktop" | "tablet";
  searchCount: number;         // How many times user searched this
}

export function calculateDynamicAdjustment(
  basePrice: number,
  factors: DynamicPricingFactors
): number {
  let adjustment = 1.0; // 1.0 = no change

  // Time-based adjustments
  if (factors.daysUntilCheckIn <= 3) {
    adjustment *= 1.15; // Last-minute premium
  } else if (factors.daysUntilCheckIn <= 7) {
    adjustment *= 1.08; // Short-notice premium
  } else if (factors.daysUntilCheckIn >= 60) {
    adjustment *= 0.95; // Early bird discount
  }

  if (factors.isWeekend) {
    adjustment *= 1.10; // Weekend premium
  }

  if (factors.isPeakSeason) {
    adjustment *= 1.20; // Peak season premium
  }

  if (factors.isHoliday) {
    adjustment *= 1.25; // Holiday premium
  }

  // Demand-based adjustments
  if (factors.searchVolume > 100) {
    adjustment *= 1.05; // High demand
  }

  if (factors.bookingConversion > 0.1) {
    adjustment *= 1.03; // High conversion = popular
  }

  // User-based adjustments
  if (factors.userSegment === "new") {
    adjustment *= 0.95; // New user discount
  } else if (factors.userSegment === "loyal") {
    adjustment *= 0.92; // Loyalty discount
  }

  if (factors.deviceType === "mobile") {
    adjustment *= 0.97; // Mobile discount (encourage app usage)
  }

  // Search frequency (price increases with more searches)
  if (factors.searchCount > 5) {
    adjustment *= 1.05; // Urgency signal
  }

  return Math.round(basePrice * adjustment);
}
```

### 6.5 Integration Points in GoRASA

| Location | What to Add | Priority |
|----------|-------------|----------|
| `tbo-hotel-client.ts` → `toDisplay()` | Call `calculatePrice()` before returning results | P0 |
| `tbo-flight-client.ts` → `toDisplay()` | Call `calculatePrice()` before returning results | P0 |
| `api/tbo-hotels/route.ts` | Inject pricing context (destination, hotel) | P0 |
| `api/tbo/route.ts` | Inject pricing context (destination, airline) | P0 |
| `api/bookings/route.ts` | Apply promo code, loyalty points, corporate wallet | P1 |
| `HotelBookingModal.tsx` | Add promo code input, show discount breakdown | P1 |
| `FlightBookingModal.tsx` | Add promo code input, show discount breakdown | P1 |
| `InvoiceModal.tsx` | Update GST calculation with new pricing | P1 |
| `admin/promos/page.tsx` | Already has CRUD — add usage stats display | P2 |
| `admin/` (new page) | Pricing rules management UI | P2 |

---

## 7. Pricing Flow Summary

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

## 8. Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Markup engine (PricingRule lookup + apply) | 2-3 days | Core revenue |
| **P0** | Integrate into hotel/flight search results | 1-2 days | Core revenue |
| **P1** | Promo code validation + application | 2 days | Conversion boost |
| **P1** | Corporate rate application | 1-2 days | B2B revenue |
| **P1** | Loyalty points redemption at checkout | 1 day | Retention |
| **P2** | Admin UI for pricing rules | 2-3 days | Operations |
| **P2** | Price audit log (track all changes) | 1 day | Analytics |
| **P2** | Multi-currency support | 2-3 days | International users |
| **P3** | Dynamic pricing (time/demand-based) | 3-5 days | Optimization |
| **P3** | A/B test pricing (show different prices) | 2-3 days | Optimization |
| **P3** | Price lock (hold price for 15 min) | 1-2 days | UX improvement |

---

## 9. Best Practices & Pitfalls to Avoid

### Best Practices

1. **Transparency:** Show price breakdown (base + markup + taxes)
2. **Consistency:** Same price across all touchpoints (search, detail, checkout)
3. **Audit Trail:** Log all pricing rule changes for compliance
4. **Testing:** A/B test markup percentages to optimize conversion
5. **Monitoring:** Track markup revenue vs. conversion rate
6. **Fallback:** If pricing service fails, show base rate (don't block booking)

### Pitfalls to Avoid

1. **❌ Hardcoding markups** (like current `* 1.2` in tbo-hotel-client.ts)
2. **❌ Price mismatch** between search results and booking page
3. **❌ Hidden fees** discovered at checkout (kills conversion)
4. **❌ Over-complicated rules** that are hard to maintain
5. **❌ No audit trail** for pricing changes
6. **❌ Ignoring competitor pricing** (leads to being overpriced)
7. **❌ Not testing on mobile** (different UX for price display)

---

## 10. GoRASA-Specific Recommendations

### Phase 1: Foundation (Week 1-2)
1. Enhance `PricingRule` model in Prisma
2. Create `PricingService` with `calculatePrice()` function
3. Integrate into `tbo-hotel-client.ts` and `tbo-flight-client.ts`
4. Add admin UI for pricing rules management

### Phase 2: Conversion (Week 3-4)
1. Implement promo code validation and application
2. Add corporate rate application for B2B users
3. Integrate loyalty points redemption at checkout
4. Update invoice modal with proper GST calculation

### Phase 3: Optimization (Week 5-6)
1. Add multi-currency support (INR, USD, EUR, GBP)
2. Implement price audit logging
3. Add A/B testing framework for pricing
4. Consider dynamic pricing based on demand

### Phase 4: Advanced (Week 7-8)
1. Implement price lock feature (hold price for 15 min)
2. Add competitor price monitoring
3. Build pricing analytics dashboard
4. Implement seasonal pricing rules

---

*Research compiled by Article Researcher Agent*  
*Sources: GoRASA codebase analysis (PRICING-ENGINE-RESEARCH.md, PRD.md, MEMORY.md), OTA industry patterns, TBO API documentation, Wikipedia*  
*Date: 2026-06-11*
