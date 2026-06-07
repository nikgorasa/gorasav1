"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Wallet, Building2, Plus, ArrowUpRight, Check } from "lucide-react";

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

const CORPORATES = [
  { id: "1", name: "TechCorp India Pvt Ltd", domain: "techcorp.in", wallet: 500000, discount: 10, employees: 45 },
  { id: "2", name: "Pinnacle Ventures Ltd", domain: "pinnacle.in", wallet: 300000, discount: 8, employees: 28 },
];

export default function B2BPage() {
  const [selectedCorp, setSelectedCorp] = useState(CORPORATES[0]);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTopUp = () => {
    if (topUpAmount > 0) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTopUpAmount(0);
      }, 2000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">B2B Registry</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corporate Profiles */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Corporate Accounts</h2>
          {CORPORATES.map((corp) => (
            <div
              key={corp.id}
              onClick={() => setSelectedCorp(corp)}
              className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
                selectedCorp.id === corp.id ? "border-brand-saffron shadow-lg" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{corp.name}</h3>
                    <p className="text-sm text-slate-500">{corp.domain}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {corp.discount}% Discount
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Wallet Balance</p>
                  <p className="text-lg font-bold text-slate-900">₹{corp.wallet.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Employees</p>
                  <p className="text-lg font-bold text-slate-900">{corp.employees}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Top-up */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Wallet Top-up</h2>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-brand-saffron to-brand-burnt flex items-center justify-center">
                <Wallet size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{selectedCorp.name}</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">
                ₹{selectedCorp.wallet.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Current Balance</p>
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount)}
                  className={`py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                    topUpAmount === amount
                      ? "bg-brand-saffron text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={topUpAmount || ""}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Top Up Button */}
            {showSuccess ? (
              <div className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                <Check size={18} />
                Top-up Successful!
              </div>
            ) : (
              <button
                onClick={handleTopUp}
                disabled={topUpAmount <= 0}
                className="w-full py-3 bg-brand-saffron text-white rounded-xl font-bold hover:bg-brand-burnt transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={18} />
                Top Up ₹{topUpAmount.toLocaleString()}
              </button>
            )}

            {/* Policy */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">
                <strong>Corporate Policy:</strong> Wallet balance is non-refundable. Unused balance expires after 12 months. 
                Corporate discount applies automatically on all bookings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
