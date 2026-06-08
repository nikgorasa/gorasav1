"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency } from "@/lib";
import { Plane, Search, Calendar, Users, ArrowRight, Star, Clock, Luggage, X, Loader2 } from "lucide-react";

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  tier: string;
}

export default function FlightsPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [origin, setOrigin] = useState("Mumbai");
  const [destination, setDestination] = useState("Delhi");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [tripType, setTripType] = useState<"one-way" | "return">("one-way");
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cities?type=domestic")
      .then((r) => r.json())
      .then((data) => setCities(Array.isArray(data) ? data.map((c: { name: string }) => c.name) : []))
      .catch(() => setCities(["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"]))
      .finally(() => setCitiesLoading(false));
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Business": return "bg-purple-100 text-purple-700";
      case "Flexi Plus": return "bg-blue-100 text-blue-700";
      case "Standard": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                <Plane size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">Search Flights</h1>
              <p className="text-blue-100 text-sm">Find the best airfares across India</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-xl"
            >
              {/* Trip Type Toggle */}
              <div className="flex gap-2 mb-4">
                {(["one-way", "return"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                      tripType === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t === "one-way" ? "One Way" : "Return"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">From</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {citiesLoading ? <option>Loading...</option> : cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">To</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {citiesLoading ? <option>Loading...</option> : cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Passengers</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="mt-4 w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={18} />
                Search Flights
              </button>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {searching ? (
              <div className="text-center py-16">
                <Loader2 size={32} className="mx-auto animate-spin text-blue-600 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Searching flights...</h2>
                <p className="text-slate-500">Checking available routes between {origin} and {destination}.</p>
              </div>
            ) : !searched ? (
              <div className="text-center py-16">
                <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Search for flights</h2>
                <p className="text-slate-500">Enter your travel details above to find the best flight deals.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No flights found</h2>
                <p className="text-slate-500">Try different dates or routes.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 mb-4">{results.length} flights found</p>
                <div className="space-y-3">
                  {results.map((flight, i) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedFlight(flight)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Plane size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{flight.airline}</p>
                            <p className="text-xs text-slate-500">{flight.flightNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-900">{flight.departureTime}</p>
                            <p className="text-xs text-slate-500">{flight.origin}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-xs text-slate-400">{flight.duration}</p>
                            <div className="w-20 h-px bg-slate-300 my-1" />
                            <p className="text-xs text-slate-400">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-900">{flight.arrivalTime}</p>
                            <p className="text-xs text-slate-500">{flight.destination}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTierColor(flight.tier)}`}>
                            {flight.tier}
                          </span>
                          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(flight.price)}</p>
                          <p className="text-[10px] text-slate-400">per person</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Flight Detail Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedFlight(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <button onClick={() => setSelectedFlight(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Plane size={32} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedFlight.airline}</h2>
                <p className="text-slate-500">{selectedFlight.flightNumber}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedFlight.departureTime}</p>
                    <p className="text-sm text-slate-500">{selectedFlight.origin}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock size={16} className="text-slate-400 mb-1" />
                    <p className="text-sm font-medium text-slate-700">{selectedFlight.duration}</p>
                    <p className="text-xs text-slate-400">{selectedFlight.stops === 0 ? "Non-stop" : `${selectedFlight.stops} stop`}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedFlight.arrivalTime}</p>
                    <p className="text-sm text-slate-500">{selectedFlight.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase">Tier</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTierColor(selectedFlight.tier)}`}>
                      {selectedFlight.tier}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase">Aircraft</p>
                    <p className="text-sm font-medium text-slate-900">Boeing 737</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-3xl font-black font-mono text-slate-900">{formatCurrency(selectedFlight.price)}</p>
                      <p className="text-xs text-slate-400">per person • Published Fare + 2% TDS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowLogin(true);
                      } else {
                        alert("Booking flow coming soon!");
                      }
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {user ? "Book Now" : "Sign in to Book"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
