"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Gift, Star, Coffee, Plane } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discountValue: number;
  type: "flat" | "percentage";
  description: string;
  minBookingValue: number;
  active: boolean;
}

const INITIAL_PROMOS: PromoCode[] = [
  { id: "1", code: "GORASA10", discountValue: 10, type: "percentage", description: "10% off on all bookings", minBookingValue: 5000, active: true },
  { id: "2", code: "FLAT500", discountValue: 500, type: "flat", description: "₹500 off on flights", minBookingValue: 3000, active: true },
  { id: "3", code: "WELCOME200", discountValue: 200, type: "flat", description: "Welcome bonus for new users", minBookingValue: 0, active: false },
  { id: "4", code: "HOLIDAY15", discountValue: 15, type: "percentage", description: "15% off on holiday packages", minBookingValue: 10000, active: true },
];

export default function PromoCMSPage() {
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [showCreate, setShowCreate] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountValue: 0,
    type: "flat" as "flat" | "percentage",
    description: "",
    minBookingValue: 0,
  });

  const togglePromo = (id: string) => {
    setPromos(promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const deletePromo = (id: string) => {
    setPromos(promos.filter((p) => p.id !== id));
  };

  const createPromo = () => {
    if (newPromo.code && newPromo.discountValue > 0) {
      setPromos([
        ...promos,
        {
          id: Date.now().toString(),
          ...newPromo,
          active: true,
        },
      ]);
      setNewPromo({ code: "", discountValue: 0, type: "flat", description: "", minBookingValue: 0 });
      setShowCreate(false);
    }
  };

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

      {/* Create Form */}
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

      {/* Promo List */}
      <div className="space-y-3">
        {promos.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              promo.active ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  promo.active ? "bg-green-50" : "bg-slate-100"
                }`}>
                  <Tag size={20} className={promo.active ? "text-green-600" : "text-slate-400"} />
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
                    <p className="text-xs text-slate-400 mt-1">Min booking: ₹{promo.minBookingValue.toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePromo(promo.id)}
                  className="cursor-pointer"
                >
                  {promo.active ? (
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-900">{promos.length}</p>
          <p className="text-xs text-slate-500">Total Promos</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-green-600">{promos.filter((p) => p.active).length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-400">{promos.filter((p) => !p.active).length}</p>
          <p className="text-xs text-slate-500">Inactive</p>
        </div>
      </div>
    </div>
  );
}
