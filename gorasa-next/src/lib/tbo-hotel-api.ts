import type {
  TBOCredentials,
  TBOHotelSearchRequest,
  TBOHotelSearchResponse,
  TBOAvailableRoomRequest,
  TBOAvailableRoomResponse,
  TBOBlockRequest,
  TBOBlockResponse,
  TBOBookRequest,
  TBOBookResponse,
  TBOBookingDetailRequest,
  TBOBookingDetailResponse,
} from "./tbo-hotel-types";

const SOAP_NS = "http://www.w3.org/2003/05/soap-envelope";
const HOT_NS = "http://TekTravel/HotelBookingApi";
const WSA_NS = "http://www.w3.org/2005/08/addressing";

const ENDPOINT =
  process.env.TBO_ENDPOINT ||
  "http://api.tbotechnology.in/hotelapi_v7/hotelservice.svc";

function getCredentials(): TBOCredentials {
  return {
    UserName: process.env.TBO_USERNAME || "testuser",
    Password: process.env.TBO_PASSWORD || "testpwd",
  };
}

function buildEnvelope(action: string, bodyXml: string): string {
  const creds = getCredentials();
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_NS}" xmlns:hot="${HOT_NS}">
  <soap:Header xmlns:wsa="${WSA_NS}">
    <hot:Credentials UserName="${escapeXml(creds.UserName)}" Password="${escapeXml(creds.Password)}" />
    <wsa:Action>${HOT_NS}/${action}</wsa:Action>
    <wsa:To>${ENDPOINT}</wsa:To>
  </soap:Header>
  <soap:Body>${bodyXml}</soap:Body>
