# TC-03: LCC Domestic Return — DEL↔BOM 2A+2C+1I

## Environment Setup
```bash
export TBO_USERNAME=RasaTAPI
export TBO_PASSWORD=RasaT@123
export TBO_CLIENT_ID=ApiIntegrationNew
export TBO_FLIGHT_FORCE_MOCK=false
```

## Passenger Configuration
| Type | Count |
|------|-------|
| Adult | 2 |
| Child | 2 |
| Infant | 1 |

## Sector
- **Origin**: DEL
- **Destination**: BOM
- **Return**: BOM → DEL

## Journey Type
Return (2)

## Flow
1. **authenticate**
2. **search**
3. **fareRule(OB)**
4. **fareRule(IB)**
5. **fareQuote(OB)**
6. **fareQuote(IB)**
7. **ssr(OB)**
8. **ssr(IB)**
9. **ticket(OB)**
10. **ticket(IB)**
11. **getBookingDetail(OB)**
12. **getBookingDetail(IB)**

## API Endpoints Used
| Step | Method | URL |
|------|--------|-----|
| Authenticate | POST | http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate |
| Search | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search |
| FareRule | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule |
| FareQuote | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote |
| SSR | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR |
| Book | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book |
| Ticket | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket |
| GetBookingDetails | POST | http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails |

## API Request/Response Logs

See the individual JSON files for each step.
