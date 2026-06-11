import { HotelFilters, FlightFilters } from "./types";

interface HotelResult {
  price: number;
  starRating: number;
  amenities?: string[];
  propertyType?: string;
  mealPlan?: string;
  freeCancellation?: boolean;
}

interface FlightResult {
  price: number;
  stops: number;
  airline?: string;
  departureTime?: string;
  duration?: number;
}

export function applyHotelFilters(
  hotels: HotelResult[],
  filters: HotelFilters
): HotelResult[] {
  return hotels.filter((hotel) => {
    if (hotel.price < filters.priceRange[0] || hotel.price > filters.priceRange[1]) {
      return false;
    }

    if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.starRating)) {
      return false;
    }

    if (filters.amenities.length > 0) {
      const hotelAmenities = hotel.amenities?.map((a) => a.toLowerCase()) || [];
      const hasAllAmenities = filters.amenities.every((a) => hotelAmenities.includes(a));
      if (!hasAllAmenities) return false;
    }

    if (
      filters.propertyType.length > 0 &&
      hotel.propertyType &&
      !filters.propertyType.includes(hotel.propertyType)
    ) {
      return false;
    }

    if (
      filters.mealPlan.length > 0 &&
      hotel.mealPlan &&
      !filters.mealPlan.includes(hotel.mealPlan)
    ) {
      return false;
    }

    if (filters.freeCancellation && !hotel.freeCancellation) {
      return false;
    }

    return true;
  });
}

export function applyFlightFilters(
  flights: FlightResult[],
  filters: FlightFilters
): FlightResult[] {
  return flights.filter((flight) => {
    if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
      return false;
    }

    if (filters.stops.length > 0) {
      const maxStops = Math.max(...filters.stops);
      if (flight.stops > maxStops) return false;
    }

    if (filters.airlines.length > 0 && flight.airline) {
      if (!filters.airlines.includes(flight.airline)) return false;
    }

    if (filters.departureTime.length > 0 && flight.departureTime) {
      const time = flight.departureTime;
      const hour = parseInt(time.split(":")[0]);

      const timeSlotMatch = filters.departureTime.some((slot) => {
        switch (slot) {
          case "early_morning":
            return hour >= 0 && hour < 6;
          case "morning":
            return hour >= 6 && hour < 12;
          case "afternoon":
            return hour >= 12 && hour < 18;
          case "evening":
            return hour >= 18 && hour < 24;
          default:
            return true;
        }
      });

      if (!timeSlotMatch) return false;
    }

    if (filters.maxDuration < 24 && flight.duration) {
      if (flight.duration > filters.maxDuration) return false;
    }

    return true;
  });
}
