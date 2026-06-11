# GoRASA Payment Gateway Module — Implementation Plan

**Scope:** Razorpay (primary) + PhonePe, async webhook pattern for Vercel compatibility
**Location:** `src/lib/payment/` (contained directory, same pattern as pricing module)
**Date:** 2026-06-12

---

## Current State

| Area | Current Code | Problem |
|------|-------------|---------|
| Payment model | `prisma/schema.prisma:130-140` — has `phonepeId` field | Never populated. No actual gateway integration. |
| Booking creation | `api/bookings/route.ts:102-109` | Creates Payment record with status="PENDING" but never updates it. |
| Hotel booking | `HotelBookingModal.tsx:54-195` | Books directly with TBO, saves to DB, no payment step. |
| Flight booking | `FlightBookingModal.tsx:62-96` | Same — no payment, just saves booking. |
| PRD requirement | `PRD-ENHANCED.md:163-194` | PhonePe/Razorpay integration listed as P0 blocker. |
| Sprint status | `Sprint-1.md:440-444` | "Waiting for PhonePe credentials" — never implemented. |

**Key insight:** Both booking modals currently skip payment entirely. They call TBO → save to DB → show "Confirmed". No money changes hands.

---

## Architecture: Async Webhook Pattern

```
[User clicks "Pay"]
      ↓
[Next.js API] → Creates Booking (status=PENDING) + Payment (status=PENDING)
      ↓
[Razorpay API] → Returns checkout_url (< 100ms)
      ↓
[User] → Redirected to Razorpay/PhonePe checkout page
      ↓ (user pays)
[Razorpay webhook] → POST /api/webhooks/razorpay
      ↓
[Next.js API] → Verifies signature → Updates Booking status=CONFIRMED, Payment status=COMPLETED
      ↓
[User's My Trips page] → Shows "Payment Confirmed" (polled or real-time)
```

**Why this works on Vercel:**
- API routes only do fast DB writes + API calls (< 2s total)
- Payment processing happens on Razorpay's servers
- Webhook callback is a separate lightweight endpoint
- No long-running connections

---

## Module Structure

```
src/lib/payment/
├── index.ts                          # Public exports
├── types.ts                          # TypeScript interfaces
├── razorpay-client.ts                # Razorpay SDK wrapper
├── phonepe-client.ts                 # PhonePe API wrapper
├── payment-service.ts                # Core: createOrder, verifyWebhook, handleCallback
├── migration.sql                     # Schema additions for Payment table
├── README.md                         # Quick reference
├── INTEGRATION.md                    # Step-by-step guide
├── api/
│   ├── checkout/route.ts             # POST /api/checkout — create payment order
│   ├── webhooks/
│   │   ├── razorpay/route.ts         # POST /api/webhooks/razorpay
│   │   └── phonepe/route.ts          # POST /api/webhooks/phonepe
│   └── payment-status/[id]/route.ts  # GET /api/payment-status/:id — poll status
└── admin/
    └── payments-page.tsx             # Admin: view all payments, refunds
```

---

## Phase 1: Schema Enhancement

### Migration SQL (`migration.sql`)

Enhance the existing `Payment` table:

```sql
-- Add columns to Payment table
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "gateway" TEXT NOT NULL DEFAULT 'razorpay';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "signature" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMPTZ;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundAmount" DOUBLE PRECISION;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Enhance Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMPTZ;
```

### Prisma Schema Updates

Add to `Payment` model:
```prisma
model Payment {
  id              String    @id @default(cuid())
  bookingId       String    @unique
  booking         Booking   @relation(fields: [bookingId], references: [id])
  amount          Float
  method          String
  status          String    @default("PENDING")
  gateway         String    @default("razorpay")     # NEW
  orderId         String?                            # NEW: Razorpay order_id
  paymentId       String?                            # NEW: Razorpay payment_id
  signature       String?                            # NEW: Razorpay signature
  phonepeId       String?
  failureReason   String?                            # NEW
  refundedAt      DateTime?                          # NEW
  refundAmount    Float?                             # NEW
  metadata        Json?                              # NEW
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

Add to `Booking` model:
```prisma
  paymentStatus   String    @default("PENDING")  # NEW: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  confirmedAt     DateTime?                       # NEW
```

---

## Phase 2: Razorpay Client

### `razorpay-client.ts`

```typescript
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  method: string;
}

