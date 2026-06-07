"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import PackageCarousel from "@/components/PackageCarousel";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import {
  Plane,
  Building2,
  Palmtree,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Headphones,
  TrendingUp,
  Calendar,
  Compass,
  Sparkles,
  Sun,
  Award,
} from "lucide-react";
import Link from "next/link";
import {
  TOP_DEALS,
  WEEKEND_DEALS,
  INTERNATIONAL_PACKAGES,
  ALL_INCLUSIVE_DEALS,
  BEACH_VACATIONS,
  GORASA_SELECT,
  type TravelPackage,
} from "@/lib/packages-data";

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

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Frequent Traveler", text: "GoRASA made our Maldives trip absolutely magical. The attention to detail was incredible.", rating: 5 },
  { name: "Rahul Mehta", role: "Corporate Client", text: "Best corporate travel management we've used. Seamless booking and premium support.", rating: 5 },
  { name: "Anita Desai", role: "Honeymooner", text: "The Udaipur package exceeded all expectations. Every moment was perfectly curated.", rating: 5 },
];

export default function HomePage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [backendPackages, setBackendPackages] = useState<TravelPackage[]>([]);

  useEffect(() => {
    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBackendPackages(
            data.map((p: any) => ({
              id: p.id,
              title: p.title,
              duration: p.duration,
              price: p.price,
              originalPrice: p.originalPrice,
              rating: p.rating,
              imageUrl: p.images ? JSON.parse(p.images)[0] : "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
              provider: p.provider,
              inclusions: p.inclusions ? JSON.parse(p.inclusions) : [],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
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
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${tab.color} flex items-center justify-center shadow-lg`}
                  >
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

        {/* Package Carousels */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Live from Database */}
            {backendPackages.length > 0 && (
              <PackageCarousel
                title="Live from Database"
                subtitle="Packages loaded from the GoRASA backend API — real data, live prices."
                icon={<Sparkles className="w-3.5 h-3.5 text-violet-600" />}
                items={backendPackages}
                badgeColor="bg-violet-50 text-violet-600 border border-violet-100"
                badgeText="Live Data"
              />
            )}

            {/* Top Deals */}
            <PackageCarousel
              title="Top Holiday Deals"
              subtitle="Our most selected and highly discounted luxury seasonal packages."
              icon={<TrendingUp className="w-3.5 h-3.5 text-orange-600" />}
              items={TOP_DEALS}
              badgeColor="bg-orange-50 text-orange-600 border border-orange-100"
              badgeText="Top Deals"
            />

            {/* Weekend Deals */}
            <PackageCarousel
              title="Weekend Gateways"
              subtitle="Fast mini-vacations, premium nature stays, and heritage wellness boutique villas."
              icon={<Calendar className="w-3.5 h-3.5 text-emerald-600" />}
              items={WEEKEND_DEALS}
              badgeColor="bg-emerald-50 text-emerald-600 border border-emerald-100"
              badgeText="Weekend Deals"
            />

            {/* International */}
            <PackageCarousel
              title="International Packages"
              subtitle="Epic bucket-list escapes from Dubai, Maldives waters and cold Swiss Alps."
              icon={<Compass className="w-3.5 h-3.5 text-blue-600" />}
              items={INTERNATIONAL_PACKAGES}
              badgeColor="bg-blue-50 text-blue-600 border border-blue-100"
              badgeText="International"
            />

            {/* All Inclusive */}
            <PackageCarousel
              title="All-Inclusive Stays"
              subtitle="Indulge with peace-of-mind package structures providing transfers, unlimited gourmet, flights, and activities."
              icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
              items={ALL_INCLUSIVE_DEALS}
              badgeColor="bg-purple-50 text-purple-600 border border-purple-100"
              badgeText="All Inclusive"
            />

            {/* Beach */}
            <PackageCarousel
              title="Beach Vacations"
              subtitle="Golden sands, private beachfront villas, surfing instructions, and incredible sunset waters."
              icon={<Sun className="w-3.5 h-3.5 text-amber-600" />}
              items={BEACH_VACATIONS}
              badgeColor="bg-amber-50 text-amber-600 border border-amber-100"
              badgeText="Beach"
            />

            {/* GoRASA Select */}
            <PackageCarousel
              title="GoRASA Select Exclusives"
              subtitle="Handpicked, ultra-VIP heritage palace suites, Michelin eco-retreats, and butler-serviced packages."
              icon={<Award className="w-3.5 h-3.5 text-rose-600" />}
              items={GORASA_SELECT}
              badgeColor="bg-rose-50 text-rose-600 border border-rose-100"
              badgeText="GoRASA Select"
            />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                What Our Travelers Say
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Trusted by thousands of travelers for premium experiences across India and the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Travel */}
        <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-brand-saffron font-bold uppercase tracking-widest text-xs">
                  Corporate Travel
                </span>
                <h2 className="text-3xl font-serif font-bold text-white mt-2 mb-4">
                  Business Travel, Elevated
                </h2>
                <p className="text-slate-400 mb-6">
                  Streamline your corporate travel with dedicated account management, negotiated rates, and 24/7 concierge support.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Dedicated account manager", "Negotiated corporate rates", "Expense management dashboard", "24/7 priority support"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Shield size={16} className="text-brand-saffron" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-saffron text-white rounded-xl font-bold hover:bg-brand-burnt transition-colors"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                    alt="Corporate Travel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Trusted by 500+</p>
                      <p className="text-slate-500 text-xs">Corporate partners</p>
                    </div>
                  </div>
                </div>
              </div>
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
