# TC-08: GDS Multi-city — DEL→BOM→BLR 2A

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
| Child | 0 |
| Infant | 0 |

## Sector
- **Origin**: DEL
- **Destination**: BOM

## Journey Type
MultiCity (3)

## Flow
1. **authenticate**
2. **search**
3. **fareRule**
4. **fareQuote**
5. **book**
6. **ticket**
7. **getBookingDetail**

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
