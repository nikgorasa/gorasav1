# GoRASA Pricing Module — Integration Instructions

## Module Location

All pricing module files are in:
```
gorasa-next/src/lib/pricing/
├── index.ts                    # Public exports
├── types.ts                    # TypeScript interfaces
├── pricing-service.ts          # Core engine: calculatePrice, validatePromoCode, etc.
├── migration.sql               # SQL to run against Supabase
├── api/
│   ├── pricing-rules/
│   │   ├── route.ts            # GET/POST /api/pricing-rules
│   │   └── [id]/route.ts       # PATCH/DELETE /api/pricing-rules/:id
│   ├── promos/
│   │   └── validate/
│   │       └── route.ts        # POST /api/promos/validate
│   └── corporate-rates/
│       └── route.ts            # GET/POST /api/corporate-rates
└── admin/
    └── pricing-rules-page.tsx  # Admin UI component (drop into app/admin/pricing/)
```

---

## Step 1: Run Database Migration

Run the SQL in `src/lib/pricing/migration.sql` against your Supabase database.

You can do this via:
- Supabase Dashboard → SQL Editor → paste contents of `migration.sql`
- Or: `psql $DATABASE_URL -f src/lib/pricing/migration.sql`

This adds columns to existing tables and creates the `CorporateRate` table.

---

## Step 2: Update Prisma Schema

Add these changes to `prisma/schema.prisma`:

### Replace the existing PricingRule model (lines 96-105):

