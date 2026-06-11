# ADR-20260611-002: Hotel REST API Rewrite

## Status
Accepted

## Context
**Legacy SOAP v7 endpoint is dead:** `http://api.tbotechnology.in/hotelapi_v7/hotelservice.svc` returns HTTP 200 with empty body.

**TBO now provides JSON REST API** documented at `http://apidoc.tektravels.com/hotelnew/` with different endpoints, request/response shapes, and flow.

**Key Differences from SOAP:**

| Legacy SOAP | New REST |
|-------------|----------|
| Search by `CityName` | Search by `HotelCodes` (from static data) |
| Separate room availability call | Rooms inline in Search response |
| `Block` (AvailabilityAndPricing) | `PreBook(BookingCode)` — simpler contract |
| Book with `SessionId` + full room block | Book with `BookingCode` + pax per room |
| Auth in SOAP header | Explicit `Authenticate` → `TokenId` |
| Single endpoint | 3 base URLs |

**New REST Endpoints:**
- Authenticate: `http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate` (same as Flight)
- Search: `https://affiliate.tektravels.com/HotelAPI/Search`
- PreBook: `https://affiliate.tektravels.com/HotelAPI/PreBook`
- Book: `https://HotelBE.tektravels.com/hotelservice.svc/rest/book/`
- GetBookingDetail: `https://affiliate.tektravels.com/HotelAPI/GetBookingDetail`
- Static Data (GET): `http://api.tbotechnology.in/TBOHolidays_HotelAPI/{CountryList,CityList,TBOHotelCodeList,HotelDetails}`

## Decision
Rewrite following **Flight API pattern** (proven, working):

```
tbo-hotel-types.ts   → All REST request/response/display types + backward-compat aliases
tbo-hotel-api.ts     → Raw HTTP fetch client (6 API + 4 static data functions)
tbo-hotel-mock.ts    → Mock data for 18 hotels across 9 cities with Unsplash images
tbo-hotel-client.ts  → Orchestrator: token caching, static data cache, try→catch→mock fallback
api/tbo-hotels/route.ts → Next.js API route with 8 POST actions
```

**New API Route Actions:**
- `search` — HotelCodes, CheckIn/Out, PaxRooms, GuestNationality
- `pre-book` — BookingCode from Search
- `book` — BookingCode, HotelRoomsDetails with HotelPassenger[]
- `booking-detail` — BookingId
- `static-data/countries` — CountryList
- `static-data/cities` — CityList by CountryCode
- `static-data/hotel-codes` — HotelCodeList by CityCode

**Backward Compatibility:**
- Old `/api/tbo` route updated to call new client (existing frontend unchanged)
- `TBODisplayHotel` / `TBODisplayRoom` type aliases added
- 8 certification cases generated in `scripts/tbo-hotel-cases/TC-01` through `TC-08`

**Certification Cases (8 mandatory):**
1. Domestic — 1 Room, 1 Adult (Goa)
2. Domestic — 1 Room, 2 Adults + 2 Children (Mumbai)
3. Domestic — 2 Rooms, 1 Adult each (Delhi)
4. Domestic — 2 Rooms (1A+2C / 2A) (Jaipur)
5. International — 1 Room, 1 Adult (Dubai)
6. International — 1 Room, 2 Adults + 2 Children (Bangkok)
7. International — 2 Rooms, 1 Adult each (Singapore)
8. International — 2 Rooms (1A+2C / 2A) (Kuala Lumpur)

## Consequences
- ✅ Modern JSON REST API replacing dead SOAP endpoint
- ✅ Consistent pattern with Flight API (maintainable)
- ✅ Mock-first development (works without credentials)
- ✅ Shared TokenId with Flight API (00:00–23:59 UTC)
- ✅ Backward compatible with existing frontend
- ⚠️ Old SOAP client code remains but deprecated
- ⚠️ Requires TBO credential activation for live testing

## Verification
- TypeScript compiles with 0 errors
- Next.js build successful
- All 8 hotel API actions return mock data with Unsplash images
- All 7 flight API actions still work
- Old `/api/tbo` route backward compatible

## Author
Agent (Architect/DevOps Guardian) — 2026-06-11