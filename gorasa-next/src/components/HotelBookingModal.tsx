"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib";
import {
  X, Loader2, CheckCircle, AlertCircle, Building2,
  Bed, MapPin, Calendar, Phone, Mail, User, CreditCard,
  Tag, ChevronDown, ChevronUp, Globe, Home
} from "lucide-react";
import type { TBODisplayHotel, TBODisplayRoom } from "@/lib/tbo-hotel-types";
import CheckoutButton from "./CheckoutButton";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: TBODisplayHotel;
  room: TBODisplayRoom;
  sessionId: string;
  user: { id: string; email: string; name: string } | null;
  location: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

type BookingStep = "form" | "blocking" | "book-confirming" | "saving" | "checkout" | "done" | "error";

export default function HotelBookingModal({
  isOpen, onClose, hotel, room, sessionId, user, location,
  checkIn, checkOut, guestCount,
}: HotelBookingModalProps) {
  const [step, setStep] = useState<BookingStep>("form");
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [pan, setPan] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressCity, setAddressCity] = useState(location);
  const [passportNo, setPassportNo] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
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
    bookingId: string; pnr: string; confirmationNo: string; status: string;
  } | null>(null);

  const isInternational = hotel.hotelCode >= 10000000;
  const finalPrice = room.totalFare - discountApplied;
  const isValid = firstName.trim() && lastName.trim() && phone.trim().length >= 10 && email.trim() && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());

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
          bookingAmount: room.totalFare,
          category: "HOTEL",
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
    setStep("blocking");

    try {
      const blockRes = await fetch("/api/tbo-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block",
          sessionId,
          resultIndex: hotel.resultIndex,
          hotelCode: hotel.hotelCode,
          hotelName: hotel.name,
          room,
        }),
      });

      const blockData = await blockRes.json();

      if (!blockData.success) {
        setErrorMessage("Price could not be verified. Please try again.");
        setStep("error");
        return;
      }

      if (blockData.isPriceChanged) {
        const proceed = window.confirm(
          "The room price has changed. The new total is shown in the booking summary. Do you want to proceed?"
        );
        if (!proceed) {
          setStep("form");
          return;
        }
      }

      setStep("book-confirming");

      const clientRef = `GR-${Date.now()}`;

      const bookReqPayload = {
        action: "book",
        bookingCode: blockData.bookingCode,
        guestNationality: "IN",
        netAmount: room.totalFare,
        hotelRoomsDetails: [{
          passengers: [{
            title: "Mr",
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            paxType: 1,
            leadPassenger: true,
            age: 30,
            email: email.trim(),
            phone: phone.trim(),
            pan: pan.trim().toUpperCase(),
            passportNo: isInternational ? passportNo || undefined : undefined,
            passportExpiry: isInternational ? passportExpiry || undefined : undefined,
            addressLine1: addressLine1 || undefined,
            city: addressCity || location,
            countryCode: "IN",
            nationality: "IN",
          }]
        }]
      };

      const bookRes = await fetch("/api/tbo-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookReqPayload),
      });

      const bookData = await bookRes.json();

      if (!bookData.success) {
        setErrorMessage("Booking confirmation failed. Please try again.");
        setStep("error");
        return;
      }

      setStep("saving");

      const pnrCode = bookData.confirmationNo || clientRef;

      const saveRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": user.email },
        body: JSON.stringify({
          type: "HOTEL",
          itemName: hotel.name,
          providerOrAirline: "GoRASA",
          price: finalPrice,
          originalPrice: room.totalFare,
          discountApplied,
          couponCodeUsed: couponCodeUsed || undefined,
          pnr: pnrCode,
          seatOrRoom: room.name,
          paxCount: guestCount,
          travelDates: { checkIn, checkOut },
          status: "PENDING",
          leadGuestPan: pan.trim().toUpperCase(),
          gstNumber: showGstFields ? gstNumber || undefined : undefined,
          gstCompanyName: showGstFields ? gstCompanyName || undefined : undefined,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save booking");
      }

      const saveData = await saveRes.json();

      setBookingId(saveData.id);
      setConfirmation({
        bookingId: bookData.bookingId || clientRef,
        pnr: pnrCode,
        confirmationNo: bookData.confirmationNo || "",
        status: "Pending Payment",
      });

      if (saveToProfile && user) {
        try {
          const profileRes = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-user-email": user.email },
            body: JSON.stringify({
              passengers: [{
                id: Date.now().toString(),
                name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                relation: "Self",
                gender: "Male",
                passport: passportNo || "",
                pan: pan.trim().toUpperCase(),
              }]
            }),
          });
          if (!profileRes.ok) console.warn("Failed to save PAN to profile");
        } catch (e) {
          console.warn("Profile save failed:", e);
        }
      }

      setStep("checkout");
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  if (!isOpen) return null;

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
            {/* Booking Summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{hotel.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Bed size={12} />{room.name}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{checkIn || "TBD"} – {checkOut || "TBD"}</span>
              </div>
              {room.mealType && room.mealType !== "Room_Only" && (
                <p className="text-xs text-emerald-600 font-medium">
                  ✓ {room.mealType.replace("_", " ")} included
                </p>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">Total</span>
                <div className="text-right">
                  {discountApplied > 0 && (
                    <span className="text-xs text-slate-400 line-through mr-2">{formatCurrency(room.totalFare)}</span>
                  )}
                  <span className="font-black font-mono text-lg text-emerald-700">{formatCurrency(finalPrice)}</span>
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

            {/* Guest Details */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Guest Details</label>
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
              <p className="text-[10px] text-slate-400 mt-1">Lead guest name for booking</p>
            </div>

            {/* Identity - PAN */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Identity (Required)</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="PAN Card Number *"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Required for Indian hotel bookings (e.g. ABCDE1234F)</p>
              {pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase()) && (
                <p className="text-[10px] text-red-500 mt-1">Invalid PAN format. Expected: 5 letters + 4 digits + 1 letter</p>
              )}
            </div>

            {/* Passport (International Hotels) */}
            {isInternational && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1">
                  <Globe size={12} /> Passport Details (International Booking)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                    placeholder="Passport No"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                  />
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    placeholder="Passport Expiry"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1">
                <Home size={12} /> Address
              </label>
              <div className="space-y-3">
                <input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <input
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
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

            {user && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">Save PAN to my profile for future bookings</span>
              </label>
            )}

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
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Confirm Booking – {formatCurrency(finalPrice)}
            </button>
          </div>
        )}

        {(step === "blocking" || step === "book-confirming" || step === "saving") && (
          <div className="p-12 text-center">
            <Loader2 size={40} className="mx-auto text-emerald-600 mb-4 animate-spin" />
            <h3 className="font-bold text-slate-900 mb-1">
              {step === "blocking" && "Verifying Price..."}
              {step === "book-confirming" && "Confirming Booking with TBO..."}
              {step === "saving" && "Saving to My Trips..."}
            </h3>
            <p className="text-sm text-slate-500">
              {step === "blocking" && "Checking latest room rates & availability"}
              {step === "book-confirming" && "Finalizing your reservation"}
              {step === "saving" && "Your booking is confirmed! One moment..."}
            </p>
          </div>
        )}

        {step === "checkout" && bookingId && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CreditCard size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Created!</h3>
            <p className="text-sm text-slate-500 mb-6">Complete payment to confirm your hotel reservation.</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-left mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Confirmation No.</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation?.confirmationNo || confirmation?.pnr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Hotel</span>
                <span className="text-sm font-bold text-slate-900">{hotel.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Room</span>
                <span className="text-sm font-bold text-slate-900">{room.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Dates</span>
                <span className="text-sm font-bold text-slate-900">{checkIn} – {checkOut}</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600">Discount ({couponCodeUsed})</span>
                  <span className="text-sm font-bold text-green-600">-{formatCurrency(discountApplied)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Amount to Pay</span>
                <span className="text-sm font-black font-mono text-emerald-700">{formatCurrency(finalPrice)}</span>
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-slate-500 mb-6">Your hotel booking has been confirmed.</p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-left mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Booking ID</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation.bookingId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Confirmation No.</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation.confirmationNo || confirmation.pnr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Status</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{confirmation.status}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Hotel</span>
                <span className="text-sm font-bold text-slate-900">{hotel.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">A confirmation has been saved to My Trips.</p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 cursor-pointer"
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
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 cursor-pointer"
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
