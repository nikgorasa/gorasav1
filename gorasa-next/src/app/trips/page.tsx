"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import BoardingPassModal from "@/components/BoardingPassModal";
import InvoiceModal from "@/components/InvoiceModal";
import WhatsAppModal from "@/components/WhatsAppModal";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";
import { formatCurrency, formatDate, formatTravelDates } from "@/lib";
import { Plane, Package, CreditCard, MapPin, Calendar, Users, FileText, X, Ticket, Receipt, MessageSquare } from "lucide-react";

interface Booking {
  id: string;
  type: string;
  itemName: string;
  providerOrAirline?: string;
  price: number;
  originalPrice?: number;
  discountApplied: number;
  status: string;
  pnr?: string;
  seatOrRoom?: string;
  paxCount: number;
  travelDates?: string;
  bookedAt: string;
}

export default function TripsPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [boardingPassBooking, setBoardingPassBooking] = useState<Booking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [whatsappBooking, setWhatsappBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelResult, setCancelResult] = useState<{
    refundAmount?: number;
    cancellationFee?: number;
    refundPercentage?: number;
  } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch("/api/bookings", {
        headers: { "x-user-email": user.email },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setBookings(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      case "CANCELLATION_REQUESTED": return "bg-orange-100 text-orange-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FLIGHT": return Plane;
      case "HOTEL": return MapPin;
      case "PACKAGE": return Package;
      default: return CreditCard;
    }
  };

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              My Bookings
            </h1>
            <p className="text-slate-500 mb-8">
              {user ? `Welcome back, ${user.name}` : "Sign in to view your bookings"}
            </p>

            {!user ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Plane size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view trips</h2>
                <p className="text-slate-500 mb-6">
                  Access your bookings, boarding passes, and travel documents.
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-6 py-2.5 bg-brand-saffron text-white rounded-xl font-semibold text-sm hover:bg-brand-burnt transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-saffron" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No trips yet</h2>
                <p className="text-slate-500 mb-6">
                  Start exploring flights, hotels, and holiday packages to book your first trip.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="/flights"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                  >
                    Search Flights
                  </a>
                  <a
                    href="/hotels"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Search Hotels
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Stats */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Loyalty Tier</p>
                      <p className="text-lg font-bold text-slate-900">{user.loyaltyTier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Points</p>
                      <p className="text-lg font-bold text-slate-900">{user.loyaltyPoints?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Wallet</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(user.walletBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Total Bookings</p>
                      <p className="text-lg font-bold text-slate-900">{bookings.length}</p>
                    </div>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const TypeIcon = getTypeIcon(booking.type);
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                              <TypeIcon size={24} className="text-brand-saffron" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{booking.itemName}</h3>
                              {booking.providerOrAirline && (
                                <p className="text-sm text-slate-500">{booking.providerOrAirline}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {booking.pnr && (
                                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                    PNR: {booking.pnr}
                                  </span>
                                )}
                                {booking.travelDates && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatTravelDates(booking.travelDates)}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Users size={12} />
                                  {booking.paxCount} pax
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <p className="text-xl font-bold text-slate-900 mt-2">
                              {formatCurrency(booking.price)}
                            </p>
                            {booking.originalPrice && booking.originalPrice > booking.price && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatCurrency(booking.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBoardingPassBooking(booking);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
                          >
                            <Ticket size={14} />
                            {booking.type === "FLIGHT" ? "Boarding Pass" : "Voucher"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvoiceBooking(booking);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
                          >
                            <Receipt size={14} />
                            Invoice
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhatsappBooking(booking);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 cursor-pointer"
                          >
                            <MessageSquare size={14} />
                            WhatsApp
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8"
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
                {React.createElement(getTypeIcon(selectedBooking.type), { size: 32, className: "text-brand-saffron" })}
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedBooking.itemName}</h2>
              {selectedBooking.providerOrAirline && (
                <p className="text-slate-500">{selectedBooking.providerOrAirline}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">PNR</p>
                  <p className="font-mono font-bold text-slate-900">{selectedBooking.pnr || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Travel Dates</p>
                  <p className="font-medium text-slate-900">{formatTravelDates(selectedBooking.travelDates)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Passengers</p>
                  <p className="font-medium text-slate-900">{selectedBooking.paxCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Seat/Room</p>
                  <p className="font-medium text-slate-900">{selectedBooking.seatOrRoom || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Booked On</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(selectedBooking.bookedAt)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    {selectedBooking.originalPrice && selectedBooking.originalPrice > selectedBooking.price && (
                      <p className="text-sm text-slate-400 line-through">
                        {formatCurrency(selectedBooking.originalPrice)}
                      </p>
                    )}
                    <p className="text-3xl font-black font-mono text-slate-900">
                      {formatCurrency(selectedBooking.price)}
                    </p>
                  </div>
                  {selectedBooking.status === "CONFIRMED" && !cancelSuccess && !showCancelConfirm && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                {showCancelConfirm && !cancelSuccess && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl space-y-3">
                    {!cancelReason ? (
                      <>
                        <p className="text-sm font-medium text-red-800">Cancellation Policy</p>
                        <div className="bg-white rounded-xl p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Booking Amount</span>
                            <span className="font-bold text-slate-900">{formatCurrency(selectedBooking.price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">Refund (100%)</span>
                            <span className="font-bold text-green-600">{formatCurrency(selectedBooking.price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Cancellation Fee</span>
                            <span className="font-bold text-slate-900">₹0</span>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between">
                            <span className="font-bold text-slate-900">You will receive</span>
                            <span className="font-bold text-green-600">{formatCurrency(selectedBooking.price)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">Free cancellation within 24 hours of booking.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCancelReason(" ")}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 cursor-pointer"
                          >
                            Proceed to Cancel
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 cursor-pointer"
                          >
                            Go Back
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-red-800">Please provide a reason for cancellation</p>
                        <input
                          type="text"
                          value={cancelReason === " " ? "" : cancelReason}
                          onChange={(e) => setCancelReason(e.target.value || " ")}
                          placeholder="Reason for cancellation..."
                          className="w-full px-4 py-2 bg-white border border-red-200 rounded-xl text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const reason = cancelReason.trim() || "No reason provided";
                              if (!user) return;
                              setCancelling(true);
                              try {
                                const res = await fetch("/api/cancellations", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ bookingId: selectedBooking.id, userId: user.id, reason }),
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setCancelResult(data);
                                  setCancelSuccess(true);
                                  setBookings(bookings.map((b) => b.id === selectedBooking.id ? { ...b, status: "CANCELLED" } : b));
                                  setSelectedBooking({ ...selectedBooking, status: "CANCELLED" });
                                }
                              } catch (err) {
                                console.error("Cancellation failed:", err);
                              } finally {
                                setCancelling(false);
                              }
                            }}
                            disabled={cancelling}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                          >
                            {cancelling ? "Processing..." : "Confirm Cancellation"}
                          </button>
                          <button
                            onClick={() => {
                              setShowCancelConfirm(false);
                              setCancelReason("");
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 cursor-pointer"
                          >
                            Go Back
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {cancelSuccess && cancelResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl space-y-2">
                    <p className="text-sm font-medium text-green-800">✓ Booking cancelled successfully</p>
                    {cancelResult.refundAmount !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Refund Amount</span>
                          <span className="font-bold text-green-700">{formatCurrency(cancelResult.refundAmount)}</span>
                        </div>
                        {cancelResult.cancellationFee !== undefined && cancelResult.cancellationFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600">Cancellation Fee</span>
                            <span className="font-bold text-red-600">{formatCurrency(cancelResult.cancellationFee)}</span>
                          </div>
                        )}
                        {cancelResult.refundPercentage !== undefined && (
                          <p className="text-xs text-green-600">{cancelResult.refundPercentage}% refund as per policy</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedBooking.status === "CANCELLED" && !cancelSuccess && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">This booking has been cancelled.</p>
                  </div>
                )}

                {selectedBooking.status === "CANCELLATION_REQUESTED" && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                    <p className="text-sm text-orange-700 font-medium">Cancellation request is being processed.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Boarding Pass Modal */}
      {boardingPassBooking && user && (
        <BoardingPassModal
          isOpen={!!boardingPassBooking}
          onClose={() => setBoardingPassBooking(null)}
          booking={boardingPassBooking}
          userName={user.name}
        />
      )}

      {/* Invoice Modal */}
      {invoiceBooking && user && (
        <InvoiceModal
          isOpen={!!invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
          booking={invoiceBooking}
          userName={user.name}
          userEmail={user.email}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsappBooking && user && (
        <WhatsAppModal
          isOpen={!!whatsappBooking}
          onClose={() => setWhatsappBooking(null)}
          booking={whatsappBooking}
          userName={user.name}
        />
      )}

      <Footer />
    </>
  );
}