// Create order — called when user clicks "Pay"
export async function createRazorpayOrder(params: {
  amount: number;        // in INR
  receipt: string;       // booking ID
  notes?: Record<string, string>;
}): Promise<RazorpayOrder>

// Verify webhook signature
export function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string
): boolean

// Fetch payment details (for verification)
export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment>

// Create refund
export async function createRazorpayRefund(
  paymentId: string,
  amount?: number        // partial refund if specified
): Promise<{ id: string }>
```

**API key handling:**
- `RAZORPAY_KEY_ID` — public key (used in frontend checkout)
- `RAZORPAY_KEY_SECRET` — secret key (server-side only)
- `RAZORPAY_WEBHOOK_SECRET` — for verifying webhook signatures

---

## Phase 3: PhonePe Client

### `phonepe-client.ts`

```typescript
interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  amount: number;           // in paise
  redirectUrl: string;
  callbackUrl: string;
}

interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  data: {
    merchantId: string;
    transactionId: string;
    paymentLink: string;    // redirect URL
  };
}

// Create payment request — returns redirect URL
export async function createPhonePePayment(params: {
  amount: number;           // in INR
  transactionId: string;    // booking ID
  redirectUrl: string;
  callbackUrl: string;
}): Promise<PhonePePaymentResponse>

// Verify webhook callback
export function verifyPhonePeCallback(
  body: string,
  header: string,
  salt: string
): boolean

// Check payment status
export async function checkPhonePeStatus(
  transactionId: string
): Promise<{ state: string; amount: number }>
```

**API key handling:**
- `PHONEPE_MERCHANT_ID`
- `PHONEPE_SALT_KEY`
- `PHONEPE_SALT_INDEX`
- `PHONEPE_API_BASE` — `https://api.phonepe.com` (prod) or `https://api-preprod.phonepe.com` (sandbox)

---

## Phase 4: Payment Service

### `payment-service.ts`

Core orchestration functions:

```typescript
// 1. Create checkout — returns gateway checkout URL
export async function createCheckout(params: {
  bookingId: string;
  amount: number;
  gateway: "razorpay" | "phonepe";
  userId: string;
  userEmail: string;
}): Promise<{ checkoutUrl: string; orderId: string }>

// 2. Handle Razorpay webhook
export async function handleRazorpayWebhook(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  rawBody: string;
}): Promise<{ success: boolean; bookingId: string }>

// 3. Handle PhonePe webhook
export async function handlePhonePeWebhook(params: {
  transactionId: string;
  state: string;
  response: any;
}): Promise<{ success: boolean; bookingId: string }>

// 4. Check payment status (for polling)
export async function getPaymentStatus(
  bookingId: string
): Promise<{ status: string; amount: number; gateway: string }>

// 5. Process refund
export async function processRefund(
  paymentId: string,
  amount?: number
): Promise<{ success: boolean; refundId: string }>
```

**Flow detail:**

1. `createCheckout()`:
   - Look up Booking by ID
   - Create Payment record (status=PENDING, gateway=selected)
   - Call Razorpay/PhonePe to create order
   - Update Payment with orderId
   - Return checkoutUrl

2. `handleRazorpayWebhook()`:
   - Verify signature with `RAZORPAY_WEBHOOK_SECRET`
   - Fetch payment details from Razorpay
   - Update Payment: status=COMPLETED, paymentId, signature
   - Update Booking: paymentStatus=COMPLETED, status=CONFIRMED, confirmedAt=now
   - Return success

3. `handlePhonePeWebhook()`:
   - Verify checksum with PhonePe salt
   - If state=COMPLETED: same as above
   - If state=FAILED: update Payment status=FAILED, Booking paymentStatus=FAILED

---

## Phase 5: API Routes

### `POST /api/checkout`

```typescript
// Request: { bookingId: string, gateway: "razorpay" | "phonepe" }
// Response: { checkoutUrl: string, orderId: string }
```

### `POST /api/webhooks/razorpay`

```typescript
// Raw body + X-Razorpay-Signature header
// Returns 200 immediately
```

### `POST /api/webhooks/phonepe`

```typescript
// PhonePe callback payload
// Returns 200 immediately
```

### `GET /api/payment-status/:id`

```typescript
// Response: { status: "PENDING" | "COMPLETED" | "FAILED", amount: number }
// Used by frontend to poll after redirect
```

---

## Phase 6: Frontend Integration

### 6a. Checkout Button Component

**New file:** `src/lib/payment/components/CheckoutButton.tsx`

