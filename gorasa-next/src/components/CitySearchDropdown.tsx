"use client";

import { useState, useEffect, useRef } from "react";
import { Command } from "cmdk";

interface City {
  code: string;
  name: string;
  state: string;
}

interface CitySearchDropdownProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function CitySearchDropdown({
  value,
  onChange,
  placeholder = "Search cities...",
  label = "Location",
  className = "",
}: CitySearchDropdownProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/cities/tbo")
      .then((r) => r.json())
      .then((data) => {
        setCities(data.cities || []);
      })
      .catch(() => {
        setCities([
          { code: "goa", name: "Goa", state: "Goa" },
          { code: "mumbai", name: "Mumbai", state: "Maharashtra" },
          { code: "delhi", name: "Delhi", state: "Delhi" },
          { code: "bangalore", name: "Bangalore", state: "Karnataka" },
          { code: "hyderabad", name: "Hyderabad", state: "Telangana" },
          { code: "chennai", name: "Chennai", state: "Tamil Nadu" },
          { code: "jaipur", name: "Jaipur", state: "Rajasthan" },
          { code: "kolkata", name: "Kolkata", state: "West Bengal" },
          { code: "pune", name: "Pune", state: "Maharashtra" },
          { code: "kodaikanal", name: "Kodaikanal", state: "Tamil Nadu" },
          { code: "ooty", name: "Ooty", state: "Tamil Nadu" },
          { code: "manali", name: "Manali", state: "Himachal Pradesh" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    setOpen(false);
  };

  // Show popular cities first, then alphabetical
  const popularCities = ["Goa", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Jaipur", "Kolkata", "Pune"];
  const popular = cities.filter(c => popularCities.includes(c.name));
  const rest = cities.filter(c => !popularCities.includes(c.name));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
          {label}
        </label>
      )}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer flex items-center justify-between hover:border-emerald-300 transition-colors"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <Command shouldFilter={true} className="max-h-72 overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-2">
              <Command.Input
                autoFocus
                placeholder={placeholder}
                className="w-full text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <Command.List className="py-1">
              {loading && (
                <Command.Loading>
                  <div className="px-3 py-2 text-xs text-slate-400">Loading cities...</div>
                </Command.Loading>
              )}
              <Command.Empty>
                <div className="px-3 py-2 text-xs text-slate-400">No cities found.</div>
              </Command.Empty>

              {/* Popular cities group */}
              {popular.length > 0 && (
                <Command.Group heading="Popular" className="px-1">
                  {popular.map((city) => (
                    <Command.Item
                      key={city.code}
                      value={city.name}
                      onSelect={() => handleSelect(city.name)}
                      className="px-3 py-2 text-sm cursor-pointer rounded-lg hover:bg-emerald-50 data-[selected=true]:bg-emerald-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-900">{city.name}</span>
                      {city.state && (
                        <span className="text-[11px] text-slate-400">{city.state}</span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* All cities group */}
              {rest.length > 0 && (
                <Command.Group heading="All Cities" className="px-1">
                  {rest.map((city) => (
                    <Command.Item
                      key={city.code}
                      value={city.name}
                      onSelect={() => handleSelect(city.name)}
                      className="px-3 py-2 text-sm cursor-pointer rounded-lg hover:bg-emerald-50 data-[selected=true]:bg-emerald-50 flex items-center justify-between"
                    >
                      <span className="text-slate-700">{city.name}</span>
                      {city.state && (
                        <span className="text-[11px] text-slate-400">{city.state}</span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
