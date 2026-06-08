"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import InquiryModal from "@/components/InquiryModal";
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
  User,
  CreditCard,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface PackageItem {
  id: string;
  title: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  provider: string;
  inclusions: string[];
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}
const SEARCH_TABS = [
  { id: "flights", label: "Flights", icon: Plane, href: "/flights", color: "from-blue-500 to-blue-600" },
  { id: "hotels", label: "Hotels", icon: Building2, href: "/hotels", color: "from-emerald-500 to-emerald-600" },
  { id: "holidays", label: "Plan My Holiday", icon: Palmtree, href: "/holidays", color: "from-brand-saffron to-brand-burnt" },
];

export default function HomePage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [carouselPackages, setCarouselPackages] = useState<Record<string, PackageItem[]>>({});
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryPackage, setInquiryPackage] = useState<PackageItem | null>(null);
  const [stats, setStats] = useState({ companies: "500+", bookings: "50K+", rating: "4.9" });
  const [categories, setCategories] = useState<Record<string, { title: string; subtitle: string; icon: string; badgeColor: string; badgeText: string }>>({});
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [valueProps, setValueProps] = useState<{ icon: string; title: string; description: string }[]>([]);

  const ICON_MAP: Record<string, React.ReactNode> = {
    Shield: <Shield className="w-6 h-6" />,
    Clock: <Clock className="w-6 h-6" />,
    Star: <Star className="w-6 h-6" />,
    Headphones: <Headphones className="w-6 h-6" />,
    TrendingUp: <TrendingUp className="w-3.5 h-3.5 text-orange-600" />,
    Calendar: <Calendar className="w-3.5 h-3.5 text-emerald-600" />,
    Compass: <Compass className="w-3.5 h-3.5 text-blue-600" />,
    Sparkles: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
    Sun: <Sun className="w-3.5 h-3.5 text-amber-600" />,
    Award: <Award className="w-3.5 h-3.5 text-rose-600" />,
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/packages/carousel").then((r) => r.json()),
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()).catch(() => ({})),
      fetch("/api/categories").then((r) => r.json()).catch(() => ({})),
      fetch("/api/value-propositions").then((r) => r.json()).catch(() => []) as Promise<{ icon: string; title: string; description: string }[]>,
    ])
      .then(([pkgData, testimonialData, dashboardData, categoriesData, valuePropsData]) => {
        if (pkgData.grouped) setCarouselPackages(pkgData.grouped);
        if (Array.isArray(testimonialData)) setTestimonials(testimonialData);
        if (dashboardData.totalCompanies) setStats({ companies: `${dashboardData.totalCompanies}+`, bookings: `${dashboardData.totalBookings}+`, rating: "4.9" });

        if (Array.isArray(categoriesData)) {
          const catMap: Record<string, { title: string; subtitle: string; icon: string; badgeColor: string; badgeText: string }> = {};
          const order: string[] = [];
          categoriesData.forEach((cat: { id: string; title: string; subtitle: string; icon: string; badgeColor: string; badgeText: string; sortOrder: number }) => {
            catMap[cat.id] = { title: cat.title, subtitle: cat.subtitle, icon: cat.icon, badgeColor: cat.badgeColor, badgeText: cat.badgeText };
            order.push(cat.id);
          });
          setCategories(catMap);
          setCategoryOrder(order);
        }
        if (Array.isArray(valuePropsData)) setValueProps(valuePropsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <InquiryModal
        isOpen={!!inquiryPackage}
        onClose={() => setInquiryPackage(null)}
        pkg={inquiryPackage}
        userName={user?.name}
        userEmail={user?.email}
      />

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
              {valueProps.map((prop, i) => (
                <motion.div
                  key={prop.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-50 flex items-center justify-center">
                    {ICON_MAP[prop.icon]}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{prop.title}</h3>
                  <p className="text-slate-500 text-xs">{prop.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Package Carousels */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-brand-saffron" />
              </div>
            ) : (
              categoryOrder.map((cat) => {
                const items = carouselPackages[cat];
                if (!items || items.length === 0) return null;
                const meta = categories[cat];
                if (!meta) return null;
                return (
                  <PackageCarousel
                    key={cat}
                    title={meta.title}
                    subtitle={meta.subtitle}
                    icon={ICON_MAP[meta.icon]}
                    items={items}
                    badgeColor={meta.badgeColor}
                    badgeText={meta.badgeText}
                    onInterested={setInquiryPackage}
                  />
                );
              })
            )}
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
              {(testimonials.length > 0 ? testimonials : []).map((testimonial, i) => (
                <motion.div
                  key={testimonial.id || testimonial.name}
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
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-saffron rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div>
                <span className="inline-block text-brand-saffron font-bold uppercase tracking-widest text-[10px] bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-4">
                  Corporate Travel
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-5 leading-tight">
                  Business Travel,<br />
                  <span className="text-brand-saffron italic">Elevated</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
                  Streamline your corporate travel with dedicated account management, negotiated rates, and 24/7 concierge support.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {[
                    { icon: User, label: "Dedicated account manager" },
                    { icon: TrendingUp, label: "Negotiated corporate rates" },
                    { icon: CreditCard, label: "Expense management dashboard" },
                    { icon: Headphones, label: "24/7 priority support" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-brand-saffron/20 flex items-center justify-center shrink-0">
                        <item.icon size={16} className="text-brand-saffron" />
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-saffron text-white rounded-xl font-bold hover:bg-brand-burnt transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/holidays"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/10"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Image + Stats */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80"
                    alt="Corporate Travel - Modern office building"
                    className="w-full h-[400px] object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-3xl" />
                </div>

                {/* Stats Cards */}
                <div className="absolute -bottom-6 left-6 right-6 flex gap-3">
                  <div className="flex-1 bg-white rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{stats.companies}</p>
                        <p className="text-slate-500 text-xs">Corporate Partners</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{stats.bookings}</p>
                        <p className="text-slate-500 text-xs">Bookings Made</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{stats.rating}</p>
                        <p className="text-slate-500 text-xs">Client Rating</p>
                      </div>
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
