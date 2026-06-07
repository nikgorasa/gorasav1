"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { LayoutDashboard, Users, Package, BarChart3, Settings, Tag, Star, Building2 } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: BarChart3 },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/promos", label: "Promo Desk", icon: Tag },
  { href: "/admin/loyalty", label: "Loyalty Club", icon: Star },
  { href: "/admin/b2b", label: "B2B Registry", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-saffron" />
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <>
        <Navbar onLoginClick={() => setShowLogin(true)} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        <main className="min-h-screen pt-16 bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Settings size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500">You need admin privileges to access this area.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="md:w-56 shrink-0">
              <nav className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-24">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Admin Panel
                </p>
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
