"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Building2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatCurrency } from "@/lib";

interface CorporateRate {
  id: string;
  companyId: string;
  companyName: string;
  category: string;
  destination: string | null;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function CorporateRatesPage() {
  const [rates, setRates] = useState<CorporateRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRate, setNewRate] = useState({
    companyId: "",
    category: "ALL",
    destination: "",
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscount: "",
  });

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/corporate-rates");
      const data = await res.json();
      setRates(data || []);
    } catch (err) {
      console.error("Failed to fetch corporate rates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const toggleRate = async (id: string) => {
    const rate = rates.find((r) => r.id === id);
    if (!rate) return;
    try {
      const res = await fetch(`/api/corporate-rates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rate.isActive }),
      });
      if (res.ok) fetchRates();
    } catch (err) {
      console.error("Failed to toggle corporate rate:", err);
    }
  };

  const deleteRate = async (id: string) => {
    try {
      const res = await fetch(`/api/corporate-rates/${id}`, { method: "DELETE" });
      if (res.ok) fetchRates();
    } catch (err) {
      console.error("Failed to delete corporate rate:", err);
    }
  };

  const createRate = async () => {
    if (!newRate.companyId || newRate.discountValue <= 0) return;
    try {
      const payload = {
        ...newRate,
        maxDiscount: newRate.maxDiscount ? Number(newRate.maxDiscount) : null,
      };
      const res = await fetch("/api/corporate-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewRate({
          companyId: "",
          category: "ALL",
          destination: "",
          discountType: "PERCENT",
          discountValue: 10,
          maxDiscount: "",
        });
        setShowCreate(false);
        fetchRates();
      }
    } catch (err) {
      console.error("Failed to create corporate rate:", err);
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
        <h1 className="text-2xl font-serif font-bold text-slate-900">Corporate Rates</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-saffron text-white rounded-xl text-sm font-medium hover:bg-brand-burnt cursor-pointer"
        >
          <Plus size={16} />
          Add Corporate Rate
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 mb-6"
        >
          <h3 className="font-bold text-slate-900 mb-4">Create New Corporate Rate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Company ID</label>
              <input
                value={newRate.companyId}
                onChange={(e) => setNewRate({ ...newRate, companyId: e.target.value })}
                placeholder="Company ID"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Type</label>
              <select
                value={newRate.discountType}
                onChange={(e) => setNewRate({ ...newRate, discountType: e.target.value as "PERCENT" | "FLAT" })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                Discount Value {newRate.discountType === "FLAT" ? "(₹)" : "(%)"}
              </label>
              <input
                type="number"
                value={newRate.discountValue || ""}
                onChange={(e) => setNewRate({ ...newRate, discountValue: Number(e.target.value) })}
                placeholder={newRate.discountType === "FLAT" ? "500" : "10"}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Category</label>
              <select
                value={newRate.category}
                onChange={(e) => setNewRate({ ...newRate, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="ALL">All</option>
                <option value="HOTEL">Hotel</option>
                <option value="FLIGHT">Flight</option>
                <option value="PACKAGE">Package</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Max Discount (₹)</label>
              <input
                type="number"
                value={newRate.maxDiscount}
                onChange={(e) => setNewRate({ ...newRate, maxDiscount: e.target.value })}
                placeholder="Cap for % promos"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createRate}
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
        {rates.map((rate, i) => (
          <motion.div
            key={rate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              rate.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rate.isActive ? "bg-green-50" : "bg-slate-100"
                }`}>
                  <Building2 size={20} className={rate.isActive ? "text-green-600" : "text-slate-400"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-lg">Company: {rate.companyName || rate.companyId}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      rate.discountType === "FLAT" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {rate.discountType === "FLAT" ? `₹${rate.discountValue}` : `${rate.discountValue}%`}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700`}>{
                      rate.category
                    }</span>
                  </div>
                  {rate.destination && (
                    <p className="text-sm text-slate-500 mt-1">📍 Destination: {rate.destination}</p>
                  )}
                  {rate.maxDiscount && (
                    <p className="text-xs text-slate-400 mt-1">Max disc: ₹{rate.maxDiscount}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRate(rate.id)} className="cursor-pointer">
                  {rate.isActive ? (
                    <ToggleRight size={32} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-300" />
                  )}
                </button>
                <button
                  onClick={() => deleteRate(rate.id)}
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
          <p className="text-2xl font-bold text-slate-900">{rates.length}</p>
          <p className="text-xs text-slate-500">Total Rates</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-green-600">{rates.filter((r) => r.isActive).length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-400">{rates.filter((r) => !r.isActive).length}</p>
          <p className="text-xs text-slate-500">Inactive</p>
        </div>
      </div>
    </div>
  );
}
