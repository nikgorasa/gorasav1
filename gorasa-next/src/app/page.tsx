"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { Plane, Building2, Palmtree, ArrowRight, Star, Shield, Clock, Headphones } from "lucide-react";
import Link from "next/link";

const VALUE_PROPS = [
  { icon: Shield, title: "Verified Rates", desc: "Best price guarantee on every booking" },
  { icon: Clock, title: "24/7 Support", desc: "Concierge-led premium assistance" },
  { icon: Star, title: "Loyalty Rewards", desc: "Earn points on every trip" },
  { icon: Headphones, title: "WhatsApp Concierge", desc: "Instant support via WhatsApp" },
];

const SEARCH_TABS = [
  { id: "flights", label: "Flights", icon: Plane, href: "/flights", color: "from-blue-500 to-blue-600" },
  { id: "hotels", label: "Hotels", icon: Building2, href: "/hotels", color: "from-emerald-500 to-emerald-600" },
  { id: "holidays", label: "Plan My Holiday", icon: Palmtree, href: "/holidays", color: "from-brand-saffron to-brand-burnt" },
];

export default function HomePage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-brand-saffron rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-brand-gold rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 bg-brand-saffron/20 text-brand-saffron rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Experience The Finest
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                Your Journey,{" "}
                <span className="text-brand-saffron italic">Elevated</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Premium flights, luxury hotels, and curated holiday experiences
                across India and the world.
              </p>
            </motion.div>

            {/* Search Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {SEARCH_TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="group relative bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl p-6 text-center transition-all hover:bg-white/15"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${tab.color} flex items-center justify-center shadow-lg`}>
                    <tab.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{tab.label}</h3>
                  <p className="text-slate-400 text-sm">Search & Book</p>
                  <ArrowRight
                    size={18}
                    className="absolute top-6 right-6 text-slate-500 group-hover:text-white transition-colors"
                  />
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {VALUE_PROPS.map((prop, i) => (
                <motion.div
                  key={prop.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-50 flex items-center justify-center">
                    <prop.icon size={24} className="text-brand-saffron" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{prop.title}</h3>
                  <p className="text-slate-500 text-xs">{prop.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-brand-saffron to-brand-burnt">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Ready to Experience The Finest?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of travelers who trust GoRASA for their premium travel needs.
            </p>
            {!user ? (
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-3 bg-white text-brand-saffron rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg cursor-pointer"
              >
                Get Started
              </button>
            ) : (
              <Link
                href="/flights"
                className="inline-block px-8 py-3 bg-white text-brand-saffron rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
              >
                Search Flights
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
