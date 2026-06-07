"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Search, Calendar, Users, Star, MapPin, X, Wifi, Coffee, Car } from "lucide-react";
import { searchHotels, adjustHotelPrice, INDIAN_CITIES, type Hotel, type SearchParams } from "@/lib/travel-data";

export default function HotelsPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [location, setLocation] = useState("Goa");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [results, setResults] = useState<Hotel[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("all");

  const handleSearch = () => {
    const params: SearchParams = {
      location,
      startDate: checkIn,
      endDate: checkOut,
      adults: parseInt(guests),
      children: 0,
    };
    let hotels = searchHotels(params);
    if (brandFilter !== "all") {
      hotels = hotels.filter((h) => h.brand.toLowerCase() === brandFilter);
    }
    if (checkIn && checkOut) {
      hotels = hotels.map((h) => adjustHotelPrice(h, checkIn, checkOut));
    }
    setResults(hotels);
    setSearched(true);
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Premium": return "bg-amber-100 text-amber-700";
      case "Global": return "bg-blue-100 text-blue-700";
      default: return "bg-green-100 text-green-700";
    }
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
              <p className="text-emerald-100 text-sm">Luxury stays and premium hotels worldwide</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-xl"
            >
              {/* Brand Filter */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "premium", "oyo", "global"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors capitalize ${
                      brandFilter === b ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {b === "all" ? "All Hotels" : b === "oyo" ? "Budget (OYO)" : b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {INDIAN_CITIES.concat(["Maldives", "Dubai", "Singapore"]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
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
                className="mt-4 w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={18} />
                Search Hotels
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
                <h2 className="text-xl font-bold text-slate-900 mb-2">Search for hotels</h2>
                <p className="text-slate-500">Enter your destination and dates to find luxury stays.</p>
                <p className="text-slate-400 text-sm mt-2">Default 22% markup with override hierarchy (Hotel &gt; Destination &gt; Global).</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No hotels found</h2>
                <p className="text-slate-500">Try a different location or dates.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 mb-4">{results.length} hotels found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((hotel, i) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => setSelectedHotel(hotel)}
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getBrandColor(hotel.brand)}`}>
                            {hotel.brand}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-amber-400 text-slate-900 font-extrabold text-[11px] px-2 py-1 rounded-lg flex items-center">
                          <Star className="w-3 h-3 fill-slate-900 mr-0.5" />
                          {hotel.rating}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {hotel.location}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{hotel.description}</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-black font-mono text-slate-900">₹{hotel.price.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">per night</p>
                          </div>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer">
                            View
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

      {/* Hotel Detail Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedHotel(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="h-56 relative">
                <img
                  src={selectedHotel.imageUrl}
                  alt={selectedHotel.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button onClick={() => setSelectedHotel(null)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full">
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getBrandColor(selectedHotel.brand)}`}>
                    {selectedHotel.brand} • {selectedHotel.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{selectedHotel.name}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <MapPin size={14} />
                  {selectedHotel.location}
                </p>
                <p className="text-slate-600 text-sm mb-4">{selectedHotel.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">{selectedHotel.rating}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Wifi size={16} />
                    <Coffee size={16} />
                    <Car size={16} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-3xl font-black font-mono text-slate-900">₹{selectedHotel.price.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">per night • 22% markup included</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < Math.floor(selectedHotel.rating) ? "fill-amber-400" : ""} />
                        ))}
                      </div>
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
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
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
