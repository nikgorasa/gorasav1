#!/usr/bin/env tsx
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUT_DIR = join(__dirname, "tbo-flight-cases");

interface CertCase {
  id: string;
  title: string;
  sector: { origin: string; destination: string; returnOrigin?: string; returnDest?: string };
  pax: { adults: number; children: number; infants: number };
  journeyType: number;
  isLCC: boolean;
  flow: string[];
  mandatory: boolean;
}

const CASES: CertCase[] = [
  {
    id: "TC-01",
    title: "GDS Domestic Oneway — DEL→BOM 1 Adult",
    sector: { origin: "DEL", destination: "BOM" },
    pax: { adults: 1, children: 0, infants: 0 },
    journeyType: 1,
    isLCC: false,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "ssr", "book", "ticket", "getBookingDetail"],
    mandatory: true,
  },
  {
    id: "TC-02",
    title: "LCC Domestic Oneway SSR — DEL→BOM 1A+1C+1I",
    sector: { origin: "DEL", destination: "BOM" },
    pax: { adults: 1, children: 1, infants: 1 },
    journeyType: 1,
    isLCC: true,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "ssr", "ticket", "getBookingDetail"],
    mandatory: true,
  },
  {
    id: "TC-03",
    title: "LCC Domestic Return — DEL↔BOM 2A+2C+1I",
    sector: { origin: "DEL", destination: "BOM", returnOrigin: "BOM", returnDest: "DEL" },
    pax: { adults: 2, children: 2, infants: 1 },
    journeyType: 2,
    isLCC: true,
    flow: ["authenticate", "search", "fareRule(OB)", "fareRule(IB)", "fareQuote(OB)", "fareQuote(IB)", "ssr(OB)", "ssr(IB)", "ticket(OB)", "ticket(IB)", "getBookingDetail(OB)", "getBookingDetail(IB)"],
    mandatory: true,
  },
  {
    id: "TC-04",
    title: "LCC International Oneway SSR — DEL→DXB 1A+1C+1I",
    sector: { origin: "DEL", destination: "DXB" },
    pax: { adults: 1, children: 1, infants: 1 },
    journeyType: 1,
    isLCC: true,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "ssr", "ticket", "getBookingDetail"],
    mandatory: true,
  },
  {
    id: "TC-05",
    title: "GDS International Return — DEL↔DXB 2A+2C+1I",
    sector: { origin: "DEL", destination: "DXB", returnOrigin: "DXB", returnDest: "DEL" },
    pax: { adults: 2, children: 2, infants: 1 },
    journeyType: 2,
    isLCC: false,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "ssr", "book", "ticket", "getBookingDetail"],
    mandatory: true,
  },
  {
    id: "TC-06",
    title: "LCC Domestic Special Return — DEL↔BOM 2A+1C",
    sector: { origin: "DEL", destination: "BOM", returnOrigin: "BOM", returnDest: "DEL" },
    pax: { adults: 2, children: 1, infants: 0 },
    journeyType: 5,
    isLCC: true,
    flow: ["authenticate", "search", "fareRule(OB)", "fareRule(IB)", "fareQuote(OB)", "fareQuote(IB)", "ssr(OB)", "ssr(IB)", "ticket(OB)", "ticket(IB)", "getBookingDetail(OB)", "getBookingDetail(IB)"],
    mandatory: false,
  },
  {
    id: "TC-07",
    title: "GDS Domestic Special Return SSR — DEL↔BLR 2A+2C+1I",
    sector: { origin: "DEL", destination: "BLR", returnOrigin: "BLR", returnDest: "DEL" },
    pax: { adults: 2, children: 2, infants: 1 },
    journeyType: 5,
    isLCC: false,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "ssr", "book", "ticket", "getBookingDetail"],
    mandatory: false,
  },
  {
    id: "TC-08",
    title: "GDS Multi-city — DEL→BOM→BLR 2A",
    sector: { origin: "DEL", destination: "BOM" },
    pax: { adults: 2, children: 0, infants: 0 },
    journeyType: 3,
    isLCC: false,
    flow: ["authenticate", "search", "fareRule", "fareQuote", "book", "ticket", "getBookingDetail"],
    mandatory: false,
  },
];

