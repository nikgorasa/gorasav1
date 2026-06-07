import { Flight, FlightSearchParams } from "../types";

interface FlightData {
  indigo: Flight[];
  airIndia: Flight[];
}

let cachedFlights: FlightData | null = null;

async function loadFlights(): Promise<FlightData> {
  if (cachedFlights) return cachedFlights;
  
  const response = await fetch('/data/flights.json');
  if (!response.ok) {
    throw new Error('Failed to load flights data');
  }
  cachedFlights = await response.json();
  return cachedFlights;
}

function filterFlights(flights: Flight[], params: FlightSearchParams): Flight[] {
  return flights.filter(flight => 
    flight.origin.toLowerCase() === params.origin.toLowerCase() &&
    flight.destination.toLowerCase() === params.location.toLowerCase()
  );
}

export async function searchIndigoFlights(params: FlightSearchParams): Promise<Flight[]> {
  const data = await loadFlights();
  let flights = filterFlights(data.indigo, params);
  
  if (params.tripType === 'return' && params.endDate) {
    return flights.map(f => ({
      ...f,
      id: `${f.id}-RT`,
      flightNumber: `${f.flightNumber} (Return ${params.endDate})`,
      price: Math.round(f.price * 1.8)
    }));
  }
  
  return flights;
}

export async function searchAirIndiaFlights(params: FlightSearchParams): Promise<Flight[]> {
  const data = await loadFlights();
  let flights = filterFlights(data.airIndia, params);
  
  if (params.tripType === 'return' && params.endDate) {
    return flights.map(f => ({
      ...f,
      id: `${f.id}-RT`,
      flightNumber: `${f.flightNumber} (Return ${params.endDate})`,
      price: Math.round(f.price * 1.8)
    }));
  }
  
  return flights;
}