import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://api.tbotechnology.in/TBOHolidays_HotelAPI";
const HOTEL_USERNAME = process.env.TBO_HOTEL_USERNAME || "TBOStaticAPITest";
const HOTEL_PASSWORD = process.env.TBO_HOTEL_PASSWORD || "Tbo@11530818";
const AUTH_HEADER = { Authorization: `Basic ${Buffer.from(`${HOTEL_USERNAME}:${HOTEL_PASSWORD}`).toString("base64")}` };

interface TBOCity {
  Code: string;
  Name: string;
}

interface CityResult {
  code: string;
  name: string;
  state: string;
  source: "tbo" | "fallback";
  iata_code?: string;
}

let _tboCitiesCache: CityResult[] | null = null;
let _tboCitiesCacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchIATACodes(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("City")
    .select("name, iata_code")
    .eq("isactive", true)
    .not("iata_code", "is", null);

  if (error || !data) {
    return {};
  }

  const iataMap: Record<string, string> = {};
  for (const c of data) {
    iataMap[c.name.toLowerCase()] = c.iata_code;
  }
  return iataMap;
}

async function fetchTBOCities(): Promise<CityResult[]> {
  const now = Date.now();
  if (_tboCitiesCache && now - _tboCitiesCacheTime < CACHE_TTL) {
    return _tboCitiesCache;
  }

  const res = await fetch(`${BASE_URL}/CityList`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify({ CountryCode: "IN" }),
  });

  if (!res.ok) {
    throw new Error(`TBO CityList HTTP ${res.status}`);
  }

  const data = await res.json();
  const cities: TBOCity[] = data.CityList || [];

  // Fetch IATA codes from Supabase
  const iataMap = await fetchIATACodes();

  // Parse "CityName,   State" format
  const parsed = cities.map(c => {
    const parts = c.Name.split(",").map(s => s.trim());
    const name = parts[0];
    return {
      code: c.Code,
      name,
      state: parts[1] || "",
      source: "tbo" as const,
      iata_code: iataMap[name.toLowerCase()] || undefined,
    };
  });

  // Sort alphabetically, dedupe by name
  const seen = new Set<string>();
  const unique = parsed.filter(c => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  _tboCitiesCache = unique;
  _tboCitiesCacheTime = now;

  return unique;
}

async function fetchSupabaseCities(): Promise<CityResult[]> {
  const { data, error } = await supabase
    .from("City")
    .select("id, name, country, iata_code")
    .eq("isactive", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((c: { id: string; name: string; country: string; iata_code: string | null }) => ({
    code: c.id,
    name: c.name,
    state: c.country || "",
    source: "fallback" as const,
    iata_code: c.iata_code || undefined,
  }));
}

export async function GET(_req: NextRequest) {
  try {
    // Try TBO first
    const tboCities = await fetchTBOCities();
    if (tboCities.length > 0) {
      return NextResponse.json({ source: "tbo", cities: tboCities });
    }
  } catch (e) {
    console.warn("TBO CityList failed, falling back to Supabase:", e);
  }

  // Fallback to Supabase
  try {
    const supabaseCities = await fetchSupabaseCities();
    return NextResponse.json({ source: "supabase", cities: supabaseCities });
  } catch (e) {
    console.error("Supabase cities fallback also failed:", e);
    return NextResponse.json({ source: "fallback", cities: [] });
  }
}
