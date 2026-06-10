# TC-04: LCC International Oneway SSR — DEL→DXB 1A+1C+1I

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
| Adult | 1 |
| Child | 1 |
| Infant | 1 |

## Sector
- **Origin**: DEL
- **Destination**: DXB

## Journey Type
OneWay (1)

## Flow
1. **authenticate**
2. **search**
3. **fareRule**
4. **fareQuote**
5. **ssr**
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
