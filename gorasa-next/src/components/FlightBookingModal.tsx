"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  X, Loader2, CheckCircle, AlertCircle, Plane,
  MapPin, Calendar, Phone, Mail, User, CreditCard, Clock, Luggage,
  Tag, Building2, ChevronDown, ChevronUp, Globe
} from "lucide-react";
import CheckoutButton from "./CheckoutButton";

interface Flight {
  id: string;
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  operatingCarrier?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  tier: string;
  baggage?: string;
  cabinBaggage?: string;
  isRefundable?: boolean;
  isLCC?: boolean;
  penalty?: string;
  baseFare?: number;
  tax?: number;
  yqTax?: number;
}

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  user: { id: string; email: string; name: string } | null;
  date: string;
  passengerCount: number;
}

type BookingStep = "form" | "saving" | "checkout" | "done" | "error";

export default function FlightBookingModal({
  isOpen, onClose, flight, user, date, passengerCount,
}: FlightBookingModalProps) {
  const [step, setStep] = useState<BookingStep>("form");
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [pan, setPan] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [showGstFields, setShowGstFields] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [gstCompanyName, setGstCompanyName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const { demoMode } = useDemoMode();
  const [couponCodeUsed, setCouponCodeUsed] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    pnr: string; status: string;
  } | null>(null);

  const finalPrice = flight.price - discountApplied;
  const isValid = demoMode
    ? firstName.trim() && lastName.trim() && phone.trim().length >= 10 && email.trim()
    : firstName.trim() && lastName.trim() && phone.trim().length >= 10 && email.trim() && dateOfBirth && gender;

  const resetForm = () => {
    setStep("form");
    setErrorMessage("");
    setConfirmation(null);
    setBookingId(null);
    setDiscountApplied(0);
    setCouponCodeUsed("");
    setPromoCode("");
    setPromoError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !user) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          bookingAmount: flight.price,
          category: "FLIGHT",
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountApplied(data.discount || 0);
        setCouponCodeUsed(promoCode.trim());
        setPromoError("");
      } else {
        setPromoError(data.error || "Invalid promo code");
        setDiscountApplied(0);
        setCouponCodeUsed("");
      }
    } catch {
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBook = async () => {
    if (!isValid || !user) return;
    setStep("saving");

    try {
      const pnrCode = `GR${Date.now().toString(36).toUpperCase()}`;

      const demoDiscount = demoMode ? 500 : 0;
      const demoFinalPrice = flight.price - discountApplied - demoDiscount;
      const bookingStatus = demoMode ? "CONFIRMED" : "PENDING";

      const saveRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
          ...(demoMode ? { "x-demo-mode": "true" } : {}),
        },
        body: JSON.stringify({
          type: "FLIGHT",
          itemName: `${flight.airline} • ${flight.origin} → ${flight.destination}`,
          providerOrAirline: flight.airline,
          price: demoMode ? demoFinalPrice : finalPrice,
          originalPrice: flight.price,
          discountApplied: discountApplied + demoDiscount,
          couponCodeUsed: demoMode ? "DEMO500" : (couponCodeUsed || undefined),
          pnr: pnrCode,
          seatOrRoom: flight.tier,
          paxCount: passengerCount,
          travelDates: { departure: date || "TBD" },
          leadGuestPan: pan || undefined,
          status: bookingStatus,
          gstNumber: showGstFields ? gstNumber || undefined : undefined,
          gstCompanyName: showGstFields ? gstCompanyName || undefined : undefined,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save booking");
      }

      const saveData = await saveRes.json();
      setBookingId(saveData.id);

      if (demoMode) {
        setConfirmation({ pnr: pnrCode, status: "Confirmed" });
        setStep("done");
      } else {
        setConfirmation({ pnr: pnrCode, status: "Pending Payment" });
        setStep("checkout");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  if (!isOpen) return null;

  const formatTime = (iso: string) => {
    const parts = iso.split("T");
    return parts.length >= 2 ? parts[1].slice(0, 5) : iso;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-900">Complete Booking</h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-5">
            {/* Demo Mode Banner */}
            {demoMode && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <div>
                  <p className="text-sm font-semibold text-purple-800">Demo Mode Active</p>
                  <p className="text-xs text-purple-600">₹500 auto-discount applied • Skip payment • Booking confirmed instantly</p>
                </div>
              </div>
            )}

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Plane size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{flight.airline}</p>
                  <p className="text-xs text-slate-500">{flight.flightNumber}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={10} />{flight.origin}</span>
                <ArrowIcon />
                <span className="flex items-center gap-1"><MapPin size={10} />{flight.destination}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock size={12} />{formatTime(flight.departureTime)} – {formatTime(flight.arrivalTime)}</span>
                <span className="flex items-center gap-1"><Luggage size={12} />{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</span>
              </div>
              {date && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />{date}
                </div>
              )}
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">Total</span>
                <div className="text-right">
                  {discountApplied > 0 && (
                    <span className="text-xs text-slate-400 line-through mr-2">{formatCurrency(flight.price)}</span>
                  )}
                  <span className="font-black font-mono text-lg text-blue-700">{formatCurrency(finalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    disabled={!!couponCodeUsed}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={!!couponCodeUsed || promoLoading || !promoCode.trim()}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {promoLoading ? "..." : couponCodeUsed ? "Applied" : "Apply"}
                </button>
              </div>
              {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
              {couponCodeUsed && discountApplied > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ {couponCodeUsed} applied — {formatCurrency(discountApplied)} off</p>
              )}
            </div>

            {/* Passenger Details */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Passenger Details</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name *"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name *"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Date of Birth *</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">PAN</label>
                  <input
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Nationality</label>
                  <input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Passport No</label>
                  <input
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                    placeholder="A1234567"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Passport Expiry</label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Contact Info</label>
              <div className="space-y-3">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* B2B GST Toggle */}
            <div>
              <button
                onClick={() => setShowGstFields(!showGstFields)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Building2 size={14} />
                <span>B2B GST Invoice (Optional)</span>
                {showGstFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showGstFields && (
                <div className="mt-3 space-y-3 pl-6">
                  <input
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="GSTIN (15 characters)"
                    maxLength={15}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                  />
                  <input
                    value={gstCompanyName}
                    onChange={(e) => setGstCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}
            </div>

            {/* Action */}
            <button
              onClick={handleBook}
              disabled={!isValid}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Confirm Booking – {formatCurrency(finalPrice)}
            </button>
          </div>
        )}

        {step === "saving" && (
          <div className="p-12 text-center">
            <Loader2 size={40} className="mx-auto text-blue-600 mb-4 animate-spin" />
            <h3 className="font-bold text-slate-900 mb-1">Creating Booking...</h3>
            <p className="text-sm text-slate-500">Saving your flight reservation</p>
          </div>
        )}

        {step === "checkout" && bookingId && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Created!</h3>
            <p className="text-sm text-slate-500 mb-6">Complete payment to confirm your booking.</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-left mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">PNR</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation?.pnr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Flight</span>
                <span className="text-sm font-bold text-slate-900">{flight.airline} {flight.flightNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Route</span>
                <span className="text-sm font-bold text-slate-900">{flight.origin} → {flight.destination}</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600">Discount ({couponCodeUsed})</span>
                  <span className="text-sm font-bold text-green-600">-{formatCurrency(discountApplied)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Amount to Pay</span>
                <span className="text-sm font-black font-mono text-blue-700">{formatCurrency(finalPrice)}</span>
              </div>
            </div>

            <CheckoutButton
              bookingId={bookingId}
              amount={finalPrice}
              userEmail={email}
            />

            <button
              onClick={handleClose}
              className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Pay Later
            </button>
          </div>
        )}

        {step === "done" && confirmation && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-slate-500 mb-6">Your flight has been booked successfully.</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-left mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">PNR</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation.pnr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Status</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{confirmation.status}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Flight</span>
                <span className="text-sm font-bold text-slate-900">{flight.airline} {flight.flightNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Route</span>
                <span className="text-sm font-bold text-slate-900">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Passengers</span>
                <span className="text-sm font-bold text-slate-900">{passengerCount}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Failed</h3>
            <p className="text-sm text-red-500 mb-6">{errorMessage}</p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setStep("form"); setErrorMessage(""); }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="32" height="8" viewBox="0 0 32 8" fill="none" className="text-slate-300">
      <path d="M31.3536 4.35355C31.5488 4.15829 31.5488 3.84171 31.3536 3.64645L28.1716 0.464466C27.9763 0.269204 27.6597 0.269204 27.4645 0.464466C27.2692 0.659728 27.2692 0.976311 27.4645 1.17157L30.2929 4L27.4645 6.82843C27.2692 7.02369 27.2692 7.34027 27.4645 7.53553C27.6597 7.7308 27.9763 7.7308 28.1716 7.53553L31.3536 4.35355ZM0 4.5H31V3.5H0V4.5Z" fill="currentColor" />
    </svg>
  );
}