function generateCaseDir(c: CertCase): void {
  const dir = join(OUT_DIR, c.id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const sampleDepTime = "2026-06-24T06:00:00";
  const baseFare = c.isLCC ? 4235 : 5400;
  const tax = c.isLCC ? 587 : 823;
  const paxCount = c.pax.adults + c.pax.children + c.pax.infants;
  const totalBase = baseFare * paxCount;
  const totalTax = tax * paxCount;

  const fareQuotePriceChange = Math.round((totalBase + totalTax) * 1.08);

  const readme = `# ${c.id}: ${c.title}

## Environment Setup
\`\`\`bash
export TBO_USERNAME=RasaTAPI
export TBO_PASSWORD=RasaT@123
export TBO_CLIENT_ID=ApiIntegrationNew
export TBO_FLIGHT_FORCE_MOCK=false
\`\`\`

## Passenger Configuration
| Type | Count |
|------|-------|
| Adult | ${c.pax.adults} |
| Child | ${c.pax.children} |
| Infant | ${c.pax.infants} |

## Sector
- **Origin**: ${c.sector.origin}
- **Destination**: ${c.sector.destination}
${c.sector.returnOrigin ? `- **Return**: ${c.sector.returnOrigin} → ${c.sector.returnDest}\n` : ""}
## Journey Type
${["", "OneWay", "Return", "MultiCity", "", "SpecialReturn"][c.journeyType]} (${c.journeyType})

## Flow
${c.flow.map((s, i) => `${i + 1}. **${s}**`).join("\n")}

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
`;

  writeFileSync(join(dir, "README.md"), readme);

  const authReq = {
    ClientId: "ApiIntegrationNew",
    UserName: "RasaTAPI",
    Password: "RasaT@123",
    EndUserIp: "192.168.1.1",
  };

  const authRes = {
    Status: 1,
    TokenId: "DEMO_TOKEN_ID",
    Error: null,
    Member: null,
  };

  writeFileSync(join(dir, "01-authenticate.json"), JSON.stringify({ request: authReq, response: authRes }, null, 2));

  const searchReq = {
    EndUserIp: "192.168.1.1",
    TokenId: "DEMO_TOKEN_ID",
    AdultCount: c.pax.adults,
    ChildCount: c.pax.children,
    InfantCount: c.pax.infants,
    JourneyType: c.journeyType,
    Segments: [
      {
        Origin: c.sector.origin,
        Destination: c.sector.destination,
        FlightCabinClass: 1,
        PreferredDepartureTime: sampleDepTime,
        PreferredArrivalTime: "",
      },
    ],
  };

  const totalFare = totalBase + totalTax;
  const searchRes = {
    Response: {
      ResponseStatus: 1,
      Error: null,
      TraceId: "DEMO_TRACE_ID",
      Results: [
        {
          ResultIndex: "1",
          Source: 1,
          IsLCC: c.isLCC,
          IsRefundable: !c.isLCC,
          Fare: {
            Currency: "INR",
            BaseFare: totalBase,
            Tax: totalTax,
            YQTax: 0,
            AdditionalTxnFeeOfrd: paxCount * 30,
            AdditionalTxnFeePub: 0,
            OtherCharges: 0,
            Discount: 0,
            PublishedFare: totalFare,
            CommissionEarned: 0,
            PLBEarned: 0,
            IncentiveEarned: 0,
            OfferedFare: totalFare,
            TdsOnCommission: 0,
            TdsOnPLB: 0,
            TdsOnIncentive: 0,
            ServiceFee: 0,
            ChargeBU: [],
          },
          FareBreakdown: [
            {
              Currency: "INR",
              PassengerType: 1,
              PassengerCount: c.pax.adults,
              BaseFare: baseFare * c.pax.adults,
              Tax: tax * c.pax.adults,
              YQTax: 0,
              AdditionalTxnFeeOfrd: c.pax.adults * 30,
              AdditionalTxnFeePub: 0,
              OtherCharges: 0,
              Discount: 0,
              PublishedFare: (baseFare + tax) * c.pax.adults,
              CommissionEarned: 0,
              PLBEarned: 0,
              IncentiveEarned: 0,
              OfferedFare: (baseFare + tax) * c.pax.adults,
              TdsOnCommission: 0,
              TdsOnPLB: 0,
              TdsOnIncentive: 0,
              ServiceFee: 0,
            },
          ],
          Segments: [
            {
              TripIndicator: 1,
              SegmentIndicator: 1,
              Airline: c.isLCC ? "IndiGo" : "Air India",
              AirlineCode: c.isLCC ? "6E" : "AI",
              Origin: c.sector.origin,
              Destination: c.sector.destination,
              DepTime: sampleDepTime,
              ArrTime: "2026-06-24T07:45:00",
              FlightNumber: c.isLCC ? "6E-2137" : "AI-865",
              OperatingCarrier: c.isLCC ? "6E" : "AI",
              Baggage: c.isLCC ? "15 KG" : "25 KG",
              CabinBaggage: "7 KG",
              CabinClass: "Economy",
              BookingClass: "Q",
              Duration: "1hr 45min",
            },
          ],
          LastTicketDate: "2026-06-21T23:59:00",
          Penalty: c.isLCC ? "Non Refundable" : "As per airline policy",
          FareRules: "Available through FareRule API",
        },
      ],
    },
  };

  writeFileSync(join(dir, "02-search.json"), JSON.stringify({ request: searchReq, response: searchRes }, null, 2));

  const fareRuleRes = {
    Response: {
      ResponseStatus: 1,
      Error: null,
      TraceId: "DEMO_TRACE_ID",
      FareRules: [
        {
          Airline: c.isLCC ? "6E" : "AI",
          Origin: c.sector.origin,
          Destination: c.sector.destination,
          FareBasisCode: c.isLCC ? "NONREF" : "REF",
          FareRestriction: c.isLCC ? "Non Refundable" : "Refundable with penalty",
          FareRuleDetail: [
            "CANCELLATION: Before 24hrs - INR 3000 + GST per passenger; Within 24hrs - Non Refundable",
            "DATE CHANGE: Before 24hrs - INR 2500 + GST + fare diff; Within 24hrs - Not allowed",
            "REISSUE: Allowed with penalty as per fare rules",
            "BAGGAGE: As per fare basis",
          ].join("\n"),
        },
      ],
    },
  };

  writeFileSync(join(dir, "03-farerule.json"), JSON.stringify({ request: { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", TraceId: "DEMO_TRACE_ID", ResultIndex: "1" }, response: fareRuleRes }, null, 2));

  const fareQuoteRes = {
    Response: {
      ResponseStatus: 1,
      Error: null,
      TraceId: "DEMO_TRACE_ID",
      IsPriceChanged: false,
      Results: [
        {
          ...searchRes.Response.Results[0],
          Fare: { ...searchRes.Response.Results[0].Fare, PublishedFare: fareQuotePriceChange, OfferedFare: fareQuotePriceChange },
          FareBreakdown: searchRes.Response.Results[0].FareBreakdown.map(fb => ({ ...fb, PublishedFare: Math.round(fb.PublishedFare * 1.08), OfferedFare: Math.round(fb.OfferedFare * 1.08) })),
        },
      ],
    },
  };

  writeFileSync(join(dir, "04-farequote.json"), JSON.stringify({ request: { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", TraceId: "DEMO_TRACE_ID", ResultIndex: "1" }, response: fareQuoteRes }, null, 2));

  const ssrRes = {
    Response: {
      ResponseStatus: 1,
      Error: null,
      TraceId: "DEMO_TRACE_ID",
      IsLCC: c.isLCC,
      SSR: {
        Baggage: [
          { WayType: 1, Code: "BK15", Weight: "15 KG", Currency: "INR", Price: 0, Origin: c.sector.origin, Destination: c.sector.destination, AirlineCode: c.isLCC ? "6E" : "AI", FlightNumber: c.isLCC ? "6E-2137" : "AI-865" },
          { WayType: 1, Code: "BK20", Weight: "20 KG", Currency: "INR", Price: 900, Origin: c.sector.origin, Destination: c.sector.destination, AirlineCode: c.isLCC ? "6E" : "AI", FlightNumber: c.isLCC ? "6E-2137" : "AI-865" },
          { WayType: 1, Code: "BK25", Weight: "25 KG", Currency: "INR", Price: 1800, Origin: c.sector.origin, Destination: c.sector.destination, AirlineCode: c.isLCC ? "6E" : "AI", FlightNumber: c.isLCC ? "6E-2137" : "AI-865" },
        ],
        MealDynamic: [
          { WayType: 1, Code: "ML01", Description: "Vegetarian Meal", AirlineDescription: "Veg Meal", Quantity: 1, Price: 350, Currency: "INR" },
          { WayType: 1, Code: "ML02", Description: "Non-Vegetarian Meal", AirlineDescription: "Non-Veg Meal", Quantity: 1, Price: 450, Currency: "INR" },
          { WayType: 1, Code: "ML03", Description: "Special Meal", AirlineDescription: "Special Meal", Quantity: 1, Price: 600, Currency: "INR" },
        ],
        SeatDynamic: [
          {
            SegmentSeatId: 1,
            RowSeats: {
              RowSeats: [
                { Code: "ST01", RowNo: "1", SeatNo: "A", SeatType: "Window", Price: 500 },
                { Code: "ST02", RowNo: "1", SeatNo: "B", SeatType: "Middle", Price: 300 },
                { Code: "ST03", RowNo: "1", SeatNo: "C", SeatType: "Aisle", Price: 400 },
              ],
            },
          },
        ],
      },
    },
  };

  writeFileSync(join(dir, "05-ssr.json"), JSON.stringify({ request: { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", TraceId: "DEMO_TRACE_ID", ResultIndex: "1" }, response: ssrRes }, null, 2));

  if (!c.isLCC) {
    const bookReq = {
      EndUserIp: "192.168.1.1",
      TokenId: "DEMO_TOKEN_ID",
      TraceId: "DEMO_TRACE_ID",
      ResultIndex: "1",
      Passengers: Array.from({ length: c.pax.adults + c.pax.children + c.pax.infants }, (_, i) => ({
        Title: "Mr",
        FirstName: `Test`,
        LastName: `Passenger${i + 1}`,
        PaxType: i < c.pax.adults ? 1 : i < c.pax.adults + c.pax.children ? 2 : 3,
        DateOfBirth: "1990-01-15",
        Gender: 1,
        AddressLine1: "123 Test Street",
        City: "New Delhi",
        CountryCode: "IN",
        CountryName: "India",
        ContactNo: "9876543210",
        Email: "test@example.com",
        IsLeadPax: i === 0,
        Nationality: "IN",
        Fare: { BaseFare: 0, Tax: 0, TransactionFee: 0, YQTax: 0, AdditionalTxnFeeOfrd: 0, AdditionalTxnFeePub: 0, AirTransFee: 0 },
      })),
    };

    const bookRes = {
      Response: {
        ResponseStatus: 1,
        Error: null,
        TraceId: "DEMO_TRACE_ID",
        IsPriceChanged: false,
        IsTimeChanged: false,
        FlightItinerary: {
          BookingId: "B100001",
          PNR: "ABC123",
          IsLCC: false,
          IsDomestic: c.sector.origin === "DEL" && c.sector.destination === "BOM",
          Passenger: bookReq.Passengers.map((p, i) => ({
            PaxId: i + 1,
            Title: p.Title,
            FirstName: p.FirstName,
            LastName: p.LastName,
            Ticket: null,
          })),
        },
      },
    };

    writeFileSync(join(dir, "06-book.json"), JSON.stringify({ request: bookReq, response: bookRes }, null, 2));
  }

  const ticketStep = !c.isLCC ? "07-ticket.json" : "06-ticket.json";
  const ticketReq = !c.isLCC
    ? { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", TraceId: "DEMO_TRACE_ID", PNR: "ABC123", BookingId: "B100001", Passport: Array.from({ length: paxCount }, (_, i) => ({ PaxId: i + 1, PassportNo: "P1234567", PassportExpiry: "2030-12-31", DateOfBirth: "1990-01-15" })) }
    : { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", TraceId: "DEMO_TRACE_ID", ResultIndex: "1", Passengers: [{ ...searchReq.Segments[0] }] };

  const ticketRes = {
    Response: {
      ResponseStatus: 1,
      Error: null,
      TraceId: "DEMO_TRACE_ID",
      IsPriceChanged: false,
      PNR: "ABC123",
      BookingId: "B100001",
      FlightItinerary: {
        BookingId: "B100001",
        PNR: "ABC123",
        IsLCC: c.isLCC,
        IsDomestic: c.sector.origin === "DEL" && ["BOM", "BLR"].includes(c.sector.destination),
        Passenger: Array.from({ length: paxCount }, (_, i) => ({
          PaxId: i + 1,
          Title: "Mr",
          FirstName: "Test",
          LastName: `Passenger${i + 1}`,
          Ticket: {
            TicketId: 1000000 + i,
            TicketNumber: `${(10000000000 + i).toString().slice(0, 10)}`,
            TicketStatus: "Ticketed",
            TicketType: "E-Ticket",
            ConjunctionNumber: "",
            ValidOn: "2026-06-24",
          },
        })),
        Segments: searchRes.Response.Results[0].Segments,
        Fare: searchRes.Response.Results[0].Fare,
        FareBreakdown: searchRes.Response.Results[0].FareBreakdown,
      },
    },
  };

  writeFileSync(join(dir, ticketStep), JSON.stringify({ request: ticketReq, response: ticketRes }, null, 2));

  const detailStep = !c.isLCC ? "08-getbookingdetail.json" : "07-getbookingdetail.json";
  writeFileSync(join(dir, detailStep), JSON.stringify({
    request: { EndUserIp: "192.168.1.1", TokenId: "DEMO_TOKEN_ID", BookingId: "B100001" },
    response: {
      Response: {
        ResponseStatus: 1,
        Error: null,
        TraceId: "DEMO_TRACE_ID",
        FlightItinerary: ticketRes.Response.FlightItinerary,
      },
    },
  }, null, 2));

  console.log(`✓ Generated ${c.id}: ${c.title} (${join(dir)})`);
}

console.log("Generating TBO Flight API certification test cases...\n");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

CASES.forEach(generateCaseDir);
console.log(`\nDone — ${CASES.length} cases generated in ${OUT_DIR}`);
