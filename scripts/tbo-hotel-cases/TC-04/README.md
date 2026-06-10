# TC-04: Domestic — 2 Rooms (1A+2C / 2A)

## Test Case Metadata
- **Domain**: Domestic (India)
- **City**: Jaipur
- **Check-in**: 2025-06-20
- **Check-out**: 2025-06-22
- **Rooms**: 2
- **Passengers**: 5 (1A+2C, 2A)

## API Sequence
1. **Authenticate** → Get TokenId (shared with Flight API)
2. **Static Data** (if first time):
   - CountryList → CountryCode=IN
   - CityList(CountryCode=IN) → CityCode for Jaipur
   - TBOHotelCodeList(CityCode) → HotelCodes for Jaipur
3. **Search** (HotelAPI/Search):
   - HotelCodes from step 2 (comma-separated, max 100)
   - CheckIn/CheckOut: 2025-06-20/2025-06-22
   - PaxRooms: [{"adults":1,"children":2,"childrenAges":[4,7]},{"adults":2,"children":0,"childrenAges":[]}]
   - GuestNationality: IN
   - PreferredCurrency: INR
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
