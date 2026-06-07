import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, User, PromoCode, PackageInquiry } from '../types';
import { 
  TrendingUp, 
  Coins, 
  Percent, 
  Briefcase, 
  Compass, 
  MapPin, 
  Settings, 
  ClipboardList, 
  Trophy, 
  UserPlus, 
  Plus, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  HeartHandshake,
  ArrowRight,
  Shield,
  Plane,
  Activity,
  Users,
  CreditCard,
  Zap,
  Clock,
  Target
} from 'lucide-react';

interface PremiumDashboardProps {
  currentUser: User | null;
  bookings: Booking[];
  promoCodes: PromoCode[];
  onTogglePromo: (code: string) => void;
  onCreatePromo: (newPromo: PromoCode) => void;
  onTopUpWallet: (companyName: string, amount: number) => void;
  onRedeemPoints: (pointsCost: number, rewardTitle: string) => void;
  onAdminCancelBooking: (bookingId: string) => void;
  onAdminSetSeat: (bookingId: string, itemStr: string) => void;
  inquiries: PackageInquiry[];
  onUpdateInquiryStatus: (id: string, status: 'Inquired' | 'Contacted' | 'Quoted' | 'Success') => void;
}

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({
  currentUser,
  bookings,
  promoCodes,
  onTogglePromo,
  onCreatePromo,
  onTopUpWallet,
  onRedeemPoints,
  onAdminCancelBooking,
  onAdminSetSeat,
  inquiries,
  onUpdateInquiryStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'cms' | 'loyalty' | 'leads' | 'b2b'>('overview');
  
  // States for creating promo code
  const [newCode, setNewCode] = useState('');
  const [newValue, setNewValue] = useState(500);
  const [newType, setNewType] = useState<'flat' | 'percentage'>('flat');
  const [newDesc, setNewDesc] = useState('');
  
  // State for B2B top up forms
  const [depositAmount, setDepositAmount] = useState<number>(20000);

  // Stats derivations
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const totalRevenue = bookings.reduce((sum, b) => b.status === 'Confirmed' ? sum + b.price : sum, 0);
  const totalDiscounts = bookings.reduce((sum, b) => b.status === 'Confirmed' ? sum + b.discountApplied : sum, 0);

  // Mock live Flight Tracker parameters 
  const [flightMarkerOffset, setFlightMarkerOffset] = useState(20);
  useEffect(() => {
    const timer = setInterval(() => {
      setFlightMarkerOffset(prev => (prev >= 90 ? 10 : prev + 2.5));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Top Banner Branding */}
      <div className="bg-slate-900 text-white px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Rasa Control Tower</span>
          </div>
          <h2 className="text-3xl font-serif font-bold mt-2">GoRASA Operational Terminal</h2>
          <p className="text-slate-400 text-xs mt-1">Sponsor dashboard for analytics, promotional loyalty catalogs, and B2B wallet ledgers.</p>
        </div>

        {/* Tab List switcher */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Monitor', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'tickets', label: 'Ledger', icon: <ClipboardList className="w-4 h-4" /> },
            { id: 'leads', label: 'CRM Leads', icon: <Target className="w-4 h-4" /> },
            { id: 'cms', label: 'Promo Desk', icon: <Percent className="w-4 h-4" /> },
            { id: 'loyalty', label: 'Loyalty Club', icon: <Trophy className="w-4 h-4" /> },
            { id: 'b2b', label: 'B2B Registry', icon: <Briefcase className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-8">
        
        {/* OVERVIEW MODULE */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI grid counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Accumulated bookings</span>
                <span className="text-3xl font-bold text-slate-900 mt-2 block">{totalBookings} Entries</span>
                <span className="text-xs text-green-600 mt-2 block font-medium">★ {activeBookings} active transactions</span>
              </motion.div>
              <motion.div whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total platform revenue</span>
                <span className="text-3xl font-extrabold text-slate-900 mt-2 block">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs text-slate-500 mt-2 block font-medium">Inclusive of direct partner commissions</span>
              </motion.div>
              <motion.div whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Discounts Distributed</span>
                <span className="text-3xl font-extrabold text-orange-500 mt-2 block">₹{totalDiscounts.toLocaleString()}</span>
                <span className="text-xs text-slate-500 mt-2 block font-medium">Saved via active promo campaigns</span>
              </motion.div>
              <motion.div whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">B2B Deposited Wallets</span>
                <span className="text-3xl font-extrabold text-blue-600 mt-2 block">
                  ₹{(currentUser?.role === 'corporate' || currentUser?.role === 'agent') ? currentUser.walletBalance.toLocaleString() : '150,000'}
                </span>
                <span className="text-xs text-green-600 mt-2 block font-medium">✔ B2B Instant balance verified</span>
              </motion.div>
            </div>

            {/* Flight map tracer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Flight tracer canvas card */}
              <div className="bg-slate-100 rounded-[2rem] p-6 lg:col-span-2 border border-slate-200 shadow-inner flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">GoRASA Indigo & Air India live Route Tracer</h3>
                  <p className="text-[11px] text-slate-500 uppercase font-mono mt-0.5">Real-Time radar tracer simulation (Vande Bharat connections)</p>
                </div>

                <div className="relative bg-[#111827] h-64 rounded-2xl overflow-hidden my-6 border border-slate-800 shadow-inner">
                  {/* Grid lines layout */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35"></div>
                  
                  {/* Visual Map graphics dots */}
                  <div className="absolute top-16 left-12 flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></div>
                    <span className="text-[9px] font-mono font-extrabold text-orange-400 mt-1 uppercase">DEL (Delhi)</span>
                  </div>
                  <div className="absolute bottom-16 right-20 flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping"></div>
                    <span className="text-[9px] font-mono font-extrabold text-cyan-400 mt-1 uppercase">BOM (Mumbai)</span>
                  </div>
                  <div className="absolute bottom-24 left-24 flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-mono font-extrabold text-slate-400 mt-1 uppercase">GOI (Goa)</span>
                  </div>

                  {/* Flight Tracer line */}
                  <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 50 70 Q 140 100 280 180" 
                      fill="none" 
                      stroke="#f97316" 
                      strokeWidth="2" 
                      strokeDasharray="4 4 animate-pulse"
                      className="opacity-40"
                    />
                  </svg>

                  {/* Travelling Flight marker */}
                  <div 
                    className="absolute font-bold text-orange-400" 
                    style={{ 
                      left: `${flightMarkerOffset}%`, 
                      top: `${60 - (flightMarkerOffset / 2)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="bg-orange-500 text-white p-1 rounded-xl shadow-lg border border-orange-400 shrink-0 flex items-center space-x-1">
                      <Plane className="w-3.5 h-3.5 transform rotate-45" />
                      <span className="text-[8px] font-mono font-bold tracking-tight">6E-RASA</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Connection: Delhi (DEL) - Mumbai (BOM)</span>
                  <span>Cheapest Fare Indexed via AI: ₹4,240</span>
                </div>
              </div>

              {/* Status information pane */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-orange-500 font-bold uppercase tracking-widest text-[9px] bg-orange-50 px-2.5 py-1 rounded-full">
                    Sponsor Guidelines
                  </span>
                  <h3 className="text-lg font-serif font-bold text-slate-900 mt-3">Commission Registry</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Corporate users bypass standard processing fees. Travel agents accumulate <strong>5% agent commissions</strong> credited straight to agency ledgers on flight bookings.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs space-y-3 my-4">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Indigo API Markup:</span>
                    <span className="text-slate-800">Flat 0% (Clean wholesale rates)</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">OYO Agent Discount:</span>
                    <span className="text-slate-800">12% off list fares</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Package Margin Rate:</span>
                    <span className="text-green-600">₹1,500 Cash Commissions</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono text-center">
                  GoRASA RASA Online Private Ltd
                </p>
              </div>
            </div>

            {/* SUCCESS METRICS PANEL */}
            <div className="pt-8 border-t border-slate-100 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-orange-500 font-bold uppercase tracking-widest text-[9px] bg-orange-50 px-2.5 py-1 rounded-full">
                    Control Tower Analytics
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-2">Platform Success Metrics</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Real-time parameters monitoring user behavior, conversion efficiency, and GDS connection handshakes.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>System metrics synchronized</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Booking conversion rate */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Target className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">+0.62% ↗</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Booking conversion rate</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">3.88%</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Session-to-instantiated ledger locks</span>
                </div>

                {/* 2. Daily active users */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">Active status</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Daily active users</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">1,482 <span className="text-xs font-normal text-slate-400">DAU</span></p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Unique corporate & retail connections</span>
                </div>

                {/* 3. Gross booking value (GBV) */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <CreditCard className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-600 font-mono font-bold px-2 py-0.5 rounded-full">Cumulative</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Gross booking value (GBV)</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">₹{(1620500 + totalRevenue).toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">B2B + direct payment ledger volumes</span>
                </div>

                {/* 4. Repeat booking percentage */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">Loyalty club</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Repeat booking percentage</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">46.2%</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Sponsor loyalty redeem triggers</span>
                </div>

                {/* 5. Average order value */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Coins className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-bold px-2 py-0.5 rounded-full">Index mean</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Average order value</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                    ₹{(totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 12450).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Weighted mean across segments</span>
                </div>

                {/* 6. Search-to-book ratio */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Activity className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">Conversion</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Search-to-book ratio</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">14.12%</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">From live search queries to checkout</span>
                </div>

                {/* 7. Payment success rate */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">Stable</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">Payment success rate</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">99.43%</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">Core transaction locks & routing</span>
                </div>

                {/* 8. API response time */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl hover:border-orange-200 hover:bg-orange-50/5 transition-all group duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-orange-50 transition-all">
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] bg-cyan-50 text-cyan-600 font-mono font-bold px-2 py-0.5 rounded-full">SLA Standard</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-4">API response time</p>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">142ms</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">GDS provider handshake latencies</span>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TICKETS & LEDGER DESK */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Passenger Reservation Ledger</h3>
              <p className="text-slate-500 text-xs mt-1">Manage global passenger seat assignments, dispatch notifications, or enforce manual override overrides.</p>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No tickets issued on the platform yet. Play around and book products first!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Recipient / PNR</th>
                      <th className="p-4">Reserved Item</th>
                      <th className="p-4">Paid (INR)</th>
                      <th className="p-4">Seat / Room Config</th>
                      <th className="p-4">Alert Sent</th>
                      <th className="p-4 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 font-medium text-slate-700">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{currentUser?.name || "Passenger"}</p>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded block w-max uppercase mt-1">{booking.pnr}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{booking.itemName}</p>
                          <span className="text-slate-400 text-[10px] uppercase">{booking.type} • {booking.providerOrAirline}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">₹{booking.price.toLocaleString()}</td>
                        <td className="p-4">
                          {booking.status === 'Confirmed' ? (
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text"
                                className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                defaultValue={booking.seatOrRoom || (booking.type === 'flight' ? '14B' : 'Room 101')}
                                onBlur={(e) => onAdminSetSeat(booking.id, e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            booking.status === 'Confirmed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
                          }`}>
                            {booking.status === 'Confirmed' ? 'Yes (WhatsApp)' : 'Revoked'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {booking.status === 'Confirmed' ? (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                onAdminCancelBooking(booking.id);
                                // trigger sound or message
                              }}
                              className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold duration-150 cursor-pointer"
                            >
                              Refund Ticket
                            </motion.button>
                          ) : (
                            <span className="text-orange-500 text-[10px] font-bold uppercase">Refund Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CMS & PROMOTION CAMPAIGNS */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Promotions & Marketing Terminal</h3>
              <p className="text-slate-500 text-xs mt-1">Deploy, activate, or create seasonal discount vouchers which update live for checkout selections.</p>
            </div>

            {/* List and create layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Promo List Left */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Active Vouchers Registry</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promoCodes.map((promo, index) => (
                    <motion.div
                      key={promo.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 rounded-2xl border transition-all ${
                        promo.active 
                          ? 'bg-[#fdf4ee] border-orange-200 shadow-sm' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono font-black text-lg tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-dashed border-orange-300">{promo.code}</span>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onTogglePromo(promo.code)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            promo.active
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {promo.active ? 'ACTIVE' : 'INACTIVE'}
                        </motion.button>
                      </div>
                      <p className="font-bold text-xs text-slate-800">{promo.description}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-2">
                        Min Flight/Hotel Booking Value: ₹{promo.minBookingValue.toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Create Promo compiler Right */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] h-max">
                <h4 className="font-serif font-bold text-slate-900 mb-4 text-base">Issue Custom Campaign</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Coupon Code Name</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none uppercase font-mono font-bold"
                      placeholder="SUMMER2026"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Voucher Value</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                        placeholder="1000"
                        value={newValue}
                        onChange={(e) => setNewValue(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Coupon Mode</label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                        value={newType}
                        onChange={(e: any) => setNewType(e.target.value)}
                      >
                        <option value="flat">Flat ₹ off</option>
                        <option value="percentage">% percentage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Marketing Description</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                      placeholder="Flat ₹1000 off on Indigo Standard classes"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (!newCode.trim()) return;
                      onCreatePromo({
                        code: newCode,
                        discountValue: newValue,
                        type: newType,
                        description: newDesc || `Flat ₹${newValue} discount coupon`,
                        minBookingValue: 3000,
                        active: true
                      });
                      setNewCode('');
                      setNewDesc('');
                      // trigger success state
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Deploy Campaign</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOYALTY PROGRAM DESK */}
        {activeTab === 'loyalty' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Loyalty & Rewards Lounge</h3>
                <p className="text-slate-500 text-xs mt-1">Upgrade user cabins or secure complimentary airport lounges by trading earned loyalty credits.</p>
              </div>
              <div className="bg-slate-900 text-orange-400 px-4 py-2 rounded-xl text-xs font-mono font-bold">
                100 Points = ₹100 Redeemed Value
              </div>
            </div>

            {/* Catalog list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  id: 'r1', 
                  title: 'Verified Partner Airport Lounge Pass', 
                  points: 1000, 
                  desc: 'Admit 1 to premium luxury lounges in Mumbai, Delhi, and Bangalore international desks.', 
                  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?xl=1' 
                },
                { 
                  id: 'r2', 
                  title: 'Complimentary Hot Meal upgrades', 
                  points: 500, 
                  desc: 'Pre-book chef selection hot meals on Indigo and Air India global flight networks.', 
                  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?xl=1' 
                },
                { 
                  id: 'r3', 
                  title: 'Air India Business Lounge Upgrades', 
                  points: 2500, 
                  desc: 'Trade credits to upgrade existing Air India Economy tickets to elite Maharajah Business standard.', 
                  image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?xl=1' 
                },
              ].map((reward) => (
                <div key={reward.id} className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                  <div className="h-44 overflow-hidden relative">
                    <img src={reward.image} alt={reward.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold text-[10px] px-3 py-1 rounded-full shadow">
                      {reward.points} PTS
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{reward.title}</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-2">{reward.desc}</p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!currentUser || currentUser.loyaltyPoints < reward.points}
                      onClick={() => onRedeemPoints(reward.points, reward.title)}
                      className="mt-6 w-full py-2.5 bg-slate-900 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>Redeem Voucher</span>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM CRM LEADS DESK */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Custom Package inquiry CRM Desk</h3>
                <p className="text-slate-500 text-xs mt-1">Audit, edit, and update custom package tour-requests submitted by corporate personnel or travel agents.</p>
              </div>

              <div className="flex bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50 text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                Active inquiries index: {inquiries.length} requests
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {inquiries.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">No custom package inquiries registered in current session database.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq, index) => (
                    <motion.div
                      key={inq.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 hover:shadow-lg transition-all flex flex-col md:flex-row items-start justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-serif font-black text-slate-900 bg-orange-50 px-3 py-1 rounded-lg">
                            {inq.destination}
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-400 px-2 rounded">
                            ID: {inq.id}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 rounded-full tracking-wider ${
                            inq.status === 'Success' 
                              ? 'bg-green-100 text-green-700' 
                              : inq.status === 'Quoted' 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : inq.status === 'Contacted' 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-red-100 text-red-600'
                          }`}>
                            {inq.status}
                          </span>
                        </div>

                        <div>
                          <p className="text-slate-800 text-sm font-semibold">Client: {inq.travelerName} ({inq.travelerEmail})</p>
                          <p className="text-slate-500 text-xs mt-0.5">Duration: {inq.numberOfDays} Days • Submittal: {new Date(inq.submittedAt).toLocaleDateString()}</p>
                        </div>

                        {inq.inclusionsSelected.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {inq.inclusionsSelected.map((inc, i) => (
                              <span key={i} className="text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                                + {inc}
                              </span>
                            ))}
                          </div>
                        )}

                        {inq.specificDemands && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-snug">
                            " {inq.specificDemands} "
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-stretch sm:items-end gap-3 w-full md:w-auto">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Est. Budget Tag</span>
                          <span className="text-2xl font-bold font-mono text-slate-900 block">₹{inq.priceEstimated.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-col gap-1 w-full sm:w-48">
                          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block sm:text-right font-mono mb-1">Set CRM Stage</label>
                          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            {(['Inquired', 'Contacted', 'Quoted', 'Success'] as const).map(stage => (
                              <motion.button
                                key={stage}
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onUpdateInquiryStatus(inq.id, stage)}
                                className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all shrink-0 cursor-pointer ${
                                  inq.status === stage 
                                    ? 'bg-slate-900 text-white shadow-xs font-black' 
                                    : 'text-slate-400 hover:text-slate-700'
                                }`}
                              >
                                {stage === 'Inquired' ? 'Inq' : stage === 'Contacted' ? 'Cont' : stage === 'Quoted' ? 'Quote' : 'Done'}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* B2B COMPANY PORTAL REGISTRY */}
        {activeTab === 'b2b' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 animate-in fade-in duration-300"
          >
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Corporate & Agent Balance Ledger</h3>
              <p className="text-slate-500 text-xs mt-1">Top-up company deposit balances, configure global service markups, or authorize elite corporation memberships.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top up terminal Left */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] h-max">
                <h4 className="font-bold text-slate-800 text-sm mb-4">Replenish Corporate Wallet deposit</h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Select Corporation Registry</label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                        defaultValue="cur"
                      >
                        <option value="cur">{currentUser?.companyName || "No active company portal registered"}</option>
                        <option value="tcs">TCS Global Travels India</option>
                        <option value="birla">Birla sons corporate desk</option>
                      </select>
                    </div>
                    
                    <div className="w-full md:w-48">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Load Amount (INR)</label>
                      <input 
                        type="number" 
                        value={depositAmount} 
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                        placeholder="25000"
                      />
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!currentUser || (currentUser.role !== 'corporate' && currentUser.role !== 'agent')}
                      onClick={() => {
                        const targetName = currentUser?.companyName || 'Rasa Corp Client';
                        onTopUpWallet(targetName, depositAmount);
                        // show toast notification
                      }}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 w-full md:w-auto shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Recharge Wallet</span>
                    </motion.button>
                  </div>

                  {/* fast selector tabs */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[10000, 25000, 50000, 100000].map((amt) => (
                      <motion.button
                        key={amt}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setDepositAmount(amt)}
                        className="px-3 py-1.5 bg-white border hover:border-orange-500 hover:text-orange-600 rounded-lg text-[10px] font-bold transition-all text-slate-500 cursor-pointer"
                      >
                        +₹{amt.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Corporate profiles Registry Right */}
              <div className="bg-slate-900 text-white rounded-[2rem] p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-orange-400">Platform Corporate policy</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mt-2">
                    B2B company portals get customized checkout tabs allowing seamless billing directly from corporate deposit limits.
                  </p>
                </div>

                <div className="space-y-4 my-6">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Total B2B Clients:</span>
                    <span className="text-white font-bold">12 Registered Corporates</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Default Wallet allocation:</span>
                    <span className="text-white font-bold">₹1,50,000 INR</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Elite discount tier:</span>
                    <span className="text-orange-400 font-bold">Yes (Gold lounge entry upgrade)</span>
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 text-center uppercase tracking-wide">
                  Secure encryptions and audits compliant with ISO-27001
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PremiumDashboard;