</soap:Envelope>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function extractXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractXmlAttribute(xml: string, attr: string): string {
  const regex = new RegExp(`${attr}\\s*=\\s*"([^"]*)"`);
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function extractXmlTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function parseHotelSearchResponse(xml: string): TBOHotelSearchResponse {
  const statusXml = extractXmlTag(xml, "Status");
  const hotelResultsXml = extractXmlTag(xml, "HotelResultList");
  const hotelResultXmls = extractXmlTags(hotelResultsXml || xml, "HotelResult");

  const hotelResults = hotelResultXmls.map((hrXml, i) => {
    const infoXml = extractXmlTag(hrXml, "HotelInfo");
    const priceXml = extractXmlTag(hrXml, "MinHotelPrice");
    return {
      ResultIndex: parseInt(extractXmlTag(hrXml, "ResultIndex") || String(i + 1)),
      HotelInfo: {
        HotelCode: extractXmlTag(infoXml, "HotelCode"),
        HotelName: extractXmlTag(infoXml, "HotelName"),
        HotelPicture: extractXmlTag(infoXml, "HotelPicture"),
        HotelDescription: extractXmlTag(infoXml, "HotelDescription"),
        Latitude: parseFloat(extractXmlTag(infoXml, "Latitude") || "0"),
        Longitude: parseFloat(extractXmlTag(infoXml, "Longitude") || "0"),
        HotelAddress: extractXmlTag(infoXml, "HotelAddress"),
        Rating: extractXmlTag(infoXml, "Rating"),
        TripAdvisorRating: parseFloat(extractXmlTag(infoXml, "TripAdvisorRating") || "0"),
        TripAdvisorReviewURL: extractXmlTag(infoXml, "TripAdvisorReviewURL"),
        TagIds: extractXmlTag(infoXml, "TagIds"),
      },
      MinHotelPrice: {
        TotalPrice: parseFloat(extractXmlAttribute(priceXml, "TotalPrice") || "0"),
        Currency: extractXmlAttribute(priceXml, "Currency"),
        OriginalPrice: parseFloat(extractXmlAttribute(priceXml, "OriginalPrice") || "0"),
        B2CRates: extractXmlAttribute(priceXml, "B2CRates") === "true",
      },
      IsPkgProperty: extractXmlTag(hrXml, "IsPkgProperty") === "true",
      IsPackageRate: extractXmlTag(hrXml, "IsPackageRate") === "true",
      MappedHotel: extractXmlTag(hrXml, "MappedHotel") === "true",
    };
  });

  return {
    Status: { StatusCode: extractXmlTag(statusXml, "StatusCode"), Description: extractXmlTag(statusXml, "Description") },
    SessionId: extractXmlTag(xml, "SessionId"),
    CheckInDate: extractXmlTag(xml, "CheckInDate"),
    CheckOutDate: extractXmlTag(xml, "CheckOutDate"),
    NoOfRoomsRequested: parseInt(extractXmlTag(xml, "NoOfRoomsRequested") || "1"),
    RoomGuests: { RoomGuest: [] },
    HotelResultList: { HotelResult: hotelResults },
    ResponseTime: extractXmlTag(xml, "ResponseTime"),
  };
}

function parseRoomResponse(xml: string): TBOAvailableRoomResponse {
  const statusXml = extractXmlTag(xml, "Status");
  const hotelRoomsXml = extractXmlTag(xml, "HotelRooms");
  const roomXmls = extractXmlTags(hotelRoomsXml || xml, "HotelRoom");

  const rooms = roomXmls.map((rXml, i) => {
    const rateXml = extractXmlTag(rXml, "RoomRate");
    const amenityXml = extractXmlTag(rXml, "Amenities");
    return {
      RoomIndex: parseInt(extractXmlTag(rXml, "RoomIndex") || String(i + 1)),
      RoomTypeName: extractXmlTag(rXml, "RoomTypeName"),
      RoomTypeCode: extractXmlTag(rXml, "RoomTypeCode"),
      RatePlanCode: extractXmlTag(rXml, "RatePlanCode"),
      RoomRate: {
        RoomFare: parseFloat(extractXmlAttribute(rateXml, "RoomFare") || "0"),
        RoomTax: parseFloat(extractXmlAttribute(rateXml, "RoomTax") || "0"),
        TotalFare: parseFloat(extractXmlAttribute(rateXml, "TotalFare") || "0"),
        Currency: extractXmlAttribute(rateXml, "Currency"),
        AgentMarkUp: parseFloat(extractXmlAttribute(rateXml, "AgentMarkUp") || "0"),
      },
      Amenities: amenityXml ? { Amenity: extractXmlTags(amenityXml, "Amenity") } : undefined,
    };
  });

  return {
    Status: { StatusCode: extractXmlTag(statusXml, "StatusCode"), Description: extractXmlTag(statusXml, "Description") },
    SessionId: extractXmlTag(xml, "SessionId"),
    HotelRooms: { HotelRoom: rooms },
    HotelCancellationPolicies: extractXmlTag(xml, "HotelCancellationPolicies"),
  };
}

function parseBlockResponse(xml: string): TBOBlockResponse {
  const statusXml = extractXmlTag(xml, "Status");
  const priceChangeXml = extractXmlTag(xml, "PriceChange");
  return {
    Status: { StatusCode: extractXmlTag(statusXml, "StatusCode"), Description: extractXmlTag(statusXml, "Description") },
    PriceChange: { Status: extractXmlAttribute(priceChangeXml, "Status"), AvailableOnNewPrice: extractXmlAttribute(priceChangeXml, "AvailableOnNewPrice") },
    IsPriceChanged: extractXmlTag(xml, "IsPriceChanged") === "true",
    IsCancellationPolicyAvailable: extractXmlTag(xml, "IsCancellationPolicyAvailable") === "true",
    HotelCancellationPolicies: extractXmlTag(xml, "HotelCancellationPolicies"),
  };
}

function parseBookResponse(xml: string): TBOBookResponse {
  const statusXml = extractXmlTag(xml, "Status");
  return {
    Status: { StatusCode: extractXmlTag(statusXml, "StatusCode"), Description: extractXmlTag(statusXml, "Description") },
    BookingStatus: extractXmlTag(xml, "BookingStatus"),
    BookingId: extractXmlTag(xml, "BookingId"),
    ConfirmationNo: extractXmlTag(xml, "ConfirmationNo"),
    TripId: extractXmlTag(xml, "TripId"),
    SupplierReferenceNo: extractXmlTag(xml, "SupplierReferenceNo"),
    PriceChange: {
      Status: extractXmlAttribute(extractXmlTag(xml, "PriceChange"), "Status"),
      AvailableOnNewPrice: extractXmlAttribute(extractXmlTag(xml, "PriceChange"), "AvailableOnNewPrice"),
    },
  };
}

async function callSoap<T>(action: string, bodyXml: string, parser: (xml: string) => T): Promise<T> {
  const envelope = buildEnvelope(action, bodyXml);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/soap+xml; charset=utf-8" },
    body: envelope,
  });

  if (!res.ok) {
    throw new Error(`TBO SOAP error: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return parser(text);
}

function roomGuestsToXml(guests: { AdultCount: number; ChildCount: number; ChildAge?: number[] }[]): string {
  return guests
    .map(
      (g) =>
        `<hot:RoomGuest AdultCount="${g.AdultCount}" ChildCount="${g.ChildCount}">${
          g.ChildAge ? g.ChildAge.map((a) => `<hot:ChildAge><hot:int>${a}</hot:int></hot:ChildAge>`).join("") : ""
        }</hot:RoomGuest>`
    )
    .join("");
}

export async function hotelSearch(req: TBOHotelSearchRequest): Promise<TBOHotelSearchResponse> {
  const body = `
    <hot:HotelSearchRequest>
      <hot:CheckInDate>${req.CheckInDate}</hot:CheckInDate>
      <hot:CheckOutDate>${req.CheckOutDate}</hot:CheckOutDate>
      <hot:CountryName>${escapeXml(req.CountryName)}</hot:CountryName>
      <hot:CityName>${escapeXml(req.CityName)}</hot:CityName>
      ${req.CityId ? `<hot:CityId>${req.CityId}</hot:CityId>` : ""}
      <hot:IsNearBySearchAllowed>${req.IsNearBySearchAllowed}</hot:IsNearBySearchAllowed>
      <hot:NoOfRooms>${req.NoOfRooms}</hot:NoOfRooms>
      <hot:GuestNationality>${req.GuestNationality}</hot:GuestNationality>
      <hot:RoomGuests>${roomGuestsToXml(req.RoomGuests)}</hot:RoomGuests>
      <hot:PreferredCurrencyCode>${req.PreferredCurrencyCode}</hot:PreferredCurrencyCode>
      <hot:ResultCount>${req.ResultCount}</hot:ResultCount>
      ${req.Filters ? `<hot:Filters><hot:StarRating>${req.Filters.StarRating}</hot:StarRating><hot:OrderBy>${req.Filters.OrderBy}</hot:OrderBy></hot:Filters>` : ""}
      <hot:ResponseTime>${req.ResponseTime}</hot:ResponseTime>
    </hot:HotelSearchRequest>`;

  return callSoap("HotelSearch", body, parseHotelSearchResponse);
}

export async function availableHotelRooms(req: TBOAvailableRoomRequest): Promise<TBOAvailableRoomResponse> {
  const body = `
    <hot:HotelRoomAvailabilityRequest>
      <hot:SessionId>${req.SessionId}</hot:SessionId>
      <hot:ResultIndex>${req.ResultIndex}</hot:ResultIndex>
      <hot:HotelCode>${req.HotelCode}</hot:HotelCode>
      <hot:ResponseTime>${req.ResponseTime}</hot:ResponseTime>
    </hot:HotelRoomAvailabilityRequest>`;

  return callSoap("HotelRoomAvailability", body, parseRoomResponse);
}

export async function availabilityAndPricing(req: TBOBlockRequest): Promise<TBOBlockResponse> {
  const roomsXml = req.HotelRooms.HotelRoom.map(
    (r) => `
    <hot:HotelRoom>
      <hot:RoomIndex>${r.RoomIndex}</hot:RoomIndex>
      <hot:RoomTypeName>${escapeXml(r.RoomTypeName)}</hot:RoomTypeName>
      <hot:RoomTypeCode>${escapeXml(r.RoomTypeCode)}</hot:RoomTypeCode>
      <hot:RatePlanCode>${escapeXml(r.RatePlanCode)}</hot:RatePlanCode>
      <hot:RoomRate RoomFare="${r.RoomRate.RoomFare}" RoomTax="${r.RoomRate.RoomTax}" TotalFare="${r.RoomRate.TotalFare}" Currency="${r.RoomRate.Currency}" />
    </hot:HotelRoom>`
  ).join("");

  const body = `
    <hot:AvailabilityAndPricingRequest>
      <hot:SessionId>${req.SessionId}</hot:SessionId>
      <hot:ResultIndex>${req.ResultIndex}</hot:ResultIndex>
      <hot:HotelCode>${req.HotelCode}</hot:HotelCode>
      <hot:HotelName>${escapeXml(req.HotelName)}</hot:HotelName>
      <hot:HotelRooms>${roomsXml}</hot:HotelRooms>
      <hot:ResponseTime>${req.ResponseTime}</hot:ResponseTime>
    </hot:AvailabilityAndPricingRequest>`;

  return callSoap("AvailabilityAndPricing", body, parseBlockResponse);
}

export async function hotelBook(req: TBOBookRequest): Promise<TBOBookResponse> {
  const guestsXml = req.Guests.Guest.map(
    (g) => `
    <hot:Guest LeadGuest="${g.LeadGuest}" GuestType="${g.GuestType}" GuestInRoom="${g.GuestInRoom}">
      <hot:Title>${g.Title}</hot:Title>
      <hot:FirstName>${escapeXml(g.FirstName)}</hot:FirstName>
      <hot:LastName>${escapeXml(g.LastName)}</hot:LastName>
      <hot:Age>${g.Age}</hot:Age>
    </hot:Guest>`
  ).join("");

  const roomsXml = req.HotelRooms.HotelRoom.map(
    (r) => `
    <hot:HotelRoom>
      <hot:RoomIndex>${r.RoomIndex}</hot:RoomIndex>
      <hot:RoomTypeName>${escapeXml(r.RoomTypeName)}</hot:RoomTypeName>
      <hot:RoomTypeCode>${escapeXml(r.RoomTypeCode)}</hot:RoomTypeCode>
      <hot:RatePlanCode>${escapeXml(r.RatePlanCode)}</hot:RatePlanCode>
      <hot:RoomRate RoomFare="${r.RoomRate.RoomFare}" RoomTax="${r.RoomRate.RoomTax}" TotalFare="${r.RoomRate.TotalFare}" Currency="${r.RoomRate.Currency}" />
    </hot:HotelRoom>`
  ).join("");

  const body = `
    <hot:HotelBookRequest>
      <hot:ClientReferenceNumber>${escapeXml(req.ClientReferenceNumber)}</hot:ClientReferenceNumber>
      <hot:GuestNationality>${req.GuestNationality}</hot:GuestNationality>
      <hot:Guests>${guestsXml}</hot:Guests>
      <hot:AddressInfo>
        <hot:AddressLine1>${escapeXml(req.AddressInfo.AddressLine1)}</hot:AddressLine1>
        ${req.AddressInfo.AddressLine2 ? `<hot:AddressLine2>${escapeXml(req.AddressInfo.AddressLine2)}</hot:AddressLine2>` : ""}
        <hot:CountryCode>${req.AddressInfo.CountryCode}</hot:CountryCode>
        <hot:AreaCode>${req.AddressInfo.AreaCode}</hot:AreaCode>
        <hot:PhoneNo>${req.AddressInfo.PhoneNo}</hot:PhoneNo>
        <hot:Email>${req.AddressInfo.Email}</hot:Email>
        <hot:City>${escapeXml(req.AddressInfo.City)}</hot:City>
        <hot:State>${escapeXml(req.AddressInfo.State)}</hot:State>
        <hot:Country>${escapeXml(req.AddressInfo.Country)}</hot:Country>
        <hot:ZipCode>${req.AddressInfo.ZipCode}</hot:ZipCode>
      </hot:AddressInfo>
      <hot:PaymentInfo VoucherBooking="${req.PaymentInfo.VoucherBooking}" PaymentModeType="${req.PaymentInfo.PaymentModeType}" />
      <hot:SessionId>${req.SessionId}</hot:SessionId>
      <hot:NoOfRooms>${req.NoOfRooms}</hot:NoOfRooms>
      <hot:ResultIndex>${req.ResultIndex}</hot:ResultIndex>
      <hot:HotelCode>${req.HotelCode}</hot:HotelCode>
      <hot:HotelName>${escapeXml(req.HotelName)}</hot:HotelName>
      <hot:HotelRooms>${roomsXml}</hot:HotelRooms>
    </hot:HotelBookRequest>`;

  return callSoap("HotelBook", body, parseBookResponse);
}
