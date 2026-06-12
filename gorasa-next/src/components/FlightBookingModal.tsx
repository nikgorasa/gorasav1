"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib";
import {
  X, Loader2, CheckCircle, AlertCircle, Plane,
  MapPin, Calendar, Phone, Mail, User, CreditCard, Clock, Luggage
} from "lucide-react";

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  tier: string;
}

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  user: { id: string; email: string; name: string } | null;
  date: string;
  passengerCount: number;
}

type BookingStep = "form" | "saving" | "done" | "error";

export default function FlightBookingModal({
  isOpen, onClose, flight, user, date, passengerCount,
}: FlightBookingModalProps) {
  const [step, setStep] = useState<BookingStep>("form");
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState<{
    pnr: string; status: string;
  } | null>(null);

  const isValid = firstName.trim() && lastName.trim() && phone.trim().length >= 10 && email.trim();

  const resetForm = () => {
    setStep("form");
    setErrorMessage("");
    setConfirmation(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBook = async () => {
    if (!isValid || !user) return;

    setStep("saving");

    try {
      const pnrCode = `GR${Date.now().toString(36).toUpperCase()}`;

      const saveRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": user.email },
        body: JSON.stringify({
          type: "FLIGHT",
          itemName: `${flight.airline} • ${flight.origin} → ${flight.destination}`,
          providerOrAirline: flight.airline,
          price: flight.price,
          pnr: pnrCode,
          seatOrRoom: flight.tier,
          paxCount: passengerCount,
          travelDates: { departure: date || "TBD" },
          status: "CONFIRMED",
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save booking");
      }

      setConfirmation({ pnr: pnrCode, status: "Confirmed" });
      setStep("done");
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
                <span className="font-black font-mono text-lg text-blue-700">{formatCurrency(flight.price)}</span>
              </div>
            </div>

            {/* Passenger Details */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Passenger Details</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name *"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name *"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Lead passenger name for booking</p>
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

            {/* Action */}
            <button
              onClick={handleBook}
              disabled={!isValid}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Confirm Booking – {formatCurrency(flight.price)}
            </button>
          </div>
        )}

        {/* Saving */}
        {step === "saving" && (
          <div className="p-12 text-center">
            <Loader2 size={40} className="mx-auto text-blue-600 mb-4 animate-spin" />
            <h3 className="font-bold text-slate-900 mb-1">Confirming Booking...</h3>
            <p className="text-sm text-slate-500">Finalizing your flight reservation</p>
          </div>
        )}

        {/* Confirmation */}
        {step === "done" && confirmation && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-blue-600" />
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{confirmation.status}</span>
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

        {/* Error */}
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
