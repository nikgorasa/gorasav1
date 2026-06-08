export interface TBOCredentials {
  UserName: string;
  Password: string;
}

export interface TBOStatus {
  StatusCode: string;
  Description: string;
}

export interface TBORoomGuest {
  AdultCount: number;
  ChildCount: number;
  ChildAge?: number[];
}

export interface TBOHotelSearchRequest {
  CheckInDate: string;
  CheckOutDate: string;
  CountryName: string;
  CityName: string;
  CityId?: string;
  IsNearBySearchAllowed: boolean;
  NoOfRooms: number;
  GuestNationality: string;
  RoomGuests: TBORoomGuest[];
  PreferredCurrencyCode: string;
  ResultCount: number;
  Filters?: {
    StarRating: string;
    OrderBy: string;
  };
  ResponseTime: number;
}

export interface TBOHotelInfo {
  HotelCode: string;
  HotelName: string;
  HotelPicture: string;
  HotelDescription: string;
  Latitude: number;
  Longitude: number;
  HotelAddress: string;
  Rating: string;
  TripAdvisorRating: number;
  TripAdvisorReviewURL: string;
  HotelPromotion?: string;
  TagIds?: string;
}

export interface TBOMinHotelPrice {
  TotalPrice: number;
  Currency: string;
  OriginalPrice: number;
  B2CRates: boolean;
}

export interface TBOHotelResult {
  ResultIndex: number;
  HotelInfo: TBOHotelInfo;
  MinHotelPrice: TBOMinHotelPrice;
  IsPkgProperty: boolean;
  IsPackageRate: boolean;
  MappedHotel: boolean;
}

export interface TBOHotelSearchResponse {
  Status: TBOStatus;
  SessionId: string;
  CheckInDate: string;
  CheckOutDate: string;
  NoOfRoomsRequested: number;
  RoomGuests: { RoomGuest: TBORoomGuest[] };
  HotelResultList: { HotelResult: TBOHotelResult[] };
  ResponseTime: string;
}

export interface TBOAvailableRoomRequest {
  SessionId: string;
  ResultIndex: number;
  HotelCode: string;
  ResponseTime: number;
}

export interface TBOHotelRoom {
  RoomIndex: number;
  RoomTypeName: string;
  RoomTypeCode: string;
  RatePlanCode: string;
  RoomRate: {
    RoomFare: number;
    RoomTax: number;
    TotalFare: number;
    Currency: string;
    AgentMarkUp?: number;
  };
  Amenities?: { Amenity: string[] };
  Supplements?: {
    SuppInfo: {
      SuppID: string;
      SuppChargeType: string;
      Price: number;
      SuppIsSelected: boolean;
    }[];
  };
}

export interface TBOAvailableRoomResponse {
  Status: TBOStatus;
  SessionId: string;
  HotelRooms: { HotelRoom: TBOHotelRoom[] };
  HotelCancellationPolicies?: string;
}

export interface TBOBlockRequest {
  SessionId: string;
  ResultIndex: number;
  HotelCode: string;
  HotelName: string;
  HotelRooms: {
    HotelRoom: {
      RoomIndex: number;
      RoomTypeName: string;
      RoomTypeCode: string;
      RatePlanCode: string;
      RoomRate: {
        RoomFare: number;
        RoomTax: number;
        TotalFare: number;
        Currency: string;
      };
    }[];
  };
  ResponseTime: number;
}

export interface TBOBlockResponse {
  Status: TBOStatus;
  PriceChange: { Status: string; AvailableOnNewPrice: string };
  IsPriceChanged: boolean;
  IsCancellationPolicyAvailable: boolean;
  HotelCancellationPolicies: string;
}

export interface TBOBookRequest {
  ClientReferenceNumber: string;
  GuestNationality: string;
  Guests: {
    Guest: {
      Title: string;
      FirstName: string;
      LastName: string;
      Age: number;
      LeadGuest: boolean;
      GuestType: string;
      GuestInRoom: number;
    }[];
  };
  AddressInfo: {
    AddressLine1: string;
    AddressLine2?: string;
    CountryCode: string;
    AreaCode: string;
    PhoneNo: string;
    Email: string;
    City: string;
    State: string;
    Country: string;
    ZipCode: string;
  };
  PaymentInfo: {
    VoucherBooking: boolean;
    PaymentModeType: string;
  };
  SessionId: string;
  NoOfRooms: number;
  ResultIndex: number;
  HotelCode: string;
  HotelName: string;
  HotelRooms: {
    HotelRoom: {
      RoomIndex: number;
      RoomTypeName: string;
      RoomTypeCode: string;
      RatePlanCode: string;
      RoomRate: {
        RoomFare: number;
        RoomTax: number;
        TotalFare: number;
        Currency: string;
      };
    }[];
  };
}

export interface TBOBookResponse {
  Status: TBOStatus;
  BookingStatus: string;
  BookingId: string;
  ConfirmationNo: string;
  TripId: string;
  SupplierReferenceNo: string;
  PriceChange: { Status: string; AvailableOnNewPrice: string };
}

export interface TBOBookingDetailRequest {
  BookingId?: string;
  ClientReferenceNumber?: string;
}

export interface TBOBookingDetailResponse {
  Status: TBOStatus;
  BookingStatus: string;
  BookingId: string;
  ConfirmationNo: string;
  TripId: string;
  HotelName: string;
  HotelCode: string;
  CheckInDate: string;
  CheckOutDate: string;
  HotelRooms: { HotelRoom: TBOHotelRoom[] };
  Guests: { Guest: any[] };
}

export interface TBOCancelRequest {
  BookingId: string;
  ClientReferenceNumber?: string;
  RequestType: string;
  Remark: string;
}

export interface TBOCancelResponse {
  Status: TBOStatus;
  CancellationStatus: string;
  RefundAmount: number;
  Currency: string;
}

export interface TBODisplayHotel {
  resultIndex: number;
  hotelCode: string;
  name: string;
  picture: string;
  description: string;
  address: string;
  rating: string;
  starRating: number;
  tripAdvisorRating: number;
  price: number;
  currency: string;
  originalPrice: number;
}

export interface TBODisplayRoom {
  roomIndex: number;
  name: string;
  typeCode: string;
  ratePlanCode: string;
  roomFare: number;
  roomTax: number;
  totalFare: number;
  currency: string;
  amenities: string[];
}

export interface TBOBookingConfirmation {
  bookingId: string;
  confirmationNo: string;
  tripId: string;
  status: string;
  bookingStatus: string;
}
