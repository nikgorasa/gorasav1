import type {
  TBOHotelSearchResponse,
  TBOAvailableRoomResponse,
  TBOBlockResponse,
  TBOBookResponse,
  TBOBookingDetailResponse,
  TBOHotelResult,
  TBOHotelRoom,
} from "./tbo-hotel-types";

function hotelsForCity(city: string): TBOHotelResult[] {
  const cityHotels: Record<string, TBOHotelResult[]> = {
    Goa: [
      {
        ResultIndex: 1,
        HotelInfo: {
          HotelCode: "GOA001",
          HotelName: "The Leela Goa",
          HotelPicture: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
          HotelDescription: "Luxury beachfront resort overlooking the Arabian Sea with sprawling manicured gardens, multiple pools, and world-class dining options.",
          Latitude: 15.4093,
          Longitude: 73.9167,
          HotelAddress: "Mobor Beach, Cavelossim, Goa",
          Rating: "FiveStar",
          TripAdvisorRating: 4.7,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100,101",
        },
        MinHotelPrice: { TotalPrice: 15200, Currency: "INR", OriginalPrice: 16800, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 2,
        HotelInfo: {
          HotelCode: "GOA002",
          HotelName: "Taj Fort Aguada Resort & Spa",
          HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          HotelDescription: "Heritage resort perched on a hilltop overlooking the Arabian Sea with a historic Portuguese fort backdrop.",
          Latitude: 15.4917,
          Longitude: 73.7800,
          HotelAddress: "Fort Aguada Road, Sinquerim, Goa",
          Rating: "FiveStar",
          TripAdvisorRating: 4.6,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100,101",
        },
        MinHotelPrice: { TotalPrice: 18800, Currency: "INR", OriginalPrice: 21000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 3,
        HotelInfo: {
          HotelCode: "GOA003",
          HotelName: "W Goa",
          HotelPicture: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
          HotelDescription: "Trendy beachfront resort with contemporary design, lagoon-style pool, and vibrant nightlife.",
          Latitude: 15.5893,
          Longitude: 73.7200,
          HotelAddress: "Vagator Beach Road, Vagator, Goa",
          Rating: "FiveStar",
          TripAdvisorRating: 4.5,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,101",
        },
        MinHotelPrice: { TotalPrice: 13500, Currency: "INR", OriginalPrice: 15000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 4,
        HotelInfo: {
          HotelCode: "GOA004",
          HotelName: "Holiday Inn Resort Goa",
          HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          HotelDescription: "Family-friendly beach resort with kids club, multiple restaurants, and direct beach access.",
          Latitude: 15.5900,
          Longitude: 73.7350,
          HotelAddress: "Candolim Beach Road, Candolim, Goa",
          Rating: "FourStar",
          TripAdvisorRating: 4.3,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100",
        },
        MinHotelPrice: { TotalPrice: 8200, Currency: "INR", OriginalPrice: 9200, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 5,
        HotelInfo: {
          HotelCode: "GOA005",
          HotelName: "Resort Rio",
          HotelPicture: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
          HotelDescription: "Boutique resort with Portuguese-Goan architecture, tropical gardens, and a serene pool area.",
          Latitude: 15.5200,
          Longitude: 73.7600,
          HotelAddress: "Baga-Calangute Road, Baga, Goa",
          Rating: "FourStar",
          TripAdvisorRating: 4.2,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99",
        },
        MinHotelPrice: { TotalPrice: 6500, Currency: "INR", OriginalPrice: 7200, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 6,
        HotelInfo: {
          HotelCode: "GOA006",
          HotelName: "Sterling Goa",
          HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          HotelDescription: "Sprawling resort with cottages surrounded by coconut groves, ideal for families and couples.",
          Latitude: 15.5400,
          Longitude: 73.7400,
          HotelAddress: "Calangute - Baga Road, Calangute, Goa",
          Rating: "ThreeStar",
          TripAdvisorRating: 4.0,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "",
        },
        MinHotelPrice: { TotalPrice: 4800, Currency: "INR", OriginalPrice: 5500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
    ],
    Mumbai: [
      {
        ResultIndex: 1,
        HotelInfo: {
          HotelCode: "BOM001",
          HotelName: "The Taj Mahal Palace",
          HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          HotelDescription: "Iconic heritage hotel overlooking the Gateway of India with luxurious rooms and award-winning dining.",
          Latitude: 18.9217,
          Longitude: 72.8330,
          HotelAddress: "Apollo Bunder, Colaba, Mumbai",
          Rating: "FiveStar",
          TripAdvisorRating: 4.8,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100,101",
        },
        MinHotelPrice: { TotalPrice: 35000, Currency: "INR", OriginalPrice: 38000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 2,
        HotelInfo: {
          HotelCode: "BOM002",
          HotelName: "JW Marriott Mumbai Sahar",
          HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          HotelDescription: "Modern airport hotel with elegant rooms, rooftop pool, and a renowned spa.",
          Latitude: 19.0890,
          Longitude: 72.8670,
          HotelAddress: "IA Project Road, Chhatrapati Shivaji International Airport, Mumbai",
          Rating: "FiveStar",
          TripAdvisorRating: 4.5,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100,101",
        },
        MinHotelPrice: { TotalPrice: 13500, Currency: "INR", OriginalPrice: 15000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 3,
        HotelInfo: {
          HotelCode: "BOM003",
          HotelName: "ITC Grand Central",
          HotelPicture: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
          HotelDescription: "Luxury business hotel in Parel with exquisite rooms and multiple fine-dining restaurants.",
          Latitude: 18.9950,
          Longitude: 72.8270,
          HotelAddress: "Dr. Baba Saheb Ambedkar Road, Parel, Mumbai",
          Rating: "FiveStar",
          TripAdvisorRating: 4.6,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100",
        },
        MinHotelPrice: { TotalPrice: 11800, Currency: "INR", OriginalPrice: 13000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 4,
        HotelInfo: {
          HotelCode: "BOM004",
          HotelName: "Hotel Marine Plaza",
          HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          HotelDescription: "Seafront hotel on Marine Drive with stunning ocean views and comfortable accommodations.",
          Latitude: 18.9300,
          Longitude: 72.8220,
          HotelAddress: "29, Marine Drive, Churchgate, Mumbai",
          Rating: "FourStar",
          TripAdvisorRating: 4.3,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99",
        },
        MinHotelPrice: { TotalPrice: 8500, Currency: "INR", OriginalPrice: 9500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
    ],
    Delhi: [
      {
        ResultIndex: 1,
        HotelInfo: {
          HotelCode: "DEL001",
          HotelName: "The Imperial",
          HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          HotelDescription: "Historic grand hotel in central Delhi blending colonial architecture with modern luxury.",
          Latitude: 28.6260,
          Longitude: 77.2080,
          HotelAddress: "Janpath, Connaught Place, New Delhi",
          Rating: "FiveStar",
          TripAdvisorRating: 4.7,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100,101",
        },
        MinHotelPrice: { TotalPrice: 22000, Currency: "INR", OriginalPrice: 24500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 2,
        HotelInfo: {
          HotelCode: "DEL002",
          HotelName: "Taj Palace",
          HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          HotelDescription: "Sprawling luxury hotel with landscaped gardens, premium dining, and world-class banquets.",
          Latitude: 28.5950,
          Longitude: 77.1700,
          HotelAddress: "2, Sardar Patel Marg, Diplomatic Enclave, New Delhi",
          Rating: "FiveStar",
          TripAdvisorRating: 4.5,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100,101",
        },
        MinHotelPrice: { TotalPrice: 16500, Currency: "INR", OriginalPrice: 18000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 3,
        HotelInfo: {
          HotelCode: "DEL003",
          HotelName: "Hyatt Regency Delhi",
          HotelPicture: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
          HotelDescription: "Contemporary business hotel on Bhikaji Cama Place with modern amenities and great connectivity.",
          Latitude: 28.5860,
          Longitude: 77.1740,
          HotelAddress: "Bhikaji Cama Place, New Delhi",
          Rating: "FiveStar",
          TripAdvisorRating: 4.4,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100",
        },
        MinHotelPrice: { TotalPrice: 11200, Currency: "INR", OriginalPrice: 12500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 4,
        HotelInfo: {
          HotelCode: "DEL004",
          HotelName: "The LaLiT",
          HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          HotelDescription: "Contemporary luxury hotel near Connaught Place with a vibrant atmosphere and multiple dining options.",
          Latitude: 28.6300,
          Longitude: 77.2150,
          HotelAddress: "Barakhamba Avenue, Connaught Place, New Delhi",
          Rating: "FiveStar",
          TripAdvisorRating: 4.3,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99",
        },
        MinHotelPrice: { TotalPrice: 9800, Currency: "INR", OriginalPrice: 11000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 5,
        HotelInfo: {
          HotelCode: "DEL005",
          HotelName: "Claridges Hotel",
          HotelPicture: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
          HotelDescription: "Boutique luxury hotel with old-world charm in the heart of Lutyens' Delhi.",
          Latitude: 28.6000,
          Longitude: 77.2200,
          HotelAddress: "12, Aurangzeb Road, New Delhi",
          Rating: "FourStar",
          TripAdvisorRating: 4.4,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100",
        },
        MinHotelPrice: { TotalPrice: 7500, Currency: "INR", OriginalPrice: 8500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
    ],
    Jaipur: [
      {
        ResultIndex: 1,
        HotelInfo: {
          HotelCode: "JAI001",
          HotelName: "Rambagh Palace",
          HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          HotelDescription: "Former royal residence turned luxury hotel with opulent suites and Mughal gardens.",
          Latitude: 26.8800,
          Longitude: 75.8000,
          HotelAddress: "Bhawani Singh Road, Jaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.9,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100,101",
        },
        MinHotelPrice: { TotalPrice: 32000, Currency: "INR", OriginalPrice: 35000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 2,
        HotelInfo: {
          HotelCode: "JAI002",
          HotelName: "Fairmont Jaipur",
          HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          HotelDescription: "Grand palace-style hotel with Rajasthani architecture, luxury rooms, and a stunning pool.",
          Latitude: 26.8500,
          Longitude: 75.7800,
          HotelAddress: "2, Amber Road, Jaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.6,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100,101",
        },
        MinHotelPrice: { TotalPrice: 15800, Currency: "INR", OriginalPrice: 17500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 3,
        HotelInfo: {
          HotelCode: "JAI003",
          HotelName: "ITC Rajputana",
          HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          HotelDescription: "Luxury hotel inspired by Rajput architecture with landscaped gardens and traditional hospitality.",
          Latitude: 26.8900,
          Longitude: 75.8100,
          HotelAddress: "Palace Road, Jaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.5,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100",
        },
        MinHotelPrice: { TotalPrice: 12000, Currency: "INR", OriginalPrice: 13500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 4,
        HotelInfo: {
          HotelCode: "JAI004",
          HotelName: "Hilton Jaipur",
          HotelPicture: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
          HotelDescription: "Modern hotel with elegant rooms, rooftop pool, and panoramic views of the city.",
          Latitude: 26.8600,
          Longitude: 75.7900,
          HotelAddress: "Plot No 7, LBS Marg, Jaipur",
          Rating: "FourStar",
          TripAdvisorRating: 4.3,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99",
        },
        MinHotelPrice: { TotalPrice: 7800, Currency: "INR", OriginalPrice: 8800, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
    ],
    Udaipur: [
      {
        ResultIndex: 1,
        HotelInfo: {
          HotelCode: "UDR001",
          HotelName: "Taj Lake Palace",
          HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          HotelDescription: "Iconic marble palace floating on Lake Pichola, one of the world's most romantic hotels.",
          Latitude: 24.5700,
          Longitude: 73.6800,
          HotelAddress: "Lake Pichola, Udaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.8,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100,101",
        },
        MinHotelPrice: { TotalPrice: 45000, Currency: "INR", OriginalPrice: 48000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 2,
        HotelInfo: {
          HotelCode: "UDR002",
          HotelName: "The Leela Palace Udaipur",
          HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          HotelDescription: "Palace hotel on the banks of Lake Pichola with lavish rooms and royal-inspired architecture.",
          Latitude: 24.5750,
          Longitude: 73.6850,
          HotelAddress: "Lake Pichola, Udaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.8,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "100,101",
        },
        MinHotelPrice: { TotalPrice: 28500, Currency: "INR", OriginalPrice: 31000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 3,
        HotelInfo: {
          HotelCode: "UDR003",
          HotelName: "Trident Udaipur",
          HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          HotelDescription: "Elegant lakeside hotel with traditional architecture and beautiful gardens.",
          Latitude: 24.5680,
          Longitude: 73.6780,
          HotelAddress: "Haridas Ji Ki Magri, Udaipur",
          Rating: "FiveStar",
          TripAdvisorRating: 4.6,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99,100",
        },
        MinHotelPrice: { TotalPrice: 13500, Currency: "INR", OriginalPrice: 15000, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
      {
        ResultIndex: 4,
        HotelInfo: {
          HotelCode: "UDR004",
          HotelName: "Radisson Blu Udaipur",
          HotelPicture: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
          HotelDescription: "Contemporary hotel with lake views, rooftop infinity pool, and modern comfort.",
          Latitude: 24.5600,
          Longitude: 73.6900,
          HotelAddress: "5, Pichola Road, Udaipur",
          Rating: "FourStar",
          TripAdvisorRating: 4.3,
          TripAdvisorReviewURL: "https://www.tripadvisor.com/",
          TagIds: "99",
        },
        MinHotelPrice: { TotalPrice: 7500, Currency: "INR", OriginalPrice: 8500, B2CRates: false },
        IsPkgProperty: false,
        IsPackageRate: false,
        MappedHotel: true,
      },
    ],
  };

  const normalizedCity = city.toLowerCase();
  for (const [key, hotels] of Object.entries(cityHotels)) {
    if (key.toLowerCase() === normalizedCity) return hotels;
  }

  return [
    {
      ResultIndex: 1,
      HotelInfo: {
        HotelCode: "GEN001",
        HotelName: `Grand ${city} Hotel`,
        HotelPicture: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        HotelDescription: `Premier hotel in ${city} offering comfortable accommodations and excellent service for business and leisure travelers.`,
        Latitude: 0,
        Longitude: 0,
        HotelAddress: `${city} City Center`,
        Rating: "FourStar",
        TripAdvisorRating: 4.2,
        TripAdvisorReviewURL: "https://www.tripadvisor.com/",
        TagIds: "99,100",
      },
      MinHotelPrice: { TotalPrice: 5500, Currency: "INR", OriginalPrice: 6200, B2CRates: false },
      IsPkgProperty: false,
      IsPackageRate: false,
      MappedHotel: true,
    },
    {
      ResultIndex: 2,
      HotelInfo: {
        HotelCode: "GEN002",
        HotelName: `${city} Regency`,
        HotelPicture: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        HotelDescription: `Well-appointed hotel in the heart of ${city} with modern amenities and warm hospitality.`,
        Latitude: 0,
        Longitude: 0,
        HotelAddress: `Main Road, ${city}`,
        Rating: "FourStar",
        TripAdvisorRating: 4.0,
        TripAdvisorReviewURL: "https://www.tripadvisor.com/",
        TagIds: "99",
      },
      MinHotelPrice: { TotalPrice: 4200, Currency: "INR", OriginalPrice: 4800, B2CRates: false },
      IsPkgProperty: false,
      IsPackageRate: false,
      MappedHotel: true,
    },
    {
      ResultIndex: 3,
      HotelInfo: {
        HotelCode: "GEN003",
        HotelName: `Hotel ${city} Palace`,
        HotelPicture: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        HotelDescription: `Comfortable budget-friendly hotel with essential amenities in ${city}.`,
        Latitude: 0,
        Longitude: 0,
        HotelAddress: `Station Road, ${city}`,
        Rating: "ThreeStar",
        TripAdvisorRating: 3.8,
        TripAdvisorReviewURL: "https://www.tripadvisor.com/",
        TagIds: "",
      },
      MinHotelPrice: { TotalPrice: 2800, Currency: "INR", OriginalPrice: 3200, B2CRates: false },
      IsPkgProperty: false,
      IsPackageRate: false,
      MappedHotel: true,
    },
  ];
}

function roomsForHotel(hotelCode: string): TBOHotelRoom[] {
  const roomMap: Record<string, TBOHotelRoom[]> = {};
  const codes = ["GOA001", "GOA002", "BOM001", "DEL001", "JAI001", "UDR001", "UDR002"];
  codes.forEach((code) => {
    roomMap[code] = [
      {
        RoomIndex: 1,
        RoomTypeName: "Luxury Room",
        RoomTypeCode: "LUX|1|1|0",
        RatePlanCode: `RPC_${code}_LUX`,
        RoomRate: { RoomFare: 12000, RoomTax: 2400, TotalFare: 14400, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "Mini Bar", "Room Service", "TV"] },
      },
      {
        RoomIndex: 2,
        RoomTypeName: "Deluxe Suite",
        RoomTypeCode: "DSU|1|1|0",
        RatePlanCode: `RPC_${code}_DSU`,
        RoomRate: { RoomFare: 18000, RoomTax: 3600, TotalFare: 21600, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "Mini Bar", "Living Area", "Butler Service", "TV"] },
      },
      {
        RoomIndex: 3,
        RoomTypeName: "Presidential Suite",
        RoomTypeCode: "PSU|1|1|0",
        RatePlanCode: `RPC_${code}_PSU`,
        RoomRate: { RoomFare: 35000, RoomTax: 7000, TotalFare: 42000, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "Mini Bar", "Living Room", "Dining Room", "Private Terrace", "Butler Service", "Jacuzzi", "TV"] },
      },
    ];
  });

  const midCodes = ["GOA003", "GOA004", "GOA005", "BOM004", "DEL005", "JAI004", "UDR004"];
  midCodes.forEach((code) => {
    roomMap[code] = [
      {
        RoomIndex: 1,
        RoomTypeName: "Standard Room",
        RoomTypeCode: "STD|1|1|0",
        RatePlanCode: `RPC_${code}_STD`,
        RoomRate: { RoomFare: 4500, RoomTax: 900, TotalFare: 5400, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "TV", "Room Service"] },
      },
      {
        RoomIndex: 2,
        RoomTypeName: "Deluxe Room",
        RoomTypeCode: "DLX|1|1|0",
        RatePlanCode: `RPC_${code}_DLX`,
        RoomRate: { RoomFare: 6500, RoomTax: 1300, TotalFare: 7800, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service", "City View"] },
      },
    ];
  });

  const budgetCodes = ["GOA006", "DEL004", "JAI003"];
  budgetCodes.forEach((code) => {
    roomMap[code] = [
      {
        RoomIndex: 1,
        RoomTypeName: "Standard Room",
        RoomTypeCode: "STD|1|1|0",
        RatePlanCode: `RPC_${code}_STD`,
        RoomRate: { RoomFare: 3200, RoomTax: 640, TotalFare: 3840, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "TV"] },
      },
    ];
  });

  const genCodes = ["GEN001", "GEN002", "GEN003"];
  genCodes.forEach((code) => {
    roomMap[code] = [
      {
        RoomIndex: 1,
        RoomTypeName: "Standard Room",
        RoomTypeCode: "STD|1|1|0",
        RatePlanCode: `RPC_${code}_STD`,
        RoomRate: { RoomFare: 3500, RoomTax: 700, TotalFare: 4200, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "TV", "Room Service"] },
      },
      {
        RoomIndex: 2,
        RoomTypeName: "Superior Room",
        RoomTypeCode: "SUP|1|1|0",
        RatePlanCode: `RPC_${code}_SUP`,
        RoomRate: { RoomFare: 5200, RoomTax: 1040, TotalFare: 6240, Currency: "INR" },
        Amenities: { Amenity: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service", "City View"] },
      },
    ];
  });

  return roomMap[hotelCode] || roomMap["GEN001"]!;
}

function generateSessionId(): string {
  const hex = "0123456789abcdef";
  let id = "";
  for (let i = 0; i < 8; i++) id += hex[Math.floor(Math.random() * 16)];
  id += "-";
  for (let i = 0; i < 4; i++) id += hex[Math.floor(Math.random() * 16)];
  id += "-";
  for (let i = 0; i < 4; i++) id += hex[Math.floor(Math.random() * 16)];
  id += "-";
  for (let i = 0; i < 4; i++) id += hex[Math.floor(Math.random() * 16)];
  id += "-";
  for (let i = 0; i < 12; i++) id += hex[Math.floor(Math.random() * 16)];
  return id;
}

export function mockHotelSearch(cityName: string): TBOHotelSearchResponse {
  const hotels = hotelsForCity(cityName);
  const sessionId = generateSessionId();
  return {
    Status: { StatusCode: "01", Description: "Successful: HotelSearch Successful" },
    SessionId: sessionId,
    CheckInDate: "2026-06-10",
    CheckOutDate: "2026-06-11",
    NoOfRoomsRequested: 1,
    RoomGuests: { RoomGuest: [{ AdultCount: 1, ChildCount: 0 }] },
    HotelResultList: { HotelResult: hotels },
    ResponseTime: "15",
  };
}

export function mockAvailableHotelRooms(sessionId: string, _resultIndex: number, hotelCode: string): TBOAvailableRoomResponse {
  return {
    Status: { StatusCode: "01", Description: "Successful" },
    SessionId: sessionId,
    HotelRooms: { HotelRoom: roomsForHotel(hotelCode) },
    HotelCancellationPolicies: "Free cancellation up to 48 hours before check-in. 50% charge within 48 hours. 100% no-show charge.",
  };
}

export function mockBlockAndPrice(_sessionId: string, hotelName: string): TBOBlockResponse {
  return {
    Status: { StatusCode: "01", Description: "Successful: Price verified" },
    PriceChange: { Status: "false", AvailableOnNewPrice: "false" },
    IsPriceChanged: false,
    IsCancellationPolicyAvailable: true,
    HotelCancellationPolicies: "Free cancellation up to 48 hours before check-in. 50% charge within 48 hours. 100% no-show charge.",
  };
}

export function mockBook(clientRef: string, hotelName: string): TBOBookResponse {
  const bookingId = `B${Math.floor(100000 + Math.random() * 900000)}`;
  const confirmation = `TBO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  return {
    Status: { StatusCode: "01", Description: "Successful: HotelBook Successful" },
    BookingStatus: "Confirmed",
    BookingId: bookingId,
    ConfirmationNo: confirmation,
    TripId: `T${Math.floor(1000 + Math.random() * 9000)}`,
    SupplierReferenceNo: "",
    PriceChange: { Status: "false", AvailableOnNewPrice: "false" },
  };
}

export function mockGetBookingDetail(bookingId: string): TBOBookingDetailResponse {
  return {
    Status: { StatusCode: "01", Description: "Successful" },
    BookingStatus: "Confirmed",
    BookingId: bookingId,
    ConfirmationNo: "TBO" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    TripId: "T" + Math.floor(1000 + Math.random() * 9000),
    HotelName: "Mock Hotel",
    HotelCode: "GEN001",
    CheckInDate: "2026-06-10",
    CheckOutDate: "2026-06-11",
    HotelRooms: {
      HotelRoom: [
        {
          RoomIndex: 1,
          RoomTypeName: "Standard Room",
          RoomTypeCode: "STD|1|1|0",
          RatePlanCode: "RPC_GEN001_STD",
          RoomRate: { RoomFare: 3500, RoomTax: 700, TotalFare: 4200, Currency: "INR" },
        },
      ],
    },
    Guests: { Guest: [{ FirstName: "Test", LastName: "Guest" }] },
  };
}
