"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Ticket,
  MessageSquare,
  TrendingUp,
  LogOut,
  UserCheck,
  Menu,
  X,
  Plane,
  Building2,
  Palmtree,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/trips", label: "Reservation Desk", icon: Ticket },
  { href: "/support", label: "AI Support Desk", icon: MessageSquare },
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Building2 },
  { href: "/holidays", label: "Plan My Holiday", icon: Palmtree },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Control Tower", icon: TrendingUp },
];

export default function Navbar({
  onLoginClick,
}: {
  onLoginClick: () => void;
}) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-saffron to-brand-burnt rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">G</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Go<span className="text-brand-saffron">RASA</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 hover:border-orange-200 uppercase tracking-widest pl-2 ml-1 border-l">
              Travel Tech
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <item.icon className="w-4 h-4 mr-0.5" />
                <span>{item.label}</span>
              </Link>
            ))}
            {user && (
              <Link
                href="/profile"
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <UserCheck className="w-4 h-4 mr-0.5" />
                <span>Profile & Loyalty</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-0.5" />
                <span>Control Tower</span>
              </Link>
            )}
          </div>

          {/* Auth / User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-800 cursor-pointer hover:text-orange-600">
                    {user.name}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-[10px] text-slate-400 underline uppercase tracking-widest flex items-center cursor-pointer hover:text-red-500"
                  >
                    <LogOut className="w-3 h-3 mr-0.5" />
                    Logout
                  </button>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <UserCheck size={18} />
                  Profile & Loyalty
                </Link>
              )}
              {isAdmin && (
                <>
                  <div className="h-px bg-slate-200 my-2" />
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Admin
                  </p>
                  {ADMIN_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
