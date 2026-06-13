# Indian Hotel Booking Compliance — Research & Implementation Guide

## Executive Summary

This document covers the compliance requirements for collecting and transmitting guest identity information (primarily PAN card) during hotel bookings on the GoRASA platform. It combines **Indian regulatory requirements**, **TBO API specifications**, and **industry best practices** from leading Indian OTAs.

---

## Part 1: Indian Regulatory Requirements

### 1.1 PAN Card for Hotel Bookings

**Legal Basis:** Income Tax Act, 1961 — Section 139A & Rule 114B

| Requirement | Details |
|-------------|---------|
| **Who must collect PAN** | Hotels with turnover >₹1 crore (all hotels via TBO qualify) |
| **When to collect** | At time of booking or check-in |
| **Which guests** | Lead guest (primary booker). Additional guests if hotel requires. |
| **What to collect** | PAN number of the guest. Format: `^[A-Z]{5}[0-9]{4}[A-Z]$` (10 chars) |
| **Why** | Hotels must report room rent to Income Tax department. PAN links the transaction to the guest. |
| **Penalty for non-compliance** | ₹10,000 per instance under Section 272B |
| **Exceptions** | Government bookings (with official ID), prepaid travel vouchers, foreign guests (passport instead) |

**PAN Format Validation:**
```
^[A-Z]{5}[0-9]{4}[A-Z]$
  │     │  │    │
  │     │  │    └── 1st character: A-Z (check digit)
  │     │  └─────── 4 digits (0-9)
  │     └────────── 5 letters: A-Z (first 4 = issuer code, 5th = entity type)
  └──────────────── Prefix: Always 5 letters (A-L for most entities)
```

**Examples:**
- Valid: `ABCDE1234F`, `QRSTU5678G`, `AAAAB1234C`
- Invalid: `12345ABCDE` (starts with number), `ABCD1234` (too short), `ABCDE12345` (too long)

### 1.2 Passport for Foreign Nationals

**Legal Basis:** Foreigners Act, 1946 + Registration of Foreigners Rules, 1992

| Requirement | Details |
|-------------|---------|
| **Who must collect** | Hotels hosting foreign nationals |
| **What to collect** | Passport number, nationality, visa details |
| **When** | At check-in (but booking platform should collect early) |
| **Reporting** | Form C must be submitted to local police within 24 hours of check-in |
| **Penalty** | Up to ₹5,000 fine + 3 months imprisonment for hotel |

### 1.3 Form C / C-Form (Foreigners Registration)

**Legal Basis:** Foreigners Act, 1946 + State Police Acts

| Form | When Required | Who Submits | Deadline |
|------|--------------|-------------|----------|
| **Form C** | Every foreign guest check-in | Hotel manager | Within 24 hours to local police station |
| **C-Form** | Online submission (some states) | Hotel manager | Within 24 hours |
| **Form F** | Foreigners staying >180 days | Guest themselves | Within 30 days to FRRO |

**Information required in Form C:**
- Guest name (as on passport)
- Passport number
- Nationality
- Visa type and number
- Date of arrival
- Hotel name and address
- Room number
- Purpose of visit

### 1.4 GST Compliance

**Legal Basis:** CGST Act, 2017 + State GST Acts

| Hotel Category | GST Rate | Conditions |
|---------------|----------|------------|
| Room rate ≤₹7,500/night | **5%** (no ITC) | Most budget/mid-segment hotels |
| Room rate >₹7,500/night | **18%** (with ITC) | Premium/luxury hotels |
| Restaurants in hotels | **5%** (no ITC) | Standalone restaurant in hotel premises |

