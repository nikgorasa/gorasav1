"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Gift, Star, Coffee, Plane, Crown, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/LoginModal";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  imageColor: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee size={24} />,
  Star: <Star size={24} />,
  Crown: <Crown size={24} />,
  Plane: <Plane size={24} />,
  Gift: <Gift size={24} />,
};

interface HistoryEntry {
  action: string;
  points: string;
  date: string;
  type: "earned" | "redeemed";
}

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      setRewards(data || []);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user?.id) { setHistoryLoading(false); return; }
    try {
      const res = await fetch(`/api/loyalty/history?userId=${user.id}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    setUserPoints(user?.loyaltyPoints ?? 0);
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user?.id]);

  const handleRedeem = async (rewardId: string) => {
    if (!user) { setShowLogin(true); return; }
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward || (user.loyaltyPoints ?? 0) < reward.pointsCost) return;

    try {
      const res = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        setRedeemed([...redeemed, rewardId]);
        setUserPoints((prev) => prev - reward.pointsCost);
      }
    } catch (err) {
      console.error("Failed to redeem:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-saffron" />
      </div>
    );
  }

  return (
    <div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Loyalty Club</h1>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl px-4 py-2 text-white">
          <p className="text-xs opacity-80">Available Points</p>
          <p className="text-xl font-bold">{userPoints.toLocaleString()}</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward, i) => {
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
                  {ICON_MAP[reward.icon] || <Gift size={24} />}
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
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-saffron" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No points history yet. Book a trip to start earning!</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm text-slate-900">{entry.action}</p>
                  <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`font-mono font-bold ${entry.type === "earned" ? "text-green-600" : "text-red-500"}`}>
                  {entry.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
