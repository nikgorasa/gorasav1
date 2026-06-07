"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { Plane, Package, CreditCard, MapPin } from "lucide-react";

export default function TripsPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              My Trips
            </h1>
            <p className="text-slate-500 mb-8">
              {user ? `Welcome back, ${user.name}` : "Sign in to view your bookings"}
            </p>

            {user ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h2>
                <p className="text-slate-500 mb-6">
                  Start exploring flights, hotels, and holiday packages to book your first trip.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="/flights"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                  >
                    Search Flights
                  </a>
                  <a
                    href="/hotels"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Search Hotels
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view trips</h2>
                <p className="text-slate-500 mb-6">
                  Access your bookings, boarding passes, and travel documents.
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-6 py-2.5 bg-brand-saffron text-white rounded-xl font-semibold text-sm hover:bg-brand-burnt transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
