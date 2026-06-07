"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Plane,
  Building2,
  Palmtree,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/trips", label: "My Trips", icon: Plane },
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Building2 },
  { href: "/holidays", label: "Holidays", icon: Palmtree },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Settings },
  { href: "/admin/leads", label: "Leads", icon: User },
  { href: "/admin/packages", label: "Packages", icon: Palmtree },
  { href: "/admin/users", label: "Users", icon: Shield },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-saffron to-brand-burnt rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">G</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Go<span className="text-brand-saffron">RASA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="ml-2 pl-2 border-l border-slate-200">
                {ADMIN_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Auth / User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-saffron flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-brand-saffron text-white rounded-xl font-semibold text-sm hover:bg-brand-burnt transition-colors shadow-lg shadow-orange-200 cursor-pointer"
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
