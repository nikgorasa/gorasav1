"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import GoRasaLogo from "./GoRasaLogo";
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

const NAV_ICONS: Record<string, React.ReactNode> = {
  Compass: <Compass size={18} />,
  Ticket: <Ticket size={18} />,
  MessageSquare: <MessageSquare size={18} />,
  Plane: <Plane size={18} />,
  Building2: <Building2 size={18} />,
  Palmtree: <Palmtree size={18} />,
  TrendingUp: <TrendingUp size={18} />,
};

export default function Navbar({
  onLoginClick,
}: {
  onLoginClick: () => void;
}) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<{ href: string; label: string; icon: string }[]>([]);
  const [adminItems, setAdminItems] = useState<{ href: string; label: string; icon: string }[]>([]);

  useEffect(() => {
    fetch("/api/navigation")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNavItems(data.filter((i: { section: string }) => i.section === "main"));
          setAdminItems(data.filter((i: { section: string }) => i.section === "admin"));
        }
      })
      .catch(() => {});
  }, []);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GoRasaLogo className="h-9 w-auto hover:opacity-90 transition-opacity" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  {NAV_ICONS[item.icon] || item.icon}
                  <span>{item.label}</span>
                </motion.span>
              </Link>
            ))}
            {user && (
              <Link
                href="/profile"
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Profile & Loyalty</span>
                </motion.span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-1.3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Control Tower</span>
                </motion.span>
              </Link>
            )}
          </div>

          {/* Auth / User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="flex flex-col items-end">
                  <motion.span
                    whileHover={{ color: "#ea580c" }}
                    className="text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {user.name}
                  </motion.span>
                  <button
                    onClick={signOut}
                    className="text-[10px] text-slate-400 underline uppercase tracking-widest flex items-center cursor-pointer hover:text-red-500"
                  >
                    <LogOut className="w-3 h-3 mr-0.5" />
                    Logout
                  </button>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer"
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </motion.div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={onLoginClick}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
              >
                Sign In
              </motion.button>
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {NAV_ICONS[item.icon] || item.icon}
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
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
                    >
                      {NAV_ICONS[item.icon] || item.icon}
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
