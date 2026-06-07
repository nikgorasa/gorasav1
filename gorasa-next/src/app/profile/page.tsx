"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { User, Mail, Shield, Star, CreditCard, Heart, Settings } from "lucide-react";

const TABS = [
  { id: "details", label: "Personal Info", icon: User },
  { id: "passengers", label: "Saved Travellers", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "loyalty", label: "Loyalty", icon: Star },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  if (!user) {
    return (
      <>
        <Navbar onLoginClick={() => setShowLogin(true)} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        <main className="min-h-screen pt-16 bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <User size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view profile</h2>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 bg-brand-saffron text-white rounded-xl font-semibold text-sm hover:bg-brand-burnt transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-saffron flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">{user.name}</h1>
                  <p className="text-slate-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-orange-100 text-brand-saffron rounded-full text-xs font-bold">
                      {user.role}
                    </span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      {user.loyaltyTier}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-brand-saffron text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                      <p className="text-slate-900 font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                      <p className="text-slate-900 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                      <p className="text-slate-900 font-medium">{user.role}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loyalty Tier</label>
                      <p className="text-slate-900 font-medium">{user.loyaltyTier}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loyalty Points</label>
                      <p className="text-slate-900 font-medium">{user.loyaltyPoints?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</label>
                      <p className="text-slate-900 font-medium">₹{user.walletBalance?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab !== "details" && (
                <div className="py-12 text-center">
                  <Settings size={48} className="mx-auto text-slate-300 mb-4" />
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h2>
                  <p className="text-slate-500">This feature will be available soon.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
