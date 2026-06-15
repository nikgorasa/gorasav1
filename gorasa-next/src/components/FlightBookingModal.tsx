"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  X, Loader2, CheckCircle, AlertCircle, Plane,
  MapPin, Calendar, Phone, Mail, User, CreditCard, Clock, Luggage,
  Tag, Building2, ChevronDown, ChevronUp, Globe, Zap, Utensils, Armchair
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

interface SSRBaggage {
  Code: string;
  Weight: string;
  Price: number;
  AirlineCode: string;
  FlightNumber: string;
}

interface SSRMeal {
  Code: string;
  Description: string;
  AirlineDescription: string;
  Price: number;
}

interface SSRSeat {
  Code: string;
  RowNo: string;
  SeatNo: string;
  SeatType: string;
  Price: number;
}

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  user: { id: string; email: string; name: string } | null;
  date: string;
  passengerCount: number;
}

type BookingStep = "form" | "addons" | "saving" | "checkout" | "done" | "error";

export default function FlightBookingModal({
  isOpen, onClose, flight, user, date, passengerCount,
}: FlightBookingModalProps) {
  const { demoMode } = useDemoMode();
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
  const [couponCodeUsed, setCouponCodeUsed] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    pnr: string; status: string;
  } | null>(null);

  // SSR Add-ons state
  const [ssrLoading, setSsrLoading] = useState(false);
  const [ssrBaggage, setSsrBaggage] = useState<SSRBaggage[]>([]);
  const [ssrMeals, setSsrMeals] = useState<SSRMeal[]>([]);
  const [ssrSeats, setSsrSeats] = useState<SSRSeat[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<string>("");
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string>("");

  const baggageFee = ssrBaggage.find(b => b.Code === selectedBaggage)?.Price || 0;
  const mealsFee = ssrMeals.filter(m => selectedMeals.includes(m.Code)).reduce((s, m) => s + m.Price, 0);
  const seatFee = ssrSeats.find(s => s.Code === selectedSeat)?.Price || 0;
  const addonsTotal = baggageFee + mealsFee + seatFee;

  const finalPrice = flight.price - discountApplied;
  const demoDiscount = demoMode ? 500 : 0;
  const totalPayable = finalPrice - demoDiscount + addonsTotal;
  const isValid = firstName.trim() && lastName.trim() && phone.trim().length >= 10 && email.trim();
  const prefilled = firstName && lastName && phone && email;

  const resetForm = () => {
    setStep("form");
    setErrorMessage("");
    setConfirmation(null);
    setBookingId(null);
    setDiscountApplied(0);
    setCouponCodeUsed("");
    setPromoCode("");
    setPromoError("");
    setSelectedBaggage("");
    setSelectedMeals([]);
    setSelectedSeat("");
    setSsrBaggage([]);
    setSsrMeals([]);
    setSsrSeats([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePrefill = () => {
    setFirstName("Amit");
    setLastName("Patel");
    setPhone("9876543210");
    setEmail("amit@example.com");
    setDateOfBirth("1992-05-15");
    setGender("M");
    setPan("ABCRS1234F");
    setPassportNo("A1234567");
    setPassportExpiry("2030-12-31");
    setNationality("Indian");
    setGstNumber("27AABCR1234M1Z5");
    setGstCompanyName("GoRASA Travel Services");
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

  const fetchSSR = async () => {
    if (!flight.isLCC) {
      setStep("saving");
      handleBook();
      return;
    }
    setStep("addons");
    setSsrLoading(true);
    try {
      const res = await fetch("/api/tbo-flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ssr", traceId: "demo", resultIndex: flight.id, demo: demoMode }),
      });
      const data = await res.json();
      setSsrBaggage(data.baggage || []);
      setSsrMeals(data.meals || []);
      setSsrSeats(data.seats || []);
    } catch {
      setSsrBaggage([]);
      setSsrMeals([]);
      setSsrSeats([]);
    } finally {
      setSsrLoading(false);
    }
  };

  const toggleMeal = (code: string) => {
    setSelectedMeals(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const handleBook = async () => {
    if (!isValid || !user) return;
    setStep("saving");

    try {
      const pnrCode = `GR${Date.now().toString(36).toUpperCase()}`;

      const addOns: Record<string, unknown> = {};
      if (selectedBaggage) {
        const b = ssrBaggage.find(x => x.Code === selectedBaggage);
        if (b) addOns.baggage = { code: b.Code, weight: b.Weight, price: b.Price };
      }
      if (selectedMeals.length > 0) {
        addOns.meals = selectedMeals.map(code => {
          const m = ssrMeals.find(x => x.Code === code);
          return { code, description: m?.Description, price: m?.Price || 0 };
        });
      }
      if (selectedSeat) {
        const s = ssrSeats.find(x => x.Code === selectedSeat);
        if (s) addOns.seat = { code: s.Code, seatNo: `${s.RowNo}${s.SeatNo}`, type: s.SeatType, price: s.Price };
      }

      const saveRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          type: "FLIGHT",
          itemName: `${flight.airline} • ${flight.origin} → ${flight.destination}`,
          providerOrAirline: flight.airline,
          price: totalPayable,
          originalPrice: flight.price,
          discountApplied,
          couponCodeUsed: couponCodeUsed || undefined,
          pnr: pnrCode,
          seatOrRoom: flight.tier,
          paxCount: passengerCount,
          travelDates: date || "TBD",
          leadGuestPan: pan || undefined,
          status: "PENDING",
          gstNumber: showGstFields ? gstNumber || undefined : undefined,
          gstCompanyName: showGstFields ? gstCompanyName || undefined : undefined,
          addOns: Object.keys(addOns).length > 0 ? JSON.stringify(addOns) : undefined,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save booking");
      }

      const saveData = await saveRes.json();
      setBookingId(saveData.id);
      setConfirmation({ pnr: pnrCode, status: "Pending Payment" });
      setStep("checkout");
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
          <h2 className="text-lg font-bold text-slate-900">
            {step === "addons" ? "Flight Add-ons" : "Complete Booking"}
          </h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== "done" && step !== "error" && (
          <div className="px-6 py-2 flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${step === "form" ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-500"}`}>1. Details</span>
            {flight.isLCC && <span className={`px-2 py-1 rounded-full ${step === "addons" ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-500"}`}>2. Add-ons</span>}
            <span className={`px-2 py-1 rounded-full ${step === "saving" || step === "checkout" ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-500"}`}>{flight.isLCC ? "3" : "2"}. Pay</span>
          </div>
        )}

        {/* FORM STEP */}
        {step === "form" && (
          <div className="p-6 space-y-5">
            {/* Demo Mode Banner */}
            {demoMode && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧪</span>
                  <div>
                    <p className="text-sm font-semibold text-purple-800">Demo Mode</p>
                    <p className="text-xs text-purple-600">Use code DEMO500 for ₹500 off</p>
                  </div>
                </div>
                <button
                  onClick={handlePrefill}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 cursor-pointer"
                >
                  <Zap size={12} />
                  Fill Demo Data
                </button>
              </div>
            )}

            {!demoMode && !prefilled && (
              <button
                onClick={handlePrefill}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
              >
                <Zap size={14} />
                Quick Fill Demo Data
              </button>
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
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600"><Luggage size={12} />{flight.baggage || "15 KG"} checked</span>
                <span className="flex items-center gap-1 text-slate-600"><Luggage size={12} />{flight.cabinBaggage || "7 KG"} cabin</span>
                {flight.isLCC && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">LCC</span>}
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
                    placeholder={demoMode ? "DEMO500" : "Enter promo code"}
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
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name *" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name *" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Date of Birth *</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Gender *</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">PAN</label>
                  <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Nationality</label>
                  <input value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Passport No</label>
                  <input value={passportNo} onChange={(e) => setPassportNo(e.target.value.toUpperCase())} placeholder="A1234567" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Passport Expiry</label>
                  <input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Contact Info</label>
              <div className="space-y-3">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number *" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
            </div>

            {/* B2B GST Toggle */}
            <div>
              <button onClick={() => setShowGstFields(!showGstFields)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                <Building2 size={14} />
                <span>B2B GST Invoice (Optional)</span>
                {showGstFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showGstFields && (
                <div className="mt-3 space-y-3 pl-6">
                  <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="GSTIN (15 characters)" maxLength={15} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase" />
                  <input value={gstCompanyName} onChange={(e) => setGstCompanyName(e.target.value)} placeholder="Company Name" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
              )}
            </div>

            <button
              onClick={fetchSSR}
              disabled={!isValid}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {flight.isLCC ? (
                <><Luggage size={18} /> Continue to Add-ons</>
              ) : (
                <><CreditCard size={18} /> Confirm Booking – {formatCurrency(totalPayable)}</>
              )}
            </button>
          </div>
        )}

        {/* ADD-ONS STEP */}
        {step === "addons" && (
          <div className="p-6 space-y-5">
            {ssrLoading ? (
              <div className="py-12 text-center">
                <Loader2 size={32} className="mx-auto text-blue-600 mb-3 animate-spin" />
                <p className="text-sm text-slate-500">Loading add-ons...</p>
              </div>
            ) : (
              <>
                {/* Baggage */}
                {ssrBaggage.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Luggage size={16} className="text-blue-500" />
                      <h3 className="font-bold text-slate-900 text-sm">Extra Baggage</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Included: {flight.baggage || "15 KG"} per passenger</p>
                    <div className="space-y-2">
                      {ssrBaggage.map((b) => (
                        <label
                          key={b.Code}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedBaggage === b.Code ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="baggage"
                              checked={selectedBaggage === b.Code}
                              onChange={() => setSelectedBaggage(b.Code === selectedBaggage ? "" : b.Code)}
                              className="text-blue-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{b.Weight}</p>
                              <p className="text-xs text-slate-500">{b.AirlineCode} {b.FlightNumber}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${b.Price === 0 ? "text-green-600" : "text-slate-900"}`}>
                            {b.Price === 0 ? "Free" : `+${formatCurrency(b.Price)}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meals */}
                {ssrMeals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils size={16} className="text-orange-500" />
                      <h3 className="font-bold text-slate-900 text-sm">Meals</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ssrMeals.map((m) => (
                        <label
                          key={m.Code}
                          className={`flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedMeals.includes(m.Code) ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMeals.includes(m.Code)}
                            onChange={() => toggleMeal(m.Code)}
                            className="text-orange-600 mb-1"
                          />
                          <p className="text-xs font-medium text-slate-900 text-center">{m.Description}</p>
                          <p className="text-xs font-bold text-slate-700">+{formatCurrency(m.Price)}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seats */}
                {ssrSeats.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Armchair size={16} className="text-purple-500" />
                      <h3 className="font-bold text-slate-900 text-sm">Seat Selection</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ssrSeats.map((s) => (
                        <label
                          key={s.Code}
                          className={`flex flex-col items-center p-2 rounded-xl border cursor-pointer transition-all ${
                            selectedSeat === s.Code ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="seat"
                            checked={selectedSeat === s.Code}
                            onChange={() => setSelectedSeat(s.Code === selectedSeat ? "" : s.Code)}
                            className="text-purple-600 mb-1"
                          />
                          <p className="text-xs font-bold text-slate-900">{s.RowNo}{s.SeatNo}</p>
                          <p className="text-[10px] text-slate-500">{s.SeatType}</p>
                          <p className="text-[10px] font-bold text-slate-700">+{formatCurrency(s.Price)}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Flight Fare</span>
                    <span className="text-slate-900">{formatCurrency(flight.price)}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Promo ({couponCodeUsed})</span>
                      <span className="text-green-600">-{formatCurrency(discountApplied)}</span>
                    </div>
                  )}
                  {demoMode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">Demo Discount</span>
                      <span className="text-purple-600">-{formatCurrency(500)}</span>
                    </div>
                  )}
                  {baggageFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Extra Baggage</span>
                      <span className="text-slate-900">+{formatCurrency(baggageFee)}</span>
                    </div>
                  )}
                  {mealsFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Meals ({selectedMeals.length})</span>
                      <span className="text-slate-900">+{formatCurrency(mealsFee)}</span>
                    </div>
                  )}
                  {seatFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Seat</span>
                      <span className="text-slate-900">+{formatCurrency(seatFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-black font-mono text-lg text-blue-700">{formatCurrency(totalPayable)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("form")}
                    className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBook}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Proceed to Pay – {formatCurrency(totalPayable)}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* SAVING STEP */}
        {step === "saving" && (
          <div className="p-12 text-center">
            <Loader2 size={40} className="mx-auto text-blue-600 mb-4 animate-spin" />
            <h3 className="font-bold text-slate-900 mb-1">Creating Booking...</h3>
            <p className="text-sm text-slate-500">Saving your flight reservation</p>
          </div>
        )}

        {/* CHECKOUT STEP */}
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
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Class</span>
                <span className="text-sm font-bold text-slate-900">{flight.tier}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price Breakup</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Fare ({passengerCount} pax)</span>
                  <span className="text-slate-900">{formatCurrency(flight.baseFare || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxes & Surcharges</span>
                  <span className="text-slate-900">{formatCurrency(flight.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatCurrency(flight.price)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Promo ({couponCodeUsed})</span>
                    <span className="text-green-600">-{formatCurrency(discountApplied)}</span>
                  </div>
                )}
                {demoMode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">Demo Discount</span>
                    <span className="text-purple-600">-{formatCurrency(500)}</span>
                  </div>
                )}
                {baggageFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Extra Baggage</span>
                    <span className="text-slate-900">+{formatCurrency(baggageFee)}</span>
                  </div>
                )}
                {mealsFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Meals ({selectedMeals.length})</span>
                    <span className="text-slate-900">+{formatCurrency(mealsFee)}</span>
                  </div>
                )}
                {seatFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Seat ({ssrSeats.find(s => s.Code === selectedSeat)?.SeatType})</span>
                    <span className="text-slate-900">+{formatCurrency(seatFee)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="font-black font-mono text-lg text-blue-700">{formatCurrency(totalPayable)}</span>
                </div>
              </div>
            </div>

            <CheckoutButton bookingId={bookingId} amount={totalPayable} userEmail={email} />

            <button onClick={handleClose} className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
              Pay Later
            </button>
          </div>
        )}

        {/* DONE STEP */}
        {step === "done" && confirmation && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-slate-500 mb-6">Your flight has been booked successfully.</p>
            <button onClick={handleClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer">Done</button>
          </div>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Failed</h3>
            <p className="text-sm text-red-500 mb-6">{errorMessage}</p>
            <div className="flex gap-2">
              <button onClick={handleClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 cursor-pointer">Cancel</button>
              <button onClick={() => { setStep("form"); setErrorMessage(""); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer">Try Again</button>
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
