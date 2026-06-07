"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { motion } from "motion/react";
import { Palmtree, Send, MapPin, Calendar, Users, MessageSquare } from "lucide-react";

export default function HolidaysPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16">
        <section className="bg-gradient-to-br from-brand-saffron to-brand-burnt py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                <Palmtree size={32} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Plan My Holiday
              </h1>
              <p className="text-orange-100">
                Tell us your dream destination and we&apos;ll craft the perfect itinerary
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Destination (e.g., Bali, Maldives, Goa)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="Number of days"
                    min="1"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="Number of travelers"
                    min="1"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    placeholder="Special requests or inclusions (e.g., honeymoon setup, adventure activities)"
                    rows={1}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-brand-saffron text-white rounded-xl font-bold hover:bg-brand-burnt transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Send size={18} />
                Submit Inquiry
              </button>
              <p className="mt-3 text-xs text-slate-500">
                * Pricing displayed as &ldquo;Starting From ₹XX,XXX* Per Person on Twin Sharing Basis&rdquo;
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Palmtree size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Inquiry-based holidays</h2>
            <p className="text-slate-500">
              Our travel experts will craft a personalized itinerary for your dream holiday.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
