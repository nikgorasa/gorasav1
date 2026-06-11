"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency } from "@/lib";
import { Building2, Search, MapPin, X, Star, Wifi, Coffee, Car, Loader2, ChevronDown, ChevronUp, Bed, Users } from "lucide-react";
import HotelBookingModal from "@/components/HotelBookingModal";
import CitySearchDropdown from "@/components/CitySearchDropdown";
import type { TBODisplayHotel, TBODisplayRoom } from "@/lib/tbo-hotel-types";

const STAR_LABELS: Record<string, string> = {
  OneStar: "★",
  TwoStar: "★★",
  ThreeStar: "★★★",
  FourStar: "★★★★",
  FiveStar: "★★★★★",
};

const STAR_MAP: Record<string, number> = {
  OneStar: 1, TwoStar: 2, ThreeStar: 3, FourStar: 4, FiveStar: 5,
};

export default function HotelsPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [location, setLocation] = useState("Goa");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [results, setResults] = useState<TBODisplayHotel[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<TBODisplayHotel | null>(null);
  const [rooms, setRooms] = useState<TBODisplayRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<TBODisplayRoom | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const res = await fetch("/api/tbo-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          params: {
            CheckInDate: checkIn || "2026-06-10",
            CheckOutDate: checkOut || "2026-06-11",
            CountryName: "India",
            CityName: location,
            IsNearBySearchAllowed: false,
            NoOfRooms: 1,
            GuestNationality: "IN",
            RoomGuests: [{ AdultCount: parseInt(guests), ChildCount: 0 }],
            PreferredCurrencyCode: "INR",
            ResultCount: 0,
            Filters: { StarRating: "All", OrderBy: "PriceAsc" },
            ResponseTime: 10,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.hotels || []);
        setSessionId(data.sessionId || "");
      }
    } catch (e) {
      setError("Failed to search hotels. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelClick = async (hotel: TBODisplayHotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    setRoomsLoading(true);

    try {
      const res = await fetch("/api/tbo-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rooms",
          sessionId,
          resultIndex: hotel.resultIndex,
          hotelCode: hotel.hotelCode,
        }),
      });

      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
        if (data.rooms.length > 0) setSelectedRoom(data.rooms[0]);
      } else {
        setRooms([]);
      }
    } catch {
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const getStarColor = (stars: number) => {
    if (stars >= 5) return "text-amber-500";
    if (stars >= 4) return "text-amber-400";
    return "text-amber-300";
  };

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">Search Hotels</h1>
              <p className="text-emerald-100 text-sm">Powered by TBO • Global hotel inventory at best rates</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <CitySearchDropdown
                  value={location}
                  onChange={setLocation}
                  placeholder="Search cities..."
                  label="Location"
                />
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="mt-4 w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? "Searching..." : "Search Hotels"}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {!searched ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Search TBO Hotels</h2>
                <p className="text-slate-500">Enter your destination and dates to find hotels from TBO's global inventory.</p>
                <p className="text-slate-400 text-xs mt-2">22% markup applied. Pricing hierarchy: Hotel &gt; Destination &gt; Global.</p>
              </div>
            ) : loading ? (
              <div className="text-center py-16">
                <Loader2 size={40} className="mx-auto text-emerald-600 mb-4 animate-spin" />
                <p className="text-slate-500">Searching TBO inventory for {location}...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-red-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Search Error</h2>
                <p className="text-red-500">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No hotels found</h2>
                <p className="text-slate-500">Try a different location or dates.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">{results.length} hotels found in {location}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">TBO Inventory</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((hotel, i) => (
                    <motion.div
                      key={hotel.hotelCode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handleHotelClick(hotel)}
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={hotel.picture}
                          alt={hotel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-600 text-white">
                            TBO
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2 py-1 rounded-lg">
                          {STAR_LABELS[hotel.rating] || "★★★"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {hotel.address || location}
                        </p>
                        {hotel.tripAdvisorRating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[11px] text-slate-500">{hotel.tripAdvisorRating}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{hotel.description}</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-black font-mono text-slate-900">{formatCurrency(hotel.price)}</p>
                            <p className="text-[10px] text-slate-400">per night</p>
                          </div>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer">
                            View Rooms
                          </button>
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

      {/* Hotel Detail + Room Selection Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setSelectedHotel(null); setSelectedRoom(null); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="h-56 relative">
                <img
                  src={selectedHotel.picture}
                  alt={selectedHotel.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button onClick={() => { setSelectedHotel(null); setSelectedRoom(null); }} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full">
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white">TBO</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-black/60 text-white ${getStarColor(STAR_MAP[selectedHotel.rating] || 3)}`}>
                    {STAR_LABELS[selectedHotel.rating] || "★★★"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{selectedHotel.name}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin size={14} />
                  {selectedHotel.address || location}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  {selectedHotel.tripAdvisorRating > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm text-slate-900">{selectedHotel.tripAdvisorRating}</span>
                      <span className="text-[10px] text-slate-400">TripAdvisor</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-400">
                    <Wifi size={14} />
                    <Coffee size={14} />
                    <Car size={14} />
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4">{selectedHotel.description}</p>

                {/* Rooms Section */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Bed size={16} />
                    Available Rooms
                  </h3>

                  {roomsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={20} className="animate-spin text-emerald-600" />
                      <span className="ml-2 text-sm text-slate-500">Loading rooms...</span>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-400">No room data available for this hotel.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <div
                          key={room.roomIndex}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedRoom?.roomIndex === room.roomIndex
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-emerald-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{room.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(room.amenities || []).slice(0, 4).map((a) => (
                                  <span key={a} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{a}</span>
                                ))}
                                {(room.amenities || []).length > 4 && (
                                  <span className="text-[10px] text-slate-400">+{room.amenities.length - 4}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black font-mono text-slate-900">{formatCurrency(room.totalFare)}</p>
                              <p className="text-[10px] text-slate-400">+ {formatCurrency(room.roomTax)} tax</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking Section */}
                {selectedRoom && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Room Fare</span>
                        <span className="font-mono font-bold">{formatCurrency(selectedRoom.roomFare)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Taxes & Fees</span>
                        <span className="font-mono font-bold">{formatCurrency(selectedRoom.roomTax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                        <span className="font-bold text-slate-900">Total per night</span>
                        <span className="font-mono font-black text-xl text-emerald-700">{formatCurrency(selectedRoom.totalFare)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) {
                          setShowLogin(true);
                        } else {
                          setShowBookingModal(true);
                        }
                      }}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {user ? "Book Now" : "Sign in to Book"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <HotelBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        hotel={selectedHotel!}
        room={selectedRoom!}
        sessionId={sessionId}
        user={user}
        location={location}
        checkIn={checkIn}
        checkOut={checkOut}
        guestCount={parseInt(guests)}
      />

      <Footer />
    </>
  );
}
