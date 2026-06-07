"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, CheckCircle } from "lucide-react";
import type { TravelPackage } from "@/lib/packages-data";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: TravelPackage | null;
  userName?: string;
  userEmail?: string;
}

export default function InquiryModal({ isOpen, onClose, pkg, userName, userEmail }: InquiryModalProps) {
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: pkg.title,
          travelerName: name,
          travelerEmail: email,
          travelerPhone: phone,
          numberOfDays: parseInt(pkg.duration) || 5,
          inclusions: JSON.stringify(pkg.inclusions),
          notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError("Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !pkg) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle size={32} className="text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Inquiry Submitted!</h2>
              <p className="text-slate-500">Our travel experts will contact you within 24 hours.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="text-brand-saffron font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
                  Package Inquiry
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mt-3 mb-1">
                  {pkg.title}
                </h2>
                <p className="text-slate-500 text-sm">
                  {pkg.duration} • Starting From ₹{pkg.price.toLocaleString()}* Per Person
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Special Requests</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron outline-none resize-none"
                    placeholder="Any special requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-saffron text-white rounded-xl font-bold hover:bg-brand-burnt transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting..." : (
                    <>
                      <Send size={16} />
                      Submit Inquiry
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  * Pricing displayed as &ldquo;Starting From ₹{pkg.price.toLocaleString()}* Per Person on Twin Sharing Basis&rdquo;
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
