# TC-05: GDS International Return — DEL↔DXB 2A+2C+1I

## Environment Setup
```bash
export TBO_USERNAME=RasaT
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
- **Destination**: DXB
- **Return**: DXB → DEL

## Journey Type
Return (2)

## Flow
1. **authenticate**
2. **search**
3. **fareRule**
4. **fareQuote**
5. **ssr**
6. **book**
7. **ticket**
8. **getBookingDetail**

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
