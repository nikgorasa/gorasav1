# GoRASA Payment Gateway Module — Implementation Plan

**Scope:** Razorpay (primary) + PhonePe, mock-first with real API switch
**Location:** `src/lib/payment/` (fully self-contained)
**Date:** 2026-06-12

---

## Architecture: Async Webhook Pattern (Mock Mode)

```
[User clicks "Pay"]
      ↓
[Next.js API] → Creates Booking (status=PENDING) + Payment (status=PENDING)
      ↓
[Razorpay mock] → Returns fake checkout_url (simulates redirect)
      ↓
[User] → Redirected to /payment/success?order_id=xxx (mock success)
      ↓
[Webhook mock] → POST /api/webhooks/razorpay (auto-fires after 2s)
      ↓
[Next.js API] → Updates Booking status=COMPLETED, Payment status=COMPLETED
      ↓
[User's My Trips page] → Shows "Payment Confirmed"
```

**Mock vs Real:**
- `PAYMENT_MOCK=true` (default) → all payments auto-succeed after redirect, no real gateway calls
- `PAYMENT_MOCK=false` → real Razorpay/PhonePe integration (requires API keys)

---

## Module Structure

```
src/lib/payment/
├── index.ts                          # Public exports
├── types.ts                          # TypeScript interfaces
├── config.ts                         # Mock mode toggle + gateway config
├── razorpay-client.ts                # Razorpay SDK (mock + real)
├── phonepe-client.ts                 # PhonePe API (mock + real)
├── payment-service.ts                # Core: createOrder, verifyWebhook, handleCallback
├── migration.sql                     # Schema additions
├── mock-handler.ts                   # Mock payment simulation (auto-complete after redirect)
├── README.md                         # Quick reference
├── INTEGRATION.md                    # Step-by-step guide
├── api/
│   ├── checkout/route.ts             # POST /api/checkout
│   ├── webhooks/
│   │   ├── razorpay/route.ts         # POST /api/webhooks/razorpay
│   │   └── phonepe/route.ts          # POST /api/webhooks/phonepe
│   └── payment-status/[id]/route.ts  # GET /api/payment-status/:id
├── components/
│   ├── CheckoutButton.tsx            # Reusable pay button
│   └── PaymentStatusPage.tsx         # Post-payment status display
└── admin/
    └── payments-page.tsx             # Admin payments table
```

---

## Phase 1: Schema Enhancement

### `migration.sql`

