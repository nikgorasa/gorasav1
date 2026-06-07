"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Gift, Star, Coffee, Plane, Crown, Check } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
  category: string;
  imageColor: string;
}

const REWARDS: Reward[] = [
  {
    id: "1",
    name: "Airport Lounge Access",
    description: "One-time access to premium airport lounges across India",
    pointsCost: 2000,
    icon: <Coffee size={24} />,
    category: "Travel Perks",
    imageColor: "bg-amber-100 text-amber-600",
  },
  {
    id: "2",
    name: "In-Flight Meal Upgrade",
    description: "Upgrade to premium meal on your next flight booking",
    pointsCost: 1500,
    icon: <Star size={24} />,
    category: "Travel Perks",
    imageColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "3",
    name: "Business Lounge Pass",
    description: "Full-day access to business lounge at select airports",
    pointsCost: 3500,
    icon: <Crown size={24} />,
    category: "Premium",
    imageColor: "bg-purple-100 text-purple-600",
  },
  {
    id: "4",
    name: "Extra Baggage Allowance",
    description: "Additional 10kg baggage on domestic flights",
    pointsCost: 1000,
    icon: <Plane size={24} />,
    category: "Travel Perks",
    imageColor: "bg-green-100 text-green-600",
  },
  {
    id: "5",
    name: "Hotel Spa Voucher",
    description: "₹2,000 spa voucher at partner luxury hotels",
    pointsCost: 2500,
    icon: <Gift size={24} />,
    category: "Wellness",
    imageColor: "bg-rose-100 text-rose-600",
  },
  {
    id: "6",
    name: "Priority Check-in",
    description: "Skip the queue with priority check-in at airports",
    pointsCost: 800,
    icon: <Star size={24} />,
    category: "Travel Perks",
    imageColor: "bg-cyan-100 text-cyan-600",
  },
];

export default function LoyaltyPage() {
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [userPoints] = useState(10000); // Mock user points

  const handleRedeem = (rewardId: string) => {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (reward && userPoints >= reward.pointsCost && !redeemed.includes(rewardId)) {
      setRedeemed([...redeemed, rewardId]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Loyalty Club</h1>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-4 py-2 text-white">
          <p className="text-xs opacity-80">Available Points</p>
          <p className="text-xl font-bold">{userPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6">
        {["All", "Travel Perks", "Premium", "Wellness"].map((cat) => (
          <button
            key={cat}
            className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 cursor-pointer"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map((reward, i) => {
          const isRedeemed = redeemed.includes(reward.id);
          const canAfford = userPoints >= reward.pointsCost;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                isRedeemed ? "border-green-200 bg-green-50/30" : "border-slate-200"
              }`}
            >
              <div className={`p-6 ${reward.imageColor}`}>
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center mb-3">
                  {reward.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {reward.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-1">{reward.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Points Required</p>
                    <p className="text-lg font-bold text-slate-900">{reward.pointsCost.toLocaleString()}</p>
                  </div>
                  {isRedeemed ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                      <Check size={16} />
                      Redeemed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                        canAfford
                          ? "bg-brand-saffron text-white hover:bg-brand-burnt"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Redeem" : "Insufficient"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Points History */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Points History</h2>
        <div className="space-y-3">
          {[
            { action: "Flight booking (Mumbai → Delhi)", points: "+520", date: "2 Jun 2026", type: "earned" },
            { action: "Hotel booking (Taj Exotica Goa)", points: "+455", date: "28 May 2026", type: "earned" },
            { action: "Referral bonus (Amit Patel)", points: "+500", date: "25 May 2026", type: "earned" },
            { action: "Redeemed: Lounge Access", points: "-2,000", date: "20 May 2026", type: "redeemed" },
          ].map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm text-slate-900">{entry.action}</p>
                <p className="text-xs text-slate-400">{entry.date}</p>
              </div>
              <span className={`font-mono font-bold ${
                entry.type === "earned" ? "text-green-600" : "text-red-500"
              }`}>
                {entry.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
