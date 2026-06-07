import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Booking } from '../types';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Notification, 
  Bell, 
  CreditCard, 
  Users, 
  Plus, 
  Trash2, 
  Briefcase, 
  Gift, 
  CheckCircle, 
  Copy, 
  Share2,
  Calendar,
  Lock,
  Compass,
  ArrowRight
} from 'lucide-react';

interface UserProfileProps {
  user: User | null;
  bookings: Booking[];
  onUpdateUser: (updatedUser: User) => void;
  onLoginClick: () => void;
}

interface SavedPassenger {
  id: string;
  name: string;
  relation: string;
  gender: string;
  passportNumber?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, bookings, onUpdateUser, onLoginClick }) => {
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'passengers' | 'preferences' | 'loyalty' | 'wishlist'>('details');

  // Local forms state
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [designation, setDesignation] = useState('Senior Solutions Lead');
  
  // Passport states
  const [passportNum, setPassportNum] = useState(user?.role === 'corporate' ? 'IND422941X' : 'IND984210B');
  const [passportExpiry, setPassportExpiry] = useState('2031-11-20');
  const [passportCountry, setPassportCountry] = useState('India');

  // Corporate GST states
  const [gstin, setGstin] = useState(user?.role === 'corporate' ? '29AAGCR6134S1Z4' : '');
  const [gstAddress, setGstAddress] = useState(user?.role === 'corporate' ? 'RASA Tech Park, Electronics City Phase 1, Bengaluru' : '');

  // Preferences
  const [mealPref, setMealPref] = useState('Vegetarian');
  const [seatPref, setSeatPref] = useState('Window');
  const [hotelPref, setHotelPref] = useState('Penthouse / Valley View');
  const [carrierPref, setCarrierPref] = useState('Indigo');

  // Wishlist
  const [wishlist, setWishlist] = useState<Array<{ id: string; name: string; type: string; price: number; img: string }>>([
    { id: 'w1', name: 'Leela Palace Udaipur', type: 'Hotel', price: 24000, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
    { id: 'w2', name: 'Andaman Islands Explorer', type: 'Package', price: 34500, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' }
  ]);
  const [wishNameInput, setWishNameInput] = useState('');
  const [wishTypeInput, setWishTypeInput] = useState('Hotel');
  const [wishPriceInput, setWishPriceInput] = useState(12000);

  // Notification toggles
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Saved passengers list (Section 5.1)
  const [passengers, setPassengers] = useState<SavedPassenger[]>([
    { id: 'p1', name: 'Simran Mittal', relation: 'Spouse', gender: 'Female', passportNumber: 'IND420951A' },
    { id: 'p2', name: 'Ryan Mittal', relation: 'Son', gender: 'Male', passportNumber: 'IND566102K' }
  ]);
  const [newPassName, setNewPassName] = useState('');
  const [newPassRelation, setNewPassRelation] = useState('Spouse');
  const [newPassGender, setNewPassGender] = useState('Female');
  const [newPassPassport, setNewPassPassport] = useState('');

  // Referral states (Section 5.9 / 5.13)
  const [copiedReferral, setCopiedReferral] = useState(false);
  const referralCode = `RASA-GOPR-${user?.name.toUpperCase().slice(0, 4) || 'JOIN'}`;

  // Birthday rewards
  const [birthday, setBirthday] = useState('1992-08-14');
  const [birthdayRewardClaimed, setBirthdayRewardClaimed] = useState(false);

  if (!user) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 max-w-2xl mx-auto shadow-sm my-12 animate-in slide-in-from-bottom-8 duration-500">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
          <UserIcon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Sign In to Manage Profile</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Unlock the Customer Profile, configure corporate GST details, track tokenized wallets, manage your passenger list, and view premium direct loyalty tiers.
        </p>
        <button
          onClick={onLoginClick}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
        >
          Access Traveler Workspace
        </button>
      </div>
    );
  }

  // Calculate stats
  const verifiedBookings = bookings.filter(b => b.status === 'Confirmed');
  const totalAmountSpent = verifiedBookings.reduce((sum, b) => sum + b.price, 0);
  const activeReferralsCount = 3;
  const totalReferralEarnings = activeReferralsCount * 1250;

  // Handle passenger additions
  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    const newPass: SavedPassenger = {
      id: 'p_' + Math.random().toString(36).substring(2, 6),
      name: newPassName,
      relation: newPassRelation,
      gender: newPassGender,
      passportNumber: newPassPassport || undefined
    };
    setPassengers([...passengers, newPass]);
    setNewPassName('');
    setNewPassPassport('');
  };

  const handleDeletePassenger = (id: string) => {
    setPassengers(passengers.filter(p => p.id !== id));
  };

  // Add Wishlist item
  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishNameInput.trim()) return;
    const item = {
      id: 'w_' + Math.random().toString(36).substring(2, 6),
      name: wishNameInput,
      type: wishTypeInput,
      price: wishPriceInput,
      img: wishTypeInput === 'Hotel' 
        ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'
    };
    setWishlist([...wishlist, item]);
    setWishNameInput('');
  };

  // Copy referral
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://gorasa.com/register?ref=${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Claim birthday reward
  const handleClaimBirthday = () => {
    if (birthdayRewardClaimed) return;
    // Credit 500 PTS
    const updatedUser: User = {
      ...user,
      loyaltyPoints: user.loyaltyPoints + 500
    };
    onUpdateUser(updatedUser);
    setBirthdayRewardClaimed(true);
  };

  // Switch Role portal (PRD: "Support B2C and B2B operations in different portals")
  const handleToggleRoleMode = (role: 'user' | 'corporate' | 'agent') => {
    const updatedUser: User = {
      ...user,
      role: role,
      companyName: role === 'corporate' ? 'Birla Conglomerates Pvt Ltd' : role === 'agent' ? 'Shivem Premier Agency India' : undefined,
      walletBalance: role === 'user' ? 0 : 150000,
      loyaltyPoints: role === 'user' ? 1200 : role === 'corporate' ? 4500 : 8900,
      loyaltyTier: role === 'user' ? 'Silver' : role === 'corporate' ? 'Gold' : 'Platinum'
    };
    onUpdateUser(updatedUser);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Upper Profile Cover header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-50 to-transparent -z-10 rounded-full blur-3xl opacity-60"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.name.charAt(0)}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                user.loyaltyTier === 'Platinum' ? 'bg-cyan-500 text-white' : user.loyaltyTier === 'Gold' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
              }`}>
                P
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold uppercase tracking-widest text-[9px] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  Verified Traveler ID
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full">
                  ID: GR-{user.name.slice(0,3).toUpperCase()}-94
                </span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 text-xs">
                {user.email} <span className="mx-1">•</span> Role: <strong className="uppercase font-mono text-orange-600">{user.role}</strong>
                {user.companyName && ` • ${user.companyName}`}
              </p>
            </div>
          </div>

          {/* Quick Stats blocks */}
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <motion.div className="text-center px-4" whileHover={{ y: -4 }}>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Loyalty Wallet</span>
                <span className="text-lg font-bold text-orange-600 font-mono mt-0.5 block">{user.loyaltyPoints.toLocaleString()} PTS</span>
              </motion.div>
              <div className="h-8 w-px bg-slate-200"></div>
              <motion.div className="text-center px-4" whileHover={{ y: -4 }}>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Refunding Balance</span>
                <span className="text-lg font-bold text-green-600 font-mono mt-0.5 block">₹{(user.walletBalance).toLocaleString()}</span>
              </motion.div>
              <div className="h-8 w-px bg-slate-200"></div>
              <motion.div className="text-center px-4" whileHover={{ y: -4 }}>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Bookings Lock</span>
                <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">{verifiedBookings.length} Trips</span>
              </motion.div>
          </div>
        </div>

        {/* Support B2C/B2B dynamic portal switcher */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">PRD Core Sandbox Portal Toggle:</span>
            <span className="text-slate-400 text-[10px]">Switch profiles to experience personalized rates, corporate GST markups, and cash commissions.</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/50">
            <button
              onClick={() => handleToggleRoleMode('user')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${user.role === 'user' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              B2C Retail Portal
            </button>
            <button
              onClick={() => handleToggleRoleMode('corporate')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${user.role === 'corporate' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              B2B Corporate Desk
            </button>
            <button
              onClick={() => handleToggleRoleMode('agent')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${user.role === 'agent' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              B2B Agent Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main split tab section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation panel */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm self-start space-y-2">
          {[
            { id: 'details', label: 'Personal & Corporate Info', icon: <UserIcon className="w-4 h-4" /> },
            { id: 'passengers', label: 'Saved Travellers List', icon: <Users className="w-4 h-4" /> },
            { id: 'preferences', label: 'Travel Preferences', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'loyalty', label: 'Referrals & Loyalty Ledger', icon: <Gift className="w-4 h-4" /> },
            { id: 'wishlist', label: 'Travel Wishlist', icon: <Heart className="w-4 h-4" /> },
          ].map(sub => (
            <motion.button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
                activeSubTab === sub.id 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {sub.icon}
              <span>{sub.label}</span>
            </motion.button>
          ))}

          <div className="pt-4 border-t border-slate-100 mt-4 text-center leading-relaxed">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Security compliance</span>
            <p className="text-[9px] text-slate-400 mt-1">SSL Encrypted data vault with tokenized PCI compliance credentials.</p>
          </div>
        </div>

        {/* Active Window Content wrapper */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          
          {/* 1. PERSONAL DETAILS INFO */}
          {activeSubTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Personal & Corporate Locker</h3>
                <p className="text-slate-500 text-xs mt-0.5">Configure your mandatory contact indexes and optional GSTIN coordinates for B2B corporate tax discounts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Primary Name (Passport registered)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={user.name}
                    onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Registered Email address</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-100 border border-slate-200 outline-none text-slate-400 text-xs font-semibold px-4 py-3 rounded-xl cursor-not-allowed"
                    value={user.email}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Mobile number (WhatsApp dispatch point)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Designation / Executive Position</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                
                {/* Passport vault (Mandatory Section 5.1/5.2) */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Passport Documentation (Required for International GDS Flights)</h4>
                    <p className="text-[11px] text-slate-400">This metadata is used to pre-fill global Sabre/Amadeus ticketing forms instantly.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Passport Number</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-lg font-mono uppercase"
                        value={passportNum}
                        onChange={(e) => setPassportNum(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Expiry Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-lg"
                        value={passportExpiry}
                        onChange={(e) => setPassportExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Issuing State / Jurisdiction</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-lg"
                        value={passportCountry}
                        onChange={(e) => setPassportCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Optional GST Details Vault (Section 5.1/5.3) */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">GST Registration Details (Corporate optional)</h4>
                    <p className="text-[11px] text-slate-400">Claims 5% CGST input credit on flights and luxury business hotels.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Company GSTIN Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 29AAGCR6134S1Z4"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-lg font-mono uppercase"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Registered Office Address</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rasa Tech Park, Bengaluru"
                        className="w-full bg-white border border-slate-200 outline-none text-xs font-semibold px-3 py-2 rounded-lg"
                        value={gstAddress}
                        onChange={(e) => setGstAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved cards statement */}
              <div className="pt-6 border-t border-slate-100 bg-orange-50/20 p-4 rounded-2xl border border-orange-100 text-xs flex gap-3 text-orange-950">
                <Lock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">PCI-DSS Encryption Statement</p>
                  <p className="text-slate-500 leading-snug">In compliance with Indian RBI & PCI-DSS regulations, GoRASA does not store raw credit card credentials. All payments are securely card-tokenized on our live Razorpay gateway servers.</p>
                </div>
              </div>

            </div>
          )}

          {/* 2. SAVED TRAVELLERS MODULE (Section 5.1/5.2) */}
          {activeSubTab === 'passengers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">Saved Passenger Directory</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Create a passenger index to prefill flights and hotel booking checklists instantly, reducing manual booking times.</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                  {passengers.length} Travellers stored
                </span>
              </div>

              {/* Form to add passenger */}
              <form onSubmit={handleAddPassenger} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Full Name (As in Passport)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Aditi Mittal"
                    required
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-orange-500"
                    value={newPassName}
                    onChange={(e) => setNewPassName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Relationship</label>
                  <select
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2.5 rounded-xl"
                    value={newPassRelation}
                    onChange={(e) => setNewPassRelation(e.target.value)}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Kid">Son / Daughter</option>
                    <option value="Parent">Parent</option>
                    <option value="Colleague">Colleague / Peer</option>
                    <option value="Friend">Travel Friend</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Gender</label>
                  <select
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2.5 rounded-xl"
                    value={newPassGender}
                    onChange={(e) => setNewPassGender(e.target.value)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Optional: Passport Reference Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. IND9182312A"
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-orange-500"
                    value={newPassPassport}
                    onChange={(e) => setNewPassPassport(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Traveller</span>
                </button>
              </form>

              {/* Stored Passengers render */}
              <div className="space-y-3 pt-4">
                {passengers.map(p => (
                  <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase font-mono">
                        {p.relation.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Relation: <strong>{p.relation}</strong> <span className="mx-1.5">•</span> Gender: {p.gender}
                          {p.passportNumber && ` • Passport: ${p.passportNumber}`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePassenger(p.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 3. TRAVEL PREFERENCES & NOTIFICATION SETTINGS */}
          {activeSubTab === 'preferences' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Custom Preferences Desk</h3>
                <p className="text-slate-500 text-xs mt-0.5">We will use these selections to filter flights, choose default airlines, request meals, and pre-select seats.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">In-flight Meal Choice</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={mealPref}
                    onChange={(e) => setMealPref(e.target.value)}
                  >
                    <option value="Vegetarian">Vegetarian Hindu Meal (AVML)</option>
                    <option value="Non-Veg">Standard Non-Vegetarian (NVML)</option>
                    <option value="Diabetic">Diabetic Safe (DBML)</option>
                    <option value="Kosher">Certified Kosher (KSML)</option>
                    <option value="GlutenFree">Gluten intolerant style (GFML)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Flight Seat preference (Standard Economy)</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={seatPref}
                    onChange={(e) => setSeatPref(e.target.value)}
                  >
                    <option value="Window">Window Seat (Preferred Always)</option>
                    <option value="Aisle">Aisle Seat (Rapid exit)</option>
                    <option value="ExitRow">Exit Row (Extra legroom lock)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Hotel Suite & Class Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={hotelPref}
                    onChange={(e) => setHotelPref(e.target.value)}
                  >
                    <option value="HillView">Penthouse / Hill Vista Suite</option>
                    <option value="PoolAccess">Pool Access Ground executive</option>
                    <option value="BusinessSuite">Standard King bed business cabin</option>
                    <option value="Budget">Comfort Cozy Deluxe</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Preferred Domestic Air Carrier</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 text-xs font-bold px-4 py-3 rounded-xl"
                    value={carrierPref}
                    onChange={(e) => setCarrierPref(e.target.value)}
                  >
                    <option value="Indigo">Indigo (6E wholesale carrier)</option>
                    <option value="AirIndia">Air India (Star Alliance AI)</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles (Section 5.1 / 5.10) */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Section 5.10 notification delivery routing</h4>
                  <p className="text-[11px] text-slate-400">Verify which gateway channels generate real-time flight alerts and booking invoices.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/40 transition-all select-none">
                    <input 
                      type="checkbox" 
                      className="accent-green-600 shrink-0 w-4 h-4 cursor-pointer"
                      checked={notifyWhatsApp} 
                      onChange={() => setNotifyWhatsApp(!notifyWhatsApp)} 
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Direct WhatsApp GDS Vouchers (Recommended)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dispatches OTP, boarding passes, and booking modifications straight to {mobile} via enterprise green channel.</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/40 transition-all select-none">
                    <input 
                      type="checkbox" 
                      className="accent-orange-500 shrink-0 w-4 h-4 cursor-pointer"
                      checked={notifyEmail} 
                      onChange={() => setNotifyEmail(!notifyEmail)} 
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Email Tax Invoice Receipts</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Delivers monthly breakdown PDF audits, refund statuses, and GST invoice statements to {user.email}.</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/40 transition-all select-none">
                    <input 
                      type="checkbox" 
                      className="accent-orange-500 shrink-0 w-4 h-4 cursor-pointer"
                      checked={notifySms} 
                      onChange={() => setNotifySms(!notifySms)} 
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Standard GSM SMS PNR alerts</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dispatches basic SMS updates with ticket status code locks. Can lead to carrier fees.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. LOYALTY & REFERRALS chamber (Section 5.13 / 5.9) */}
          {activeSubTab === 'loyalty' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">Loyalty, Rewards & Referrals Lab</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Gain 2% rewards on direct spends, generate promo codes, and distribute referral links.</p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full">
                  <Gift className="w-4 h-4" />
                  <span>Referrals: Claimed ₹{totalReferralEarnings.toLocaleString()}</span>
                </div>
              </div>

              {/* Referral engine widget (Section 5.9) */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
                <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-orange-500/10 rounded-full blur-2xl"></div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-orange-400 font-extrabold uppercase tracking-widest font-mono">GoRASA Marketing Campaign</span>
                    <h4 className="text-xl font-serif font-bold mt-1">Sponsor Friend Program</h4>
                    <p className="text-slate-300 text-xs">Share your unique corporate login coordinate and earn <strong>₹1,250 B2B credits / 500 Reward Points</strong> for every traveler who books flights or hotels.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <input 
                      type="text" 
                      readOnly
                      className="bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 px-4 py-3 rounded-xl flex-1 outline-none select-all"
                      value={`https://gorasa.com/register?ref=${referralCode}`}
                    />
                    <button
                      type="button"
                      onClick={handleCopyReferral}
                      className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shrink-0 shadow transition-all active:scale-95 flex items-center justify-center space-x-1"
                    >
                      {copiedReferral ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedReferral ? 'Copied Link' : 'Copy Invitation'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reward list ledger breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Points ledger history */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interaction Ledger (Points Gained)</h4>
                  <motion.div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3 text-xs leading-none" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    
                    <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                      <div>
                        <p className="font-bold text-slate-800">Amaya Goa Resort Lock Match</p>
                        <p className="text-[10px] text-slate-400 mt-1">Loyalty conversion 10% rate</p>
                      </div>
                      <span className="font-mono text-emerald-600 font-bold">+1,420 PTS</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                      <div>
                        <p className="font-bold text-slate-800">Indigo flights Delhi-Bombay lock</p>
                        <p className="text-[10px] text-slate-400 mt-1">Direct wholesale ledger lock</p>
                      </div>
                      <span className="font-mono text-emerald-600 font-bold">+540 PTS</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-bold text-slate-800">Referral reward (Aarav Singhal)</p>
                        <p className="text-[10px] text-slate-400 mt-1">Friend initial ledger load</p>
                      </div>
                      <span className="font-mono text-emerald-600 font-bold">+500 PTS</span>
                    </div>

                  </motion.div>
                </div>

                {/* Birthday Rewards block */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Birthday Rewards (Section 5.13)</h4>
                  <motion.div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between h-full min-h-[160px]" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-800">Your Birthday Schedule</p>
                        <Calendar className="w-4 h-4 text-orange-500" />
                      </div>
                      <input 
                        type="date" 
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none font-mono"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                      />
                      <p className="text-[10px] text-slate-400 leading-snug">Dispatches a surprise ₹2,500 premium resort coupon and credits 500 PTS directly to your ledger annually.</p>
                    </div>

                    <button
                      type="button"
                      disabled={birthdayRewardClaimed}
                      onClick={handleClaimBirthday}
                      className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 text-center block"
                    >
                      {birthdayRewardClaimed ? '✓ 500 PTS Credited' : 'Claim Annual Birthday 500 PTS Upgrade'}
                    </button>
                  </motion.div>
                </div>

              </div>

            </div>
          )}

          {/* 5. TRAVEL WISHLIST MODULE (Section 5.1/5.8) */}
          {activeSubTab === 'wishlist' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">Digital Travel Wishlist</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Maintain a beautiful list of destinations, hotels, or packages that you plan to reserve in the future.</p>
                </div>
                <Heart className="w-5 h-5 text-red-500 fill-current animate-pulse shrink-0" />
              </div>

              {/* Add Wishlist Form */}
              <form onSubmit={handleAddWish} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-wrap sm:flex-nowrap gap-3 items-end">
                <div className="flex-1 min-w-[150px] space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Destination / Resort Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Radisson Blu Temple Bay Mahabalipuram"
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-xl focus:ring-1 focus:ring-orange-500"
                    value={wishNameInput}
                    onChange={(e) => setWishNameInput(e.target.value)}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Category</label>
                  <select 
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-xl"
                    value={wishTypeInput}
                    onChange={(e) => setWishTypeInput(e.target.value)}
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Package">Package</option>
                    <option value="Flight">Flight</option>
                  </select>
                </div>
                <div className="w-32 space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase font-bold">Price Est. (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border border-slate-200 outline-none text-xs font-bold px-3 py-2 rounded-xl"
                    value={wishPriceInput}
                    onChange={(e) => setWishPriceInput(parseInt(e.target.value) || 0)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all w-full sm:w-auto text-center font-mono"
                >
                  Save Wish
                </button>
              </form>

              {/* Wishlist grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {wishlist.map(w => (
                  <div key={w.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm relative flex flex-col justify-between">
                    <div className="aspect-video relative overflow-hidden h-36">
                      <img src={w.img} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                          {w.type}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setWishlist(wishlist.filter(item => item.id !== w.id))}
                        className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{w.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Est. price: <strong className="text-slate-800">₹{w.price.toLocaleString()}</strong></p>
                      </div>

                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