```sql
-- Enhance Payment table
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

```prisma
model Payment {
  id              String    @id @default(cuid())
  bookingId       String    @unique
  booking         Booking   @relation(fields: [bookingId], references: [id])
  amount          Float
  method          String
  status          String    @default("PENDING")
  gateway         String    @default("razorpay")
  orderId         String?
  paymentId       String?
  signature       String?
  phonepeId       String?
  failureReason   String?
  refundedAt      DateTime?
  refundAmount    Float?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Booking {
  ...existing fields...
  paymentStatus   String    @default("PENDING")
  confirmedAt     DateTime?
}
```

---

## Phase 2: Config + Clients

### `config.ts`

```typescript
export const PAYMENT_CONFIG = {
  mock: process.env.PAYMENT_MOCK !== "false",  // default: true
  gateway: (process.env.PAYMENT_GATEWAY || "razorpay") as "razorpay" | "phonepe",
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  phonepe: {
    merchantId: process.env.PHONEPE_MERCHANT_ID || "",
    saltKey: process.env.PHONEPE_SALT_KEY || "",
    saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
    apiBase: process.env.PHONEPE_API_BASE || "https://api-preprod.phonepe.com",
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
```

### `razorpay-client.ts`

Mock mode returns fake order IDs. Real mode calls Razorpay API.

```typescript
export async function createOrder(params: {
  amount: number;        // INR
  receipt: string;       // booking ID
}): Promise<{ id: string; amount: number }>

export function verifySignature(
  body: string,
  signature: string
): boolean

export async function fetchPayment(
  paymentId: string
): Promise<{ id: string; status: string; method: string }>

export async function createRefund(
  paymentId: string,
  amount?: number
): Promise<{ id: string }>
```

### `phonepe-client.ts`

```typescript
export async function createPayment(params: {
  amount: number;
  transactionId: string;
  redirectUrl: string;
  callbackUrl: string;
}): Promise<{ paymentLink: string; transactionId: string }>

export function verifyCallback(body: string, header: string): boolean

export async function checkStatus(
  transactionId: string
): Promise<{ state: string; amount: number }>
```

### `mock-handler.ts`

Handles mock payment simulation:

```typescript
// When PAYMENT_MOCK=true:
// 1. createOrder returns { id: "mock_order_xxx", amount }
// 2. User redirected to /payment/success?order_id=mock_order_xxx
// 3. /payment/success page calls /api/webhooks/razorpay with mock payload
// 4. Webhook updates booking to CONFIRMED

export function generateMockOrderId(): string
export function generateMockPaymentId(): string
export function createMockWebhookPayload(orderId: string): {
  orderId: string;
  paymentId: string;
  signature: string;
  status: string;
}
```

---

## Phase 3: Payment Service

### `payment-service.ts`

```typescript
export async function createCheckout(params: {
  bookingId: string;
  amount: number;
  gateway: "razorpay" | "phonepe";
}): Promise<{ checkoutUrl: string; orderId: string }>

export async function handleRazorpayWebhook(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  rawBody: string;
}): Promise<{ success: boolean; bookingId: string }>

export async function handlePhonePeWebhook(params: {
  transactionId: string;
  state: string;
  payload: any;
}): Promise<{ success: boolean; bookingId: string }>

export async function getPaymentStatus(
  bookingId: string
): Promise<{ status: string; amount: number; gateway: string }>

export async function processRefund(
  paymentId: string,
  amount?: number
): Promise<{ success: boolean; refundId: string }>
```

---

## Phase 4: API Routes

### `POST /api/checkout`

```typescript
// Body: { bookingId: string, gateway?: "razorpay" | "phonepe" }
// Returns: { checkoutUrl: string, orderId: string }
// Flow: Create Payment record → Create gateway order → Return checkout URL
```

### `POST /api/webhooks/razorpay`

```typescript
// Headers: X-Razorpay-Signature
// Body: Razorpay webhook payload
// Flow: Verify signature → Update Payment → Update Booking → Return 200
```

### `POST /api/webhooks/phonepe`

```typescript
// Body: PhonePe callback payload
// Flow: Verify checksum → Update Payment → Update Booking → Return 200
```

### `GET /api/payment-status/:id`

```typescript
// Params: id = bookingId
// Returns: { status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", amount: number }
```

---

## Phase 5: Frontend Components

### `CheckoutButton.tsx`

```tsx
// Props: { bookingId, amount, gateway?, onPaymentStart?, onPaymentComplete? }
// On click: POST /api/checkout → window.location.href = checkoutUrl
// Used inside booking modals
```

### `PaymentStatusPage.tsx`

```tsx
// Props: { orderId, bookingId }
// Polls /api/payment-status every 2s for 60s
// Shows: Processing spinner → Confirmed ✓ → Done button
// Shows: Failed → Retry button
```

### `app/payment/success/page.tsx`

```tsx
// Read order_id from query params
// Render PaymentStatusPage
// On mock mode: immediately call webhook to auto-confirm
```

---

## Phase 6: Modify Booking Modals

### `HotelBookingModal.tsx`

Add payment step after "saving":

```
form → blocking → book-confirming → saving → payment → done
                                              ↑
                                    CheckoutButton component
```

The "saving" step creates the booking (status=PENDING). Then show CheckoutButton. On payment success, update booking status to CONFIRMED.

### `FlightBookingModal.tsx`

Same pattern:

```
form → saving → payment → done
```

---

## Phase 7: Admin Payments Page

`admin/payments-page.tsx`:

- Table: Booking, Amount, Gateway, Status, Date, Payment ID
- Filter by status
- Refund button
- Export

---

## Environment Variables

```env
# Mock mode (default: true)
PAYMENT_MOCK=true
PAYMENT_GATEWAY=razorpay

# Razorpay (only needed when PAYMENT_MOCK=false)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# PhonePe (only needed when PAYMENT_GATEWAY=phonepe && PAYMENT_MOCK=false)
PHONEPE_MERCHANT_ID=M1xxxxx
PHONEPE_SALT_KEY=xxxxx
PHONEPE_SALT_INDEX=1
PHONEPE_API_BASE=https://api-preprod.phonepe.com

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Implementation Order

| Step | Task | Est. |
|------|------|------|
| 1 | Schema migration (SQL + Prisma) | 0.5 day |
| 2 | Config + mock handler + Razorpay/PhonePe clients | 1 day |
| 3 | Payment service (createCheckout, webhooks, status) | 1 day |
| 4 | API routes (checkout, webhooks, status) | 0.5 day |
| 5 | CheckoutButton + PaymentStatusPage components | 1 day |
| 6 | Modify HotelBookingModal + FlightBookingModal | 0.5 day |
| 7 | Payment success page | 0.5 day |
| 8 | Admin payments page | 0.5 day |
| 9 | TypeScript check + mock testing | 0.5 day |

**Total: ~6 days**

---

## Verification (Mock Mode)

1. `npx tsc —noEmit` — clean
2. Search hotel → click Book → fill form → click "Pay Now" → redirected to /payment/success
3. /payment/success shows "Processing" → auto-updates to "Confirmed" after 2s
4. My Trips shows booking with paymentStatus=COMPLETED
5. /api/payment-status/:id returns COMPLETED
6. Admin /admin/payments shows the payment record
7. Switch `PAYMENT_MOCK=false` → same flow hits real Razorpay (sandbox)