**GST on hotel bookings requires:**
- GSTIN of the hotel (already provided by TBO in response)
- HSN code for accommodation services (9963)
- Invoice with GST breakup (already implemented in GoRASA's InvoiceModal)

### 1.5 State-Specific Requirements

| State | Additional Requirement |
|-------|----------------------|
| **Maharashtra** | Police verification for foreigners (Form C mandatory) |
| **Delhi** | Hotel registration under Delhi Police Act |
| **Karnataka** | Tourist police registration |
| **Kerala** | Police clearance for foreigners |
| **Rajasthan** | Hotel license under Rajasthan Tourism Act |
| **Goa** | Additional registration for foreigners |
| **Jammu & Kashmir** | Special permit required for foreigners |

### 1.6 Data Privacy Considerations

**Legal Basis:** Digital Personal Data Protection Act, 2023 (DPDPA)

| Requirement | Implementation |
|-------------|---------------|
| **Consent** | Must obtain explicit consent before collecting PAN/passport |
| **Purpose limitation** | Collect only for booking compliance, don't use for marketing |
| **Data minimization** | Store only required fields (PAN, not full ID card scan) |
| **Security** | Encrypt PAN at rest, mask in UI (show only last 4 chars) |
| **Retention** | Delete after statutory period (typically 7 years for tax records) |
| **Breach notification** | Notify DPBI within 72 hours of breach |

---

## Part 2: TBO API Specifications

### 2.1 TBO Hotel Book API — Passenger Fields

The TBO Book API (`POST /TBOHolidays_HotelAPI/Book`) accepts these passenger fields:

```json
{
  "HotelRoomsDetails": [{
    "HotelPassenger": [{
      "Title": "Mr",
      "FirstName": "John",
      "LastName": "Doe",
      "PaxType": 1,
      "LeadPassenger": true,
      "Age": 30,
      "Email": "john@example.com",
      "Phoneno": "9876543210",
      "PassportNo": "A1234567",
      "PassportExpiry": "2028-12-31",
      "PAN": "ABCDE1234F",
      "AddressLine1": "123 Main Street",
      "City": "Mumbai",
      "CountryCode": "IN",
      "CountryName": "India",
      "Nationality": "IN"
    }]
  }]
}
```

**Field Requirements by Guest Type:**

| Field | Domestic Indian | Foreign National | Notes |
|-------|----------------|-----------------|-------|
| `Title` | Required | Required | Mr/Mrs/Ms/Dr |
| `FirstName` | Required | Required | As on ID |
| `LastName` | Required | Required | As on ID |
| `PaxType` | Required | Required | 1=Adult, 2=Child |
| `LeadPassenger` | Required | Required | true for one guest per room |
| `Age` | Required | Required | Integer |
| `Email` | Required | Required | Booking confirmation |
| `Phoneno` | Required | Required | 10-digit mobile |
| `PAN` | **Mandatory** | Optional | 10-char alphanumeric |
| `PassportNo` | Optional | **Mandatory** | As on passport |
| `PassportExpiry` | Optional | **Mandatory** | YYYY-MM-DD |
| `Nationality` | Optional | **Mandatory** | 2-letter country code |
| `AddressLine1` | Optional | Optional | Street address |
| `City` | Optional | Optional | City name |
| `CountryCode` | Optional | Optional | 2-letter code (IN, US, etc.) |

### 2.2 TBO PreBook API — ValidationInfo

The TBO PreBook API (`POST /TBOHolidays_HotelAPI/PreBook`) returns `ValidationInfo`:

```json
{
  "Status": { "Code": 200, "Description": "Success" },
  "ValidationInfo": {
    "PanMandatory": true,
    "PanPassport": false,
    "PassportMandatory": false
  },
  "NetAmount": 5250.00,
  "TraceId": "abc123"
}
```

**ValidationInfo Flags:**

| Flag | Meaning | Action Required |
|------|---------|----------------|
| `PanMandatory: true` | Hotel requires PAN for booking | Must collect PAN before proceeding |
| `PassportMandatory: true` | Hotel requires passport (foreign hotels) | Must collect passport before proceeding |
| `PanPassport: true` | Either PAN or passport accepted | Collect at least one |
| All `false` | No ID proof required | Proceed without ID (but GoRASA requires PAN anyway) |

**Important:** TBO's `ValidationInfo` tells us what the *hotel* requires. GoRASA's policy is PAN *always* mandatory for domestic bookings, regardless of what TBO says. We should still check `ValidationInfo` for international hotels.

### 2.3 TBO Book API — Response

```json
{
  "BookResult": {
    "ResponseStatus": 1,
    "HotelBookingStatus": "Confirmed",
    "ConfirmationNo": "TBO-123456",
    "BookingRefNo": "REF789",
    "BookingId": 12345,
    "InvoiceNumber": "INV-001",
    "IsPriceChanged": false
  }
}
```

**Note:** The Book response does NOT return the PAN/passport back. The identity data is one-way: collected from guest → sent to TBO → stored in our DB.

### 2.4 TBO Booking Detail API — Passenger Data

When fetching booking details, TBO returns:

```json
{
  "BookingDetail": {
    "Rooms": [{
      "HotelPassenger": [{
        "Title": "Mr",
        "FirstName": "John",
        "LastName": "Doe",
        "PAN": "ABCDE1234F",
        "PassportNo": ""
      }]
    }]
  }
}
```

The `PAN` and `PassportNo` fields are returned in the booking detail — confirming TBO stores and returns this data.

---

## Part 3: Industry Best Practices

### 3.1 How Leading Indian OTAs Handle PAN Collection

#### MakeMyTrip
- **When:** During booking flow, after room selection
- **Required:** PAN of lead guest for all domestic hotel bookings
- **Validation:** Real-time format check (`^[A-Z]{5}[0-9]{4}[A-Z]$`)
- **Save option:** "Save this PAN for future bookings" checkbox
- **Profile integration:** PAN stored in traveller profile, auto-filled on next booking
- **Display:** PAN masked in UI (shows `ABCDE****F`)
- **Error handling:** Clear error message: "Please enter a valid 10-character PAN number"

#### Goibibo
- **When:** During booking flow (same as MakeMyTrip — same parent company)
- **Required:** PAN for domestic, Passport for international
- **Validation:** Format + checksum validation
- **Save option:** Traveller vault with PAN
- **Auto-fill:** From saved travellers

#### Yatra
- **When:** Guest details step of booking
- **Required:** PAN for domestic hotels
- **Validation:** Format check + mandatory field
- **Save option:** "Save as frequent traveller"
- **Profile integration:** Traveller list with PAN

#### ClearTrip
- **When:** During booking
- **Required:** PAN for domestic
- **Validation:** Format validation
- **Save option:** Traveller profile

### 3.2 Common UX Patterns

#### Pattern 1: Inline Validation
```
PAN Card Number: [ABCDE1234F]
                  ✓ Valid PAN format
```
**Pros:** Immediate feedback, fewer errors
**Cons:** More complex implementation

#### Pattern 2: Submit-time Validation
```
PAN Card Number: [ABCDE123]
                  ✗ PAN must be exactly 10 characters
```
**Pros:** Simpler implementation
**Cons:** User fills entire form, then errors

#### Pattern 3: Masked Display with Edit
```
PAN: ABCDE****F [Edit]
```
**Pros:** Privacy, reduces re-entry
**Cons:** Need edit flow

### 3.3 Save-to-Vault Pattern

**Industry standard flow:**
1. User enters PAN during first booking
2. Checkbox: "Save PAN to my profile for faster bookings"
3. On success, PAN saved to user profile (encrypted)
4. Next booking: PAN auto-filled from profile
5. User can edit/remove PAN from profile settings

**Data structure (typical):**
```json
{
  "travellers": [{
    "id": "t1",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "dateOfBirth": "1990-01-15",
    "pan": "ABCDE1234F",
    "passport": "A1234567",
    "passportExpiry": "2028-12-31",
    "nationality": "IN",
    "isPrimary": true
  }]
}
```

### 3.4 Security Best Practices

| Practice | Implementation |
|----------|---------------|
| **Mask PAN in UI** | Show only last 4 chars: `ABCDE****F` |
| **Encrypt at rest** | Store encrypted in DB, decrypt only when sending to TBO |
| **No PAN in logs** | Never log PAN in server logs or analytics |
| **Transport security** | HTTPS only (already done via Vercel) |
| **Access control** | Only authenticated user can view their own PAN |
| **Audit trail** | Log who accessed PAN and when |
| **Data retention** | Delete after statutory period (7 years for tax) |

### 3.5 Error Handling Best Practices

| Error | Message | Action |
|-------|---------|--------|
| Empty PAN | "PAN card number is required for hotel bookings" | Block submission |
| Invalid format | "Please enter a valid 10-character PAN (e.g., ABCDE1234F)" | Block submission |
| TBO rejects PAN | "The hotel requires a valid PAN card. Please verify your PAN." | Show error, allow retry |
| Network error | "Unable to verify PAN. Please try again." | Retry option |
| Profile save fails | "Booking confirmed! We couldn't save your PAN. You can add it from your profile." | Don't block booking |

---

## Part 4: GoRASA Implementation Recommendations

### 4.1 Compliance Matrix

| Requirement | Current State | Target State | Priority |
|-------------|--------------|--------------|----------|
| PAN collection in booking modal | ❌ Not collected | ✅ Mandatory field | **P0** |
| PAN sent to TBO Book API | ❌ Not sent | ✅ Included in passenger data | **P0** |
| PAN stored in Booking table | ❌ No field | ✅ `leadGuestPan` column | **P0** |
| PAN format validation | ❌ None | ✅ Regex + real-time feedback | **P0** |
| Save PAN to profile | ❌ Not supported | ✅ Opt-in checkbox | **P1** |
| Auto-fill from profile | ❌ Not supported | ✅ Pre-fill on modal open | **P1** |
| PAN masked in UI | ❌ N/A | ✅ Show `ABCDE****F` | **P1** |
| Profile traveller vault PAN | ❌ No PAN field | ✅ Add to traveller form | **P1** |
| Passport for foreigners | ❌ Not supported | ✅ Conditional on nationality | **P2** |
| Form C generation | ❌ Not implemented | ✅ Future phase | **P2** |
| PreBook validationInfo check | ❌ Ignored | ✅ Check before proceeding | **P2** |

### 4.2 Recommended Implementation Approach

**Phase 1 (P0 — Immediate):**
1. Add PAN field to HotelBookingModal (mandatory, format-validated)
2. Send PAN to TBO Book API via `bookHotel()` client
3. Store PAN in Booking table (`leadGuestPan` column)
4. Fix the pre-existing TBO payload format bug

**Phase 2 (P1 — Soon after):**
5. Add "Save PAN to profile" checkbox
6. Auto-fill PAN from saved profile
7. Add PAN field to Profile → Saved Travellers
8. Mask PAN in booking details display

**Phase 3 (P2 — Future):**
9. Add passport fields for international guests
10. Check PreBook `validationInfo` before proceeding
11. Generate Form C for foreign nationals
12. Profile traveller vault with full identity fields

### 4.3 PAN Validation Rules

```typescript
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function validatePAN(pan: string): { valid: boolean; error?: string } {
  const trimmed = pan.trim().toUpperCase();
  
  if (!trimmed) {
    return { valid: false, error: "PAN card number is required" };
  }
  
  if (trimmed.length !== 10) {
    return { valid: false, error: "PAN must be exactly 10 characters" };
  }
  
  if (!PAN_REGEX.test(trimmed)) {
    return { valid: false, error: "Invalid PAN format. Expected: ABCDE1234F" };
  }
  
  // Fourth character indicates entity type
  const entityType = trimmed[3];
  const validEntityTypes = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'P', 'T'];
  if (!validEntityTypes.includes(entityType)) {
    return { valid: false, error: "Invalid PAN — check the 4th character" };
  }
  
  return { valid: true };
}
```

### 4.4 Database Schema Changes

```sql
-- Add PAN column to Booking table
ALTER TABLE "Booking" ADD COLUMN "leadGuestPan" TEXT;

-- Optional: Add index for compliance queries
CREATE INDEX idx_booking_pan ON "Booking" ("leadGuestPan") WHERE "leadGuestPan" IS NOT NULL;
```

### 4.5 Profile Traveller Schema (JSON)

```json
{
  "id": "t1",
  "name": "John Doe",
  "relation": "Self",
  "gender": "Male",
  "passport": "A1234567",
  "pan": "ABCDE1234F",
  "passportExpiry": "2028-12-31",
  "nationality": "IN",
  "dateOfBirth": "1990-01-15"
}
```

### 4.6 API Changes Summary

| Endpoint | Change |
|----------|--------|
| `POST /api/tbo-hotels` (book action) | Accept `pan` in passenger data |
| `POST /api/bookings` | Accept + store `leadGuestPan` |
| `PATCH /api/profile` | Accept `pan` in passengers JSON |

---

## Part 5: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TBO rejects booking without PAN | High | Booking fails | Always collect PAN before book call |
| User enters invalid PAN | Medium | TBO rejects | Client-side validation before submission |
| PAN data breach | Low | Regulatory penalty + reputation | Encrypt at rest, mask in UI, no logging |
| Profile PAN stale | Low | Wrong PAN sent to TBO | Allow edit from profile |
| International hotel requires passport | Medium | Booking fails | Check validationInfo, collect passport if needed |
| User refuses to provide PAN | Low | Can't complete booking | Clear messaging: "PAN is mandatory for Indian hotel bookings" |

---

## Part 6: Testing Checklist

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Submit booking with valid PAN | Booking succeeds, PAN in TBO request |
| 2 | Submit without PAN | Blocked — validation error |
| 3 | Submit with lowercase PAN (`abcde1234f`) | Auto-uppers to `ABCDE1234F`, succeeds |
| 4 | Submit with invalid PAN (`12345ABCDE`) | Blocked — format error |
| 5 | Submit with short PAN (`ABCDE12`) | Blocked — length error |
| 6 | Check "Save PAN to profile" | PAN saved to user profile |
| 7 | Next booking with saved profile | PAN auto-filled |
| 8 | Edit PAN in profile | Updated successfully |
| 9 | View booking in My Trips | PAN masked (`ABCDE****F`) |
| 10 | Network error during save | Booking still succeeds, PAN not saved |

---

## References

1. **Income Tax Act, 1961** — Section 139A, Rule 114B (PAN requirements)
2. **Foreigners Act, 1946** — Sections 3-5 (registration requirements)
3. **Registration of Foreigners Rules, 1992** — Rule 4 (Form C)
4. **CGST Act, 2017** — Section 11 (hotel GST rates)
5. **Digital Personal Data Protection Act, 2023** — Data privacy requirements
6. **TBO Hotel API Documentation** — Book API passenger fields
7. **MakeMyTrip** — PAN collection UX patterns
8. **Goibibo** — Traveller vault implementation
9. **Yatra** — Profile integration patterns
