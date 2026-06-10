import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CERT_DIR = join(__dirname, "tbo-hotel-cases");

const cases = [
  {
    id: "TC-01",
    title: "Domestic — 1 Room, 1 Adult",
    domestic: true,
    rooms: [{ adults: 1, children: 0, childrenAges: [] }],
    city: "Goa",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-02",
    title: "Domestic — 1 Room, 2 Adults + 2 Children",
    domestic: true,
    rooms: [{ adults: 2, children: 2, childrenAges: [5, 8] }],
    city: "Mumbai",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-03",
    title: "Domestic — 2 Rooms, 1 Adult each",
    domestic: true,
    rooms: [
      { adults: 1, children: 0, childrenAges: [] },
      { adults: 1, children: 0, childrenAges: [] },
    ],
    city: "Delhi",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-04",
    title: "Domestic — 2 Rooms (1A+2C / 2A)",
    domestic: true,
    rooms: [
      { adults: 1, children: 2, childrenAges: [4, 7] },
      { adults: 2, children: 0, childrenAges: [] },
    ],
    city: "Jaipur",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-05",
    title: "International — 1 Room, 1 Adult",
    domestic: false,
    rooms: [{ adults: 1, children: 0, childrenAges: [] }],
    city: "Dubai",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-06",
    title: "International — 1 Room, 2 Adults + 2 Children",
    domestic: false,
    rooms: [{ adults: 2, children: 2, childrenAges: [6, 9] }],
    city: "Bangkok",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-07",
    title: "International — 2 Rooms, 1 Adult each",
    domestic: false,
    rooms: [
      { adults: 1, children: 0, childrenAges: [] },
      { adults: 1, children: 0, childrenAges: [] },
    ],
    city: "Singapore",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
  {
    id: "TC-08",
    title: "International — 2 Rooms (1A+2C / 2A)",
    domestic: false,
    rooms: [
      { adults: 1, children: 2, childrenAges: [3, 6] },
      { adults: 2, children: 0, childrenAges: [] },
    ],
    city: "Kuala Lumpur",
    checkIn: "2025-06-20",
    checkOut: "2025-06-22",
  },
];

function main() {
  mkdirSync(CERT_DIR, { recursive: true });

  for (const tc of cases) {
    const dir = join(CERT_DIR, tc.id);
    mkdirSync(dir, { recursive: true });

    const readme = `# ${tc.id}: ${tc.title}

## Test Case Metadata
- **Domain**: ${tc.domestic ? "Domestic (India)" : "International"}
- **City**: ${tc.city}
- **Check-in**: ${tc.checkIn}
- **Check-out**: ${tc.checkOut}
- **Rooms**: ${tc.rooms.length}
- **Passengers**: ${tc.rooms.reduce((s, r) => s + r.adults + r.children, 0)} (${tc.rooms.map(r => `${r.adults}A${r.children > 0 ? `+${r.children}C` : ""}`).join(", ")})

## API Sequence
1. **Authenticate** → Get TokenId (shared with Flight API)
2. **Static Data** (if first time):
   - CountryList → CountryCode=IN
   - CityList(CountryCode=IN) → CityCode for ${tc.city}
   - TBOHotelCodeList(CityCode) → HotelCodes for ${tc.city}
3. **Search** (HotelAPI/Search):
   - HotelCodes from step 2 (comma-separated, max 100)
   - CheckIn/CheckOut: ${tc.checkIn}/${tc.checkOut}
   - PaxRooms: ${JSON.stringify(tc.rooms)}
   - GuestNationality: IN
   - PreferredCurrency: ${tc.domestic ? "INR" : "USD"}
4. **PreBook** (HotelAPI/PreBook):
   - BookingCode from selected room in Search response
   - Returns ValidationInfo (PAN/Passport mandatory flags)
5. **Book** (hotelservice.svc/rest/book/):
   - BookingCode from PreBook
   - HotelRoomsDetails with passenger details per room
   - NetAmount from PreBook
6. **GetBookingDetail** (HotelAPI/GetBookingDetail):
   - BookingId from Book response
   - Full voucher details

## Expected Results
- Search returns hotel results with rooms, BookingCodes, DayRates
- PreBook returns ValidationInfo, NetAmount, TaxBreakup, Amenities
- Book returns ConfirmationNo, BookingRefNo, InvoiceNumber, HotelBookingStatus="Confirmed"
- GetBookingDetail returns full voucher with rooms, passengers, DayRates, PriceBreakup

## Mandatory Fields Checklist
- [ ] TokenId obtained (Status=1)
- [ ] Search returns Status.Code=200
- [ ] At least 1 hotel with rooms returned
- [ ] PreBook returns BookingCode validation
- [ ] Book returns VoucherStatus=true, ResponseStatus=1
- [ ] GetBookingDetail returns complete voucher

## Notes
- All 8 cases are MANDATORY for hotel certification
- TokenId valid 00:00–23:59 UTC, shared across Hotel/Flight APIs
- Hotel Search uses HotelCodes (not CityName like old SOAP)
- PreBook replaces old Block step — simpler contract
- Book at different base URL: HotelBE.tektravels.com
- PAN mandatory for international bookings (ValidationInfo.PanMandatory)
`;

    writeFileSync(join(dir, "README.md"), readme);

    const requestJson = {
      testCaseId: tc.id,
      title: tc.title,
      domestic: tc.domestic,
      checkIn: tc.checkIn,
      checkOut: tc.checkOut,
      city: tc.city,
      rooms: tc.rooms,
      guestNationality: "IN",
      preferredCurrency: tc.domestic ? "INR" : "USD",
    };

    writeFileSync(join(dir, "request.json"), JSON.stringify(requestJson, null, 2));
  }

  console.log(`Generated ${cases.length} certification cases in ${CERT_DIR}`);
}

main();