```prisma
model PricingRule {
  id            String    @id @default(cuid())
  name          String
  type          String
  category      String    @default("ALL")
  destination   String?
  hotelName     String?
  airlineCode   String?
  roomType      String?
  markupType    String    @default("PERCENT")
  markupValue   Float
  minPrice      Float?
  maxPrice      Float?
  priority      Int       @default(0)
  isActive      Boolean   @default(true)
  validFrom     DateTime?
  validTo       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Add CorporateRate model after Company (after line 44):

```prisma
model CorporateRate {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  category      String   @default("ALL")
  destination   String?
  discountType  String
  discountValue Float
  maxDiscount   Float?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Add corporateRates relation to Company model:

```prisma
model Company {
  id              String          @id @default(cuid())
  name            String
  domain          String?
  walletBalance   Float           @default(0)
  discountRate    Float           @default(0)
  isActive        Boolean         @default(true)
  approvedBy      String?
  employees       User[]
  corporateRates  CorporateRate[]  # ADD THIS LINE
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

Then run: `npx prisma generate`

---

## Step 3: Copy API Routes to App Directory

The API routes in `src/lib/pricing/api/` are written as Next.js App Router handlers but live in `lib/` for organization. Copy them to their proper locations:

```bash
# Pricing rules CRUD
cp src/lib/pricing/api/pricing-rules/route.ts    src/app/api/pricing-rules/route.ts
cp -r src/lib/pricing/api/pricing-rules/\[id\]    src/app/api/pricing-rules/\[id\]/

# Promo validation
cp -r src/lib/pricing/api/promos/validate         src/app/api/promos/validate/

# Corporate rates
cp src/lib/pricing/api/corporate-rates/route.ts  src/app/api/corporate-rates/route.ts
```

---

## Step 4: Integrate into Hotel Client

**File:** `src/lib/tbo-hotel-client.ts`

### 4a. Add import at top (after line 14):

```typescript
import { calculatePrice } from "./pricing";
```

### 4b. Make `toDisplay` accept context and become async.

Replace the `toDisplay` function (lines 19-82) with:

```typescript
async function toDisplay(
  h: { HotelCode: string; Currency: string; Rooms: any[] },
  context?: { destination?: string; hotelName?: string },
): Promise<TBOHotelDisplay> {
  const rooms: TBOHotelRoomDisplay[] = h.Rooms.map((r: any, ri: number) => {
    // ... existing room mapping code (unchanged) ...
  });

  const minFare = Math.min(...rooms.map(r => r.totalFare));
  const details = _hotelDetailsCache[h.HotelCode] || {};
  const ratingMap: Record<string, number> = {
    "OneStar": 1, "TwoStar": 2, "ThreeStar": 3, "FourStar": 4, "FiveStar": 5,
  };

  // --- PRICING INTEGRATION ---
  const pricing = await calculatePrice(minFare, {
    category: "HOTEL",
    destination: context?.destination,
    hotelName: details.name,
  });
  // --- END PRICING INTEGRATION ---

  return {
    hotelCode: Number(h.HotelCode) || 0,
    name: details.name || `Hotel ${h.HotelCode}`,
    hotelRating: ratingMap[details.rating] || 3,
    location: details.city || details.address || "",
    currency: h.Currency,
    minTotalFare: pricing.displayedPrice,
    rooms,
    resultIndex: 1,
    picture: details.imageUrl || "",
    rating: "ThreeStar",
    address: details.address || "",
    tripAdvisorRating: 0,
    description: "",
    price: pricing.displayedPrice,
    starRating: ratingMap[details.rating] || 3,
    originalPrice: pricing.originalPrice,
  };
}
```

### 4c. Update calls to `toDisplay` in `searchHotels`:

In the TBO API path (around line 235), change:
```typescript
// BEFORE:
const hotels = res.HotelResult.map(h => ({ ...toDisplay(h), source: "tbo" as const }));

// AFTER:
const hotels = await Promise.all(
  res.HotelResult.map(h => toDisplay(h, { destination: params.city }))
);
```

In the mock path (around line 263), change the room mapping to also use pricing:
```typescript
// BEFORE (line 309-311):
price: Math.min(...rooms.map(r => r.totalFare)),
starRating: info?.HotelRating || 3,
originalPrice: Math.min(...rooms.map(r => r.totalFare)) * 1.2,

// AFTER:
const minFare = Math.min(...rooms.map(r => r.totalFare));
const pricing = await calculatePrice(minFare, {
  category: "HOTEL",
  destination: params.city || location,
  hotelName: info?.HotelName,
});
// ... then use pricing.displayedPrice and pricing.originalPrice
```

---

## Step 5: Integrate into Flight Client

**File:** `src/lib/tbo-flight-client.ts`

### 5a. Add import at top (after line 18):

```typescript
import { calculatePrice } from "./pricing";
```

### 5b. Make `toDisplay` async and apply pricing:

```typescript
async function toDisplay(
  r: TBOFlightResult,
  leg: "outbound" | "inbound" | "oneway",
): Promise<TBOFlightDisplay> {
  // --- PRICING INTEGRATION ---
  const pricing = await calculatePrice(r.Fare.PublishedFare, {
    category: "FLIGHT",
    airlineCode: r.Segments[0]?.AirlineCode,
  });
  // --- END PRICING INTEGRATION ---

  return {
    resultIndex: r.ResultIndex,
    leg,
    isLCC: r.IsLCC,
    isRefundable: r.IsRefundable,
    source: r.Source,
    airline: r.Segments[0]?.Airline ?? "",
    airlineCode: r.Segments[0]?.AirlineCode ?? "",
    flightNumber: r.Segments[0]?.FlightNumber ?? "",
    operatingCarrier: r.Segments[0]?.OperatingCarrier ?? "",
    origin: r.Segments[0]?.Origin ?? "",
    destination: r.Segments[0]?.Destination ?? "",
    departureTime: r.Segments[0]?.DepTime ?? "",
    arrivalTime: r.Segments[0]?.ArrTime ?? "",
    duration: r.Segments[0]?.Duration ?? "",
    cabinClass: r.Segments[0]?.CabinClass ?? "",
    baggage: r.Segments[0]?.Baggage ?? "",
    cabinBaggage: r.Segments[0]?.CabinBaggage ?? "",
    currency: r.Fare.Currency,
    publishedFare: pricing.displayedPrice,  // CHANGED: was r.Fare.PublishedFare
    offeredFare: pricing.displayedPrice,    // CHANGED: was r.Fare.OfferedFare
    baseFare: pricing.baseRate,
    tax: r.Fare.Tax,
    commissionEarned: r.Fare.CommissionEarned,
    segments: r.Segments,
    fareBreakdown: r.FareBreakdown,
  };
}
```

### 5c. Update calls to `toDisplay` to use `await`:

In `searchFlights` (around line 115):
```typescript
// BEFORE:
const flights = res.Response.Results.map(r => { ... return toDisplay(r, leg); });

// AFTER:
const flights = await Promise.all(
  res.Response.Results.map(r => {
    const isReturn = params.JourneyType === 2 || params.JourneyType === 5;
    const tripInd = r.Segments[0]?.TripIndicator ?? 1;
    let leg: "outbound" | "inbound" | "oneway";
    if (!isReturn) leg = "oneway";
    else if (tripInd === 1) leg = "outbound";
    else leg = "inbound";
    return toDisplay(r, leg);
  })
);
```

Same change in the mock path (around line 140).

---

## Step 6: Integrate into Booking API

**File:** `src/app/api/bookings/route.ts`

### 6a. Add imports:

```typescript
import { validatePromoCode, getCorporateDiscount, calculateTax } from "@/lib/pricing";
```

### 6b. In the POST handler, after getting the user (line 61), add server-side pricing:

```typescript
// After line 62 (const body = await request.json()):
const { type, itemName, providerOrAirline, price: clientPrice, originalPrice,
  couponCodeUsed, pnr, seatOrRoom, paxCount, travelDates, paymentMethod } = body;

// --- SERVER-SIDE PRICING ---
let finalPrice = Number(clientPrice);
let promoDiscount = 0;
let taxAmount = 0;

// Validate promo code server-side
if (couponCodeUsed) {
  const promoResult = await validatePromoCode(
    couponCodeUsed, finalPrice, type, user.id
  );
  if (promoResult.valid) {
    promoDiscount = promoResult.discountAmount;
    finalPrice = promoResult.finalPrice;
  }
}

// Apply corporate rate
if (user.companyId) {
  const corpResult = await getCorporateDiscount(
    user.companyId, type, undefined, finalPrice
  );
  if (corpResult.discountAmount > 0) {
    promoDiscount += corpResult.discountAmount;
    finalPrice = corpResult.finalPrice;
  }
}

// Calculate tax
taxAmount = calculateTax(finalPrice, type);
const totalPrice = finalPrice + taxAmount;
// --- END SERVER-SIDE PRICING ---
```

### 6c. Use `totalPrice` in the Booking insert instead of `price`:

```typescript
const { data: booking, error } = await supabase
  .from("Booking")
  .insert({
    // ...
    price: totalPrice,           // CHANGED: was Number(price)
    originalPrice: Number(clientPrice),
    discountApplied: promoDiscount,
    couponCodeUsed: couponCodeUsed || null,
    // ...
  })
```

---

## Step 7: Fix InvoiceModal GST

**File:** `src/components/InvoiceModal.tsx`

### Replace line 37:

```typescript
// BEFORE:
const gst = Math.round(subtotal * 0.05);

// AFTER:
const gstRate = booking.type === "FLIGHT" ? 0.18 : 0.05;
const gstLabel = booking.type === "FLIGHT" ? "GST (18%)" : "GST (5%)";
const gst = Math.round(subtotal * gstRate);
```

### Update the GST display label (line 116):

```typescript
// BEFORE:
<span className="text-slate-600">GST (5%)</span>

// AFTER:
<span className="text-slate-600">{gstLabel}</span>
```

---

## Step 8: Add Admin Pricing Page

### 8a. Create the page file:

Copy `src/lib/pricing/admin/pricing-rules-page.tsx` to `src/app/admin/pricing/page.tsx`:

```bash
cp src/lib/pricing/admin/pricing-rules-page.tsx src/app/admin/pricing/page.tsx
```

### 8b. Add navigation link:

In `src/app/api/navigation/route.ts`, add to the admin section array:

```typescript
{
  href: "/admin/pricing",
  label: "Pricing Rules",
  icon: "DollarSign",
  section: "admin",
},
```

### 8c. Update admin layout icons:

In `src/app/admin/layout.tsx`, add `DollarSign` to the imports and `ADMIN_ICONS`:

```typescript
import { LayoutDashboard, BarChart3, Package, Tag, Star, Building2, Users, Settings, DollarSign } from "lucide-react";

const ADMIN_ICONS: Record<string, React.ReactNode> = {
  // ... existing icons ...
  DollarSign: <DollarSign size={18} />,
};
```

---

## Step 9: Enhanced Promo Code Admin

Update `src/app/admin/promos/page.tsx` to support the new fields. Add to the form:

```tsx
// Add these fields to the create form grid:
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
    Applicable To
  </label>
  <select
    value={newPromo.applicableTo}
    onChange={(e) => setNewPromo({ ...newPromo, applicableTo: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
  >
    <option value="ALL">All</option>
    <option value="HOTEL">Hotel</option>
    <option value="FLIGHT">Flight</option>
    <option value="PACKAGE">Package</option>
  </select>
</div>
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
    Max Discount (₹)
  </label>
  <input
    type="number"
    value={newPromo.maxDiscount || ""}
    onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: Number(e.target.value) })}
    placeholder="Cap for % promos"
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
  />
</div>
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
    Max Uses
  </label>
  <input
    type="number"
    value={newPromo.maxUses || ""}
    onChange={(e) => setNewPromo({ ...newPromo, maxUses: Number(e.target.value) })}
    placeholder="Unlimited"
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
  />
</div>
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={newPromo.isFirstBooking}
    onChange={(e) => setNewPromo({ ...newPromo, isFirstBooking: e.target.checked })}
    className="rounded"
  />
  <label className="text-sm text-slate-600">First booking only</label>
</div>
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Valid From</label>
  <input
    type="date"
    value={newPromo.validFrom || ""}
    onChange={(e) => setNewPromo({ ...newPromo, validFrom: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
  />
</div>
<div>
  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Valid To</label>
  <input
    type="date"
    value={newPromo.validTo || ""}
    onChange={(e) => setNewPromo({ ...newPromo, validTo: e.target.value })}
    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
  />
</div>
```

Also update the promo display to show usage count and category.

---

## Verification Checklist

After integration, verify:

1. **TypeScript:** `npx tsc --noEmit` in gorasa-next/
2. **DB migration ran:** Check Supabase for new columns in PricingRule, PromoCode, and CorporateRate table
3. **Seed data exists:** Check that 3 default rules (hotel 15%, flight ₹500, package 20%) are in the table
4. **Hotel search:** Search hotels → verify prices include markup (should be higher than raw TBO fare)
5. **Flight search:** Search flights → verify publishedFare includes markup
6. **Promo code:** Create a promo → validate via `/api/promos/validate` → verify discount applied
7. **Invoice:** Check invoice shows 5% GST for hotels, 18% for flights
8. **Admin pricing page:** Navigate to `/admin/pricing` → create/edit/delete rules
9. **Fallback:** If pricing-service is down, hotel/flight search should still work (returns base rate)

---

## Architecture Notes

- **Pricing runs at display time** — markup applied when results are shown, ensuring consistency
- **Server-side enforcement at booking** — the POST /api/bookings route re-validates prices
- **Rule hierarchy: most specific wins** — hotel-specific > destination > category > global
- **Fallback: base rate** — if pricing fails, TBO price is shown (never blocks booking)
- **GST hardcoded per category** — 5% hotels, 18% flights (can be made dynamic later)
- **60s cache on pricing rules** — reduces DB queries; call `invalidateRulesCache()` after admin changes
