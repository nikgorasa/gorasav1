"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Gift, Star, Coffee, Plane } from "lucide-react";
import { formatCurrency } from "@/lib";

interface PromoCode {
  id: string;
  code: string;
  discountValue: number;
  type: "flat" | "percentage";
  description: string;
  minBookingValue: number;
  isActive: boolean;
}

export default function PromoCMSPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountValue: 0,
    type: "flat" as "flat" | "percentage",
    description: "",
    minBookingValue: 0,
  });

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/promos");
      const data = await res.json();
      setPromos(data || []);
    } catch (err) {
      console.error("Failed to fetch promos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const togglePromo = async (id: string) => {
    const promo = promos.find((p) => p.id === id);
    if (!promo) return;
    try {
      const res = await fetch(`/api/promos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) fetchPromos();
    } catch (err) {
      console.error("Failed to toggle promo:", err);
    }
  };

  const deletePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/promos/${id}`, { method: "DELETE" });
      if (res.ok) fetchPromos();
    } catch (err) {
      console.error("Failed to delete promo:", err);
    }
  };

  const createPromo = async () => {
    if (newPromo.code && newPromo.discountValue > 0) {
      try {
        const res = await fetch("/api/promos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPromo),
        });
        if (res.ok) {
          setNewPromo({ code: "", discountValue: 0, type: "flat", description: "", minBookingValue: 0 });
          setShowCreate(false);
          fetchPromos();
        }
      } catch (err) {
        console.error("Failed to create promo:", err);
      }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Promo Desk</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-saffron text-white rounded-xl text-sm font-medium hover:bg-brand-burnt cursor-pointer"
        >
          <Plus size={16} />
          Create Promo
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 mb-6"
        >
          <h3 className="font-bold text-slate-900 mb-4">Create New Promo Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Code</label>
              <input
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2026"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Type</label>
              <select
                value={newPromo.type}
                onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as "flat" | "percentage" })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                Discount Value {newPromo.type === "flat" ? "(₹)" : "(%)"}
              </label>
              <input
                type="number"
                value={newPromo.discountValue || ""}
                onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                placeholder={newPromo.type === "flat" ? "500" : "10"}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Min Booking Value (₹)</label>
              <input
                type="number"
                value={newPromo.minBookingValue || ""}
                onChange={(e) => setNewPromo({ ...newPromo, minBookingValue: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Description</label>
              <input
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                placeholder="10% off on all bookings"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createPromo}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 cursor-pointer"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {promos.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              promo.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  promo.isActive ? "bg-green-50" : "bg-slate-100"
                }`}>
                  <Tag size={20} className={promo.isActive ? "text-green-600" : "text-slate-400"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-lg">{promo.code}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      promo.type === "flat" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {promo.type === "flat" ? `₹${promo.discountValue}` : `${promo.discountValue}%`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{promo.description}</p>
                  {promo.minBookingValue > 0 && (
                    <p className="text-xs text-slate-400 mt-1">Min booking: {formatCurrency(promo.minBookingValue)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePromo(promo.id)}
                  className="cursor-pointer"
                >
                  {promo.isActive ? (
                    <ToggleRight size={32} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-300" />
                  )}
                </button>
                <button
                  onClick={() => deletePromo(promo.id)}
                  className="p-2 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-900">{promos.length}</p>
          <p className="text-xs text-slate-500">Total Promos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-green-600">{promos.filter((p) => p.isActive).length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-400">{promos.filter((p) => !p.isActive).length}</p>
          <p className="text-xs text-slate-500">Inactive</p>
        </div>
      </div>
    </div>
  );
}
