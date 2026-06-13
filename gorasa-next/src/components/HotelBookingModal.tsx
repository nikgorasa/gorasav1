"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib";
import {
  X, Loader2, CheckCircle, AlertCircle, Building2,
  Bed, MapPin, Calendar, Phone, Mail, User, CreditCard
} from "lucide-react";
import type { TBODisplayHotel, TBODisplayRoom } from "@/lib/tbo-hotel-types";

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

type BookingStep = "form" | "blocking" | "book-confirming" | "saving" | "done" | "error";

export default function HotelBookingModal({
  isOpen, onClose, hotel, room, sessionId, user, location,
  checkIn, checkOut, guestCount,
}: HotelBookingModalProps) {
  const [step, setStep] = useState<BookingStep>("form");
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState<{
    bookingId: string; pnr: string; confirmationNo: string; status: string;
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
        ClientReferenceNumber: clientRef,
        GuestNationality: "IN",
        Guests: {
          Guest: [
            {
              Title: "Mr",
              FirstName: firstName.trim(),
              LastName: lastName.trim(),
              Age: 30,
              LeadGuest: true,
              GuestType: "ADT",
              GuestInRoom: 1,
            },
          ],
        },
        AddressInfo: {
          AddressLine1: "N/A",
          CountryCode: "IN",
          AreaCode: "000000",
          PhoneNo: phone.trim(),
          Email: email.trim(),
          City: location,
          State: "N/A",
          Country: "India",
          ZipCode: "000000",
        },
        PaymentInfo: {
          VoucherBooking: false,
          PaymentModeType: "Credit",
        },
        SessionId: sessionId,
        NoOfRooms: 1,
        ResultIndex: hotel.resultIndex,
        HotelCode: hotel.hotelCode,
        HotelName: hotel.name,
        HotelRooms: {
          HotelRoom: [
            {
              RoomIndex: room.roomIndex,
              RoomTypeName: room.name,
              RoomTypeCode: room.typeCode,
              RatePlanCode: room.ratePlanCode,
              RoomRate: {
                RoomFare: room.roomFare,
                RoomTax: room.roomTax,
                TotalFare: room.totalFare,
                Currency: room.currency,
              },
            },
          ],
        },
      };

      const bookRes = await fetch("/api/tbo-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "book", params: bookReqPayload }),
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
          price: room.totalFare,
          pnr: pnrCode,
          seatOrRoom: room.name,
          paxCount: guestCount,
          travelDates: { checkIn, checkOut },
          status: "CONFIRMED",
        }),
      });

      setConfirmation({
        bookingId: bookData.bookingId || clientRef,
        pnr: pnrCode,
        confirmationNo: bookData.confirmationNo || "",
        status: bookData.status || "Confirmed",
      });

      setStep("done");
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
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">Total</span>
                <span className="font-black font-mono text-lg text-emerald-700">{formatCurrency(room.totalFare)}</span>
              </div>
            </div>

            {/* Guest Details */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Guest Details</label>
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
              <p className="text-[10px] text-slate-400 mt-1">Lead guest name for booking</p>
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
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Confirm Booking – {formatCurrency(room.totalFare)}
            </button>
          </div>
        )}

        {/* Processing States */}
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

        {/* Confirmation */}
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
                <span className="text-xs text-slate-500">PNR</span>
                <span className="text-sm font-bold font-mono text-slate-900">{confirmation.pnr}</span>
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
