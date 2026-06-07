import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, User } from '../types';
import { 
  Plane, 
  Hotel, 
  Calendar, 
  User as UserIcon, 
  QrCode, 
  FileText, 
  Tag, 
  X, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Ticket,
  Printer
} from 'lucide-react';

interface MyTripsProps {
  user: User | null;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ user, bookings, onCancelBooking }) => {
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<Booking | null>(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>('');
  const [whatsAppSent, setWhatsAppSent] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 max-w-2xl mx-auto shadow-sm my-12">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
          <UserIcon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Sign In to View Trips</h3>
        <p className="text-slate-500 text-sm mb-6">
          Access your personalized travel dashboard, view flight boarding passes, and manage corporate corporate bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
            Passport Locker
          </span>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mt-2">Your Reservation Desk</h2>
          <p className="text-slate-500 text-sm mt-1">Manage seats, print invoices, or redeem rewards upgrades.</p>
        </div>
        
        {/* User Stats Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex items-center space-x-6 shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest block">Loyalty Level</span>
            <span className={`text-sm font-bold uppercase tracking-wider block ${
              user.loyaltyTier === 'Platinum' ? 'text-cyan-400' : user.loyaltyTier === 'Gold' ? 'text-amber-400' : 'text-slate-300'
            }`}>
              ✦ {user.loyaltyTier}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest block">Available Points</span>
            <span className="text-lg font-bold text-orange-400">{user.loyaltyPoints.toLocaleString()} PTS</span>
          </div>
          {(user.role === 'corporate' || user.role === 'agent') && (
            <>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest block">
                  {user.role === 'corporate' ? 'Corporate Wallet' : 'B2B Agent Balance'}
                </span>
                <span className="text-lg font-bold text-green-400">₹{user.walletBalance.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No booked reservations yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Your bookings will appear here. Try searching for flights, luxury hotels, or packages above to build your passport profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Type Icon */}
              <div className="flex items-center space-x-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  booking.status === 'Cancelled' || booking.status === 'Refunded'
                    ? 'bg-red-50 text-red-500' 
                    : booking.type === 'flight' 
                      ? 'bg-blue-50 text-blue-600' 
                      : booking.type === 'hotel' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {booking.type === 'flight' ? <Plane className="w-6 h-6" /> : booking.type === 'hotel' ? <Hotel className="w-6 h-6" /> : <Ticket className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-slate-900">{booking.itemName}</h3>
                    <span className={`text-[10px] font-bold px-2 rounded-full uppercase tracking-wider ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    Booked on {new Date(booking.bookedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="mx-2">•</span> PNR: <span className="font-mono font-bold text-slate-800 uppercase">{booking.pnr}</span>
                  </p>
                </div>
              </div>

              {/* Booking Details Middle */}
              <div className="flex items-center space-x-8 text-center md:text-left w-full md:w-auto mt-4 md:mt-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Travel Dates</span>
                  <span className="text-sm font-medium text-slate-700 mt-1 flex items-center justify-center md:justify-start gap-1">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    {booking.travelDates}
                  </span>
                </div>
                {booking.seatOrRoom && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {booking.type === 'flight' ? 'Seat' : 'Room Config'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1">{booking.seatOrRoom}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price Paid</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1">₹{booking.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                {booking.status === 'Confirmed' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedPass(booking)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/20 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Pass</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedInvoice(booking)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/20 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Receipt</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setSelectedWhatsApp(booking);
                        setWhatsAppPhone(user.email.startsWith('rasatravelindia') ? '+91 98860 12345' : '+91 98765 43210');
                        setWhatsAppSent(false);
                      }}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-green-300 hover:bg-green-50/20 text-slate-700 hover:text-green-600 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-green-500 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.022-.08-.124-.223-.284-.338C15.82 13.06 14.28 12.54 13.932 12.385c-.347-.156-.63-.234-.9.156-.272.39-.738.908-.9 1.1-.165.19-.328.21-.61.08-.28-.135-1.18-.435-2.25-1.39-.83-.74-1.39-1.655-1.55-1.945-.165-.29-.02-.45.12-.59.12-.13.28-.33.42-.495.14-.16.19-.28.28-.46s.05-.34-.02-.495c-.08-.16-.74-1.785-1.01-2.435-.262-.634-.528-.55-.72-.56h-.615c-.21 0-.555.08-.847.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.435 5.45 4.82 1.385.6 2.05.7 2.765.6.795-.11 2.432-1 2.775-1.97.34-.97.34-1.8.24-1.97-.1-.17-.3-.27-.6-.42zm-5.462 7.15c-1.82 0-3.61-.49-5.18-1.42l-.37-.22-3.85 1.01 1.03-3.75-.24-.38C2.5 15.01 2 13.07 2 11.08 2 5.52 6.53 1 12.09 1c2.69 0 5.22 1.05 7.12 2.95C21.1 5.85 22.14 8.38 22.14 11.08c-.01 5.56-4.54 10.08-10.13 10.08zm0-21.8c-6.19 0-11.23 5.04-11.23 11.23 0 2.15.56 4.25 1.63 6.1l-1.73 6.32 6.47-1.7c1.78.97 3.79 1.48 5.86 1.48 6.19 0 11.23-5.04 11.23-11.23-.01-2.99-1.18-5.8-3.3-7.92A11.165 11.165 0 0 0 12.01.27z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onCancelBooking(booking.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel Booking
                    </motion.button>
                  </>
                )}
                {booking.status !== 'Confirmed' && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>Refunded & Closed</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {/* digital pass Boarding Pass modal */}
      <AnimatePresence>
        {selectedPass && (
          <motion.div
            key="pass-modal"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
                exit: { opacity: 0 }
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedPass(null)}
            />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: 10 }
              }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className="relative bg-gradient-to-b from-slate-900 to-slate-800 text-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
            {/* Top Bar branding */}
            <div className="bg-orange-500 py-4 px-6 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span>GoRASA Virtual Pass</span>
              <button onClick={() => setSelectedPass(null)} className="text-white hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Ticket body */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-400">
                    {selectedPass.type === 'flight' ? <Plane className="w-5 h-5" /> : selectedPass.type === 'hotel' ? <Hotel className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{selectedPass.itemName}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{selectedPass.providerOrAirline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase">PNR Code</p>
                  <p className="font-mono font-extrabold text-sm text-orange-400 tracking-wider uppercase">{selectedPass.pnr}</p>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="border-t border-dashed border-white/20 w-full"></div>

              {/* Flight info or stay details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Passenger Name</p>
                  <p className="font-bold text-sm mt-1">{user.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Class / Room Type</p>
                  <p className="font-bold text-sm mt-1">{selectedPass.seatOrRoom || 'Standard Entry'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Travel Dates</p>
                  <p className="font-bold text-slate-300 mt-1">{selectedPass.travelDates}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Status Code</p>
                  <p className="font-bold text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    CONFIRMED
                  </p>
                </div>
              </div>

              {/* QR area */}
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 shadow-inner my-4">
                {/* Simulated beautiful QR SVG */}
                <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100">
                  <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill="currentColor"/>
                  <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill="currentColor"/>
                  <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill="currentColor"/>
                  <path d="M35,10 h5 v10 h-5 z M45,10 h15 v5 h-15 z M50,20 h10 v5 h-10 z" fill="currentColor"/>
                  <path d="M10,35 h15 v5 h-15 z M30,35 h15 v15 h-5 v-10 h-10 z M10,50 h15 v5 h-15 z" fill="currentColor"/>
                  <path d="M70,35 h5 v15 h15 v-10 h-15 z M85,50 h5 v10 h-5 z" fill="currentColor"/>
                  <path d="M35,65 h10 v10 h10 v15 h-5 v-10 h-15 z M50,80 h5 v5 h-5 z" fill="currentColor"/>
                  <path d="M70,70 h20 v5 h-15 v5 h5 v5 h-10 z M80,85 h10 v5 h-10 z" fill="currentColor"/>
                </svg>
                <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500">GR-PASS-{selectedPass.id.toUpperCase()}</p>
              </div>

              <p className="text-[10px] text-center text-slate-400 uppercase tracking-wider">
                Please present QR voucher at desk check-in
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* official Invoice modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            key="invoice-modal"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
                exit: { opacity: 0 }
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: 10 }
              }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className="relative bg-white text-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 border border-slate-100"
            >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="font-bold text-slate-900 text-2xl tracking-tighter bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">GoRASA</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">RASA Online Travel Pvt Ltd</p>
                <p className="text-[9px] text-slate-400">Bangalore, Karnataka, India • support@gorasa.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-700 uppercase tracking-widest block">Tax Invoice</span>
                <span className="text-xs text-slate-400 block mt-1">Invoice: #GR-{selectedInvoice.id.slice(-8).toUpperCase()}</span>
                <span className="text-xs text-slate-400 block">Date: {new Date(selectedInvoice.bookedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 py-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Customer Details</p>
                <p className="font-bold text-slate-800 mt-1">{user.name}</p>
                <p className="text-slate-500 mt-0.5">{user.email}</p>
                {user.companyName && <p className="text-slate-500 font-medium">Corp: {user.companyName}</p>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Reservation Details</p>
                <p className="font-bold text-slate-800 mt-1">{selectedInvoice.itemName}</p>
                <p className="text-slate-500 mt-0.5">PNR: {selectedInvoice.pnr}</p>
                <p className="text-slate-500">Travel Dates: {selectedInvoice.travelDates}</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <table className="w-full text-left text-xs border-y border-slate-100 my-6">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[9px] tracking-wider py-2">
                  <th className="py-3">Service Element</th>
                  <th className="py-3 text-center">Travellers</th>
                  <th className="py-3 text-right">Base Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="text-slate-800">
                  <td className="py-4">
                    <p className="font-bold">{selectedInvoice.itemName}</p>
                    <p className="text-[10px] text-slate-400">{selectedInvoice.providerOrAirline} reservation</p>
                  </td>
                  <td className="py-4 text-center font-bold">{selectedInvoice.paxCount}</td>
                  <td className="py-4 text-right font-bold">₹{selectedInvoice.originalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Calculations summaries */}
            <div className="w-full max-w-xs ml-auto text-xs space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-slate-800 font-medium">₹{selectedInvoice.originalPrice.toLocaleString()}</span>
              </div>
              {selectedInvoice.discountApplied > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount Applied ({selectedInvoice.couponCodeUsed || 'Sponsor offer'}):</span>
                  <span>-₹{selectedInvoice.discountApplied.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Convenience GST Rate (5%):</span>
                <span className="text-slate-800">₹{(Math.round((selectedInvoice.price - selectedInvoice.discountApplied) * 0.05)).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total Received Amount:</span>
                <span>₹{selectedInvoice.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Bottom button controls */}
            <div className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-green-600 font-extrabold uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                Payment Confirmed
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  Close Desk
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Delivery Simulator Modal */}
      <AnimatePresence>
        {selectedWhatsApp && (
          <motion.div
            key="whatsapp-mytrip"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
                exit: { opacity: 0 }
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedWhatsApp(null)}
            />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: 10 }
              }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
            
            {/* WhatsApp Header styled in classic verified business chat colors */}
            <div className="bg-[#075e54] text-white p-5 flex items-center justify-between shadow">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white font-serif font-extrabold text-sm border-2 border-green-400 relative">
                  G
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#075e54] text-white">
                    <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1">
                    GoRASA verified Desk
                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  </h4>
                  <p className="text-[10px] text-[#25d366] font-medium font-mono">Instant PNR & PDF Dispatch</p>
                </div>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedWhatsApp(null)} className="text-white hover:text-green-200 cursor-pointer">
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {!whatsAppSent ? (
              <div className="p-6 space-y-5">
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-serif font-bold text-slate-800">Dispatch Booking to Phone</h3>
                  <p className="text-slate-500 text-xs">
                    Deliver your digital boarding pass, GDS tickets, and real-time flight tracking updates instantly.
                  </p>
                </div>

                <div className="border border-slate-100 bg-slate-50 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Selected Booking:</span>
                    <span className="text-orange-600 font-mono text-[11px] font-black uppercase text-right leading-tight max-w-[150px] truncate">{selectedWhatsApp.itemName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Voucher PNR:</span>
                    <span className="font-mono font-bold text-slate-700">{selectedWhatsApp.pnr}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">WhatsApp Mobile Number</label>
                  <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/10 focus-within:border-green-500">
                    <span className="bg-slate-50 border-r border-slate-200 px-3 py-3 text-xs font-bold text-slate-500 flex items-center justify-center font-mono">
                      +91
                    </span>
                    <input 
                      type="tel"
                      placeholder="98765 43210"
                      className="w-full bg-white px-4 py-3 text-xs font-bold outline-none font-mono tracking-wider focus:bg-slate-50/20"
                      value={whatsAppPhone.replace('+91 ', '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setWhatsAppPhone('+91 ' + val);
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1 leading-snug">
                    Provide a valid 10-digit phone. A mock sandbox notification prompt will open instantly.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={whatsAppPhone.length < 14}
                  onClick={() => {
                    setWhatsAppSent(true);
                    // Also dispatch standard custom event if they are watching support tray
                    const event = new CustomEvent('gorasa-booking-confirmed', {
                      detail: {
                        itemName: selectedWhatsApp.itemName,
                        pnr: selectedWhatsApp.pnr,
                        price: selectedWhatsApp.price,
                        type: selectedWhatsApp.type
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.022-.08-.124-.223-.284-.338C15.82 13.06 14.28 12.54 13.932 12.385c-.347-.156-.63-.234-.9.156-.272.39-.738.908-.9 1.1-.165.19-.328.21-.61.08-.28-.135-1.18-.435-2.25-1.39-.83-.74-1.39-1.655-1.55-1.945-.165-.29-.02-.45.12-.59.12-.13.28-.33.42-.495.14-.16.19-.28.28-.46s.05-.34-.02-.495c-.08-.16-.74-1.785-1.01-2.435-.262-.634-.528-.55-.72-.56h-.615c-.21 0-.555.08-.847.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.435 5.45 4.82 1.385.6 2.05.7 2.765.6.795-.11 2.432-1 2.775-1.97.34-.97.34-1.8.24-1.97-.1-.17-.3-.27-.6-.42zm-5.462 7.15c-1.82 0-3.61-.49-5.18-1.42l-.37-.22-3.85 1.01 1.03-3.75-.24-.38C2.5 15.01 2 13.07 2 11.08 2 5.52 6.53 1 12.09 1c2.69 0 5.22 1.05 7.12 2.95C21.1 5.85 22.14 8.38 22.14 11.08c-.01 5.56-4.54 10.08-10.13 10.08zm0-21.8c-6.19 0-11.23 5.04-11.23 11.23 0 2.15.56 4.25 1.63 6.1l-1.73 6.32 6.47-1.7c1.78.97 3.79 1.48 5.86 1.48 6.19 0 11.23-5.04 11.23-11.23-.01-2.99-1.18-5.8-3.3-7.92A11.165 11.165 0 0 0 12.01.27z"/>
                  </svg>
                  <span>Deliver via WhatsApp Business</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Chat screen wallpaper */}
                <div className="p-5 bg-[#efeae2] h-72 overflow-y-auto space-y-3 flex flex-col justify-end">
                  
                  {/* System Date Badge */}
                  <div className="mx-auto bg-white/80 backdrop-blur-xs text-slate-500 rounded-lg px-2.5 py-1 text-[9px] font-bold shadow-xs uppercase tracking-wider mb-2">
                    Today
                  </div>

                  {/* Encrypted Disclaimer */}
                  <div className="mx-auto bg-[#e1f3fc] text-[#1c4d63] rounded-lg p-2.5 text-[9px] text-center font-medium max-w-[90%] leading-snug">
                     🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
                  </div>

                  {/* Main Chat Cloud */}
                  <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-100 text-[10px] leading-relaxed text-slate-800 space-y-1.5 relative max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="absolute -left-1.5 top-2.5 w-3 h-3 bg-white transform rotate-45 border-l border-b border-white"></span>
                    
                    <p className="font-bold text-[#075e54]">✈️ GoRASA Dispatch Center</p>
                    <p className="whitespace-pre-line leading-relaxed">
                      Your ticket reservation for <strong>{selectedWhatsApp.itemName}</strong> is locked! 
                      {"\n\n"}
                      🎫 <strong>PNR Status:</strong> {selectedWhatsApp.pnr}
                      {"\n"}
                      📅 <strong>Travel Dates:</strong> {selectedWhatsApp.travelDates}
                      {"\n"}
                      🏨 <strong>Provider Code:</strong> {selectedWhatsApp.providerOrAirline}
                      {"\n"}
                      💳 <strong>Tariff Paid:</strong> ₹{selectedWhatsApp.price.toLocaleString()} IDR/INR
                      {"\n\n"}
                      Please present this WhatsApp voucher along with your passport during check-in. Have a great journey with GoRASA!
                    </p>
                    
                    <div className="flex items-center justify-end text-[8px] text-slate-400 gap-0.5 mt-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>

                </div>

                <div className="p-5 border-t border-slate-100 text-center space-y-3 bg-slate-50">
                  <div className="flex items-center justify-center space-x-1 text-green-600 font-extrabold text-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Itinerary Vouchers Transferred successfully!</span>
                  </div>

                  <p className="text-slate-500 text-[10px] leading-snug px-2">
                    Delivered safely to <strong>{whatsAppPhone}</strong> via our enterprise business gateway channel.
                  </p>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedWhatsApp(null)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </motion.button>
                </div>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default MyTrips;