```tsx
// Reusable component used in both booking modals
// Props: { bookingId, amount, gateway, onSuccess, onError }
// On click: POST /api/checkout → redirect to checkoutUrl
// On return: poll /api/payment-status until COMPLETED
```

### 6b. Payment Status Page

**New file:** `src/lib/payment/components/PaymentStatusPage.tsx`

```tsx
// Shown after redirect from gateway
// Polls /api/payment-status every 2s for 60s
// Shows: Processing → Confirmed → Done
// Shows: Failed → Retry button
```

### 6c. Modify Booking Modals

**`HotelBookingModal.tsx`** — add payment step between "saving" and "done":

```
Current flow:  form → blocking → book-confirming → saving → done
New flow:      form → blocking → book-confirming → saving → payment → done
                                                              ↑
                                                    (redirect to checkout)
```

**`FlightBookingModal.tsx`** — add payment step:

```
Current flow:  form → saving → done
New flow:      form → saving → payment → done
```

### 6d. Success/Return Page

**New file:** `src/app/payment/success/page.tsx`

```tsx
// Redirect target after gateway checkout
// Reads query params (order_id, payment_id)
// Polls /api/payment-status
// Shows confirmation with booking details
```

---

## Phase 7: Admin Payments Page

**`admin/payments-page.tsx`** — view all payments:

- Table: Booking ID, Amount, Gateway, Status, Date, Actions
- Filter by status (PENDING, COMPLETED, FAILED, REFUNDED)
- Refund button (calls processRefund)
- Export to CSV

---

## Environment Variables Needed

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# PhonePe
PHONEPE_MERCHANT_ID=M1xxxxx
PHONEPE_SALT_KEY=xxxxx
PHONEPE_SALT_INDEX=1
PHONEPE_API_BASE=https://api-preprod.phonepe.com  # sandbox
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `types.ts` | CheckoutRequest, WebhookPayload, PaymentResult |
| `razorpay-client.ts` | Razorpay SDK wrapper |
| `phonepe-client.ts` | PhonePe API wrapper |
| `payment-service.ts` | Core orchestration |
| `migration.sql` | Schema additions |
| `api/checkout/route.ts` | Create payment order |
| `api/webhooks/razorpay/route.ts` | Razorpay webhook handler |
| `api/webhooks/phonepe/route.ts` | PhonePe webhook handler |
| `api/payment-status/[id]/route.ts` | Poll payment status |
| `components/CheckoutButton.tsx` | Reusable pay button |
| `components/PaymentStatusPage.tsx` | Post-payment status display |
| `admin/payments-page.tsx` | Admin payments table |
| `README.md` | Quick reference |
| `INTEGRATION.md` | Step-by-step guide |

## Files to Modify (by main agent)

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Enhance Payment + Booking models |
| `components/HotelBookingModal.tsx` | Add payment step after booking |
| `components/FlightBookingModal.tsx` | Add payment step after booking |
| `app/admin/layout.tsx` | Add Payments nav icon |
| `app/api/navigation/route.ts` | Add Payments link (or Supabase) |

---

## Implementation Order

| Step | Task | Est. |
|------|------|------|
| 1 | Schema migration (SQL + Prisma) | 0.5 day |
| 2 | Razorpay client + PhonePe client | 1 day |
| 3 | Payment service (createCheckout, webhooks, status) | 1 day |
| 4 | API routes (checkout, webhooks, status) | 0.5 day |
| 5 | CheckoutButton + PaymentStatus components | 1 day |
| 6 | Integrate into HotelBookingModal | 0.5 day |
| 7 | Integrate into FlightBookingModal | 0.5 day |
| 8 | Admin payments page | 0.5 day |
| 9 | TypeScript check + testing | 0.5 day |

**Total: ~5-6 days**

---

## Verification Plan

1. **TypeScript:** `npx tsc --noEmit`
2. **Checkout flow:** Create booking → POST /api/checkout → verify Razorpay order created
3. **Webhook simulation:** POST /api/webhooks/razorpay with test payload → verify Booking status updates
4. **Payment status:** GET /api/payment-status/:id → verify returns correct status
5. **Full E2E:** Razorpay test mode → complete payment → verify booking confirmed
6. **PhonePe flow:** Same as above with PhonePe sandbox
7. **Refund:** Trigger refund → verify Payment.refundedAt populated
8. **Admin:** Navigate to /admin/payments → verify payments listed
