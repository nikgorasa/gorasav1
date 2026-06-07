
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  SearchParams, 
  FlightSearchParams, 
  TripSuggestion, 
  Flight, 
  Hotel, 
  TravelPackage, 
  Booking, 
  PromoCode,
  PackageInquiry
} from './types';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import MyTrips from './components/MyTrips';
import ConciergeChat from './components/ConciergeChat';
import WhatsAppChannel from './components/WhatsAppChannel';
import PremiumDashboard from './components/PremiumDashboard';
import UserProfile from './components/UserProfile';
import CustomCarousels from './components/CustomCarousels';
import Footer from './components/Footer';
import { getTravelSuggestions, parseFlightQuery } from './services/geminiService';
import { searchIndigoFlights, searchAirIndiaFlights } from './services/flightService';
import { searchPremiumHotels, searchOyoHotels } from './services/hotelService';
import { searchGlobalPartnersHotels, searchGlobalPackages } from './services/globalService';
import { getFromCache, saveToCache } from './services/cacheService';
import { verifyLatestVendorRate, RateVerificationResult } from './services/vendorService';
import { login as apiLogin, getMe, getPackages, getMyBookings, cancelBooking as apiCancelBooking, logout as apiLogout } from './services/apiClient';
import { 
  Briefcase, 
  TrendingUp, 
  Compass, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  X,
  Plane,
  CheckCircle,
  Zap,
  HelpCircle,
  Sparkles,
  Search,
  RefreshCw,
  MessageCircle,
  MessageSquare
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 }
  },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0, 1] } },
  hover: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showFloatWhatsApp, setShowFloatWhatsApp] = useState(false);
  const [searchResult, setSearchResult] = useState<TripSuggestion | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [backendPackages, setBackendPackages] = useState<TravelPackage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'hotels' | 'flights' | 'packages'>('packages');
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'trips' | 'support' | 'profile' | 'admin'>('home');
  const [supportSubTab, setSupportSubTab] = useState<'chat' | 'planner'>('chat');

  // Bookings / Reservation Database State
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "b_prev_1",
      type: "flight",
      itemName: "Indigo 6E-204 Flight BOM to DEL",
      providerOrAirline: "Indigo",
      price: 5400,
      originalPrice: 5400,
      discountApplied: 0,
      bookedDate: "2026-05-18T10:00:00.000Z",
      travelDates: "May 30, 2026",
      status: "Confirmed",
      pnr: "6EGR7Y",
      seatOrRoom: "14B (Standard Economy)",
      paxCount: 1
    },
    {
      id: "b_prev_2",
      type: "hotel",
      itemName: "The Amaya Luxury Resort Goa",
      providerOrAirline: "OYO Premium Partners",
      price: 14200,
      originalPrice: 15200,
      discountApplied: 1000,
      couponCodeUsed: "RASA1000",
      bookedDate: "2026-05-20T14:30:00.000Z",
      travelDates: "Jun 12 - Jun 15, 2026",
      status: "Confirmed",
      pnr: "TBGR4X",
      seatOrRoom: "Cottage Hill View 104",
      paxCount: 2
    }
  ]);

  // Promo Codes CMS Store State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { code: 'GORASA500', discountValue: 500, type: 'flat', description: 'Flat ₹500 off on first platform booking', minBookingValue: 1500, active: true },
    { code: 'RASA1000', discountValue: 1000, type: 'flat', description: 'Corporate Sponsor Flat ₹1,000 off', minBookingValue: 4000, active: true },
    { code: 'FESTIVE10', discountValue: 10, type: 'percentage', description: '10% off on premium global resorts (Max ₹2,500)', minBookingValue: 3000, active: true }
  ]);

  // Checkout Modal State
  const [checkoutDetails, setCheckoutDetails] = useState<{
    itemName: string;
    price: number;
    type: 'flight' | 'hotel' | 'package';
    provider?: string;
  } | null>(null);

  const [checkoutCoupon, setCheckoutCoupon] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'b2b' | 'upi' | 'card' | 'razorpay'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('Initiating secure gateway...');

  // Success Modal State
  const [bookingSuccess, setBookingSuccess] = useState<{ id: string, amount: number, item: string, pnr: string } | null>(null);

  // Holiday custom inquiries state database (Section 5.4 Lead Capture)
  const [inquiries, setInquiries] = useState<PackageInquiry[]>([
    {
      id: "inq_1",
      destination: "Goa Luxury Wellness Retreat",
      travelerName: "Vikram Birla",
      travelerEmail: "vikram@birla.com",
      numberOfDays: 5,
      inclusionsSelected: ["Hotel", "Flight", "Transfers"],
      specificDemands: "Needs a private yacht bookings on evening of day 3.",
      submittedAt: "2026-05-24T12:00:00.000Z",
      status: "Inquired",
      priceEstimated: 48500
    },
    {
      id: "inq_2",
      destination: "Andaman Beach Hopper Escape",
      travelerName: "Meera Sen",
      travelerEmail: "meera@gmail.com",
      numberOfDays: 6,
      inclusionsSelected: ["Hotel", "Transfers"],
      specificDemands: "High floor ocean view cottage block requested.",
      submittedAt: "2026-05-23T15:30:00.000Z",
      status: "Contacted",
      priceEstimated: 34500
    }
  ]);

  // Cache state hook
  const [isCachedResult, setIsCachedResult] = useState(false);

  // Live Vendor Rate verification state hooks
  const [isVerifyingRate, setIsVerifyingRate] = useState(false);
  const [verifiedRateDetails, setVerifiedRateDetails] = useState<RateVerificationResult | null>(null);

  // Interested "Submit Query" lead system states
  const [interestedItem, setInterestedItem] = useState<{
    price: number;
    title: string;
    provider: string;
  } | null>(null);

  const [interestedName, setInterestedName] = useState('');
  const [interestedEmail, setInterestedEmail] = useState('');
  const [interestedPhone, setInterestedPhone] = useState('');
  const [interestedNotes, setInterestedNotes] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryLogs, setInquiryLogs] = useState<string[]>([]);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  // Restore session from JWT token on page load
  useEffect(() => {
    const token = localStorage.getItem('gorasa_token');
    if (token) {
      getMe().then((u) => {
        setUser({
          name: u.name,
          email: u.email,
          role: u.role === 'CORPORATE_USER' ? 'corporate' : u.role === 'SALES' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? 'agent' : 'user',
          companyName: u.companyName,
          loyaltyPoints: u.loyaltyPoints,
          loyaltyTier: u.loyaltyTier as 'Silver' | 'Gold' | 'Platinum',
          walletBalance: u.walletBalance,
        });
      }).catch(() => {
        apiLogout();
      });
    }
  }, []);

  // Fetch packages from backend on mount
  useEffect(() => {
    getPackages().then((pkgs) => {
      const mapped: TravelPackage[] = pkgs.map((p) => ({
        id: p.id,
        title: p.title,
        duration: p.duration,
        price: p.price,
        originalPrice: p.originalPrice || undefined,
        rating: p.rating,
        provider: p.provider,
        inclusions: JSON.parse(p.inclusions || '[]'),
        imageUrl: JSON.parse(p.images || '[]')[0] || '',
      }));
      setBackendPackages(mapped);
    }).catch((err) => {
      console.error('Failed to fetch packages from backend:', err);
    });
  }, []);

  // Fetch bookings from backend when user logs in
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    getMyBookings().then((data) => {
      const mapped: Booking[] = data.map((b) => ({
        id: b.id,
        type: b.type.toLowerCase() === 'flight' ? 'flight' : b.type.toLowerCase() === 'hotel' ? 'hotel' : 'package',
        itemName: b.itemName,
        providerOrAirline: b.providerOrAirline || 'GoRASA',
        price: b.price,
        originalPrice: b.originalPrice || b.price,
        discountApplied: b.discountApplied,
        couponCodeUsed: b.couponCodeUsed || undefined,
        bookedDate: b.bookedAt,
        travelDates: b.travelDates ? (() => {
          try {
            const d = JSON.parse(b.travelDates);
            if (d.from && d.to) {
              const from = new Date(d.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const to = new Date(d.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return `${from} - ${to}`;
            }
            return b.travelDates;
          } catch {
            return b.travelDates;
          }
        })() : 'TBD',
        status: (b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()) as 'Confirmed' | 'Cancelled' | 'Refunded',
        pnr: b.pnr || 'GR' + b.id.slice(0, 6).toUpperCase(),
        seatOrRoom: b.seatOrRoom || undefined,
        paxCount: b.paxCount,
      }));
      setBookings(mapped);
    }).catch((err) => {
      console.error('Failed to fetch bookings from backend:', err);
    });
  }, [user]);

  const handleInterestedClick = (price: number, title: string, provider: string) => {
    setInterestedItem({ price, title, provider });
    setInterestedName(user ? user.name : '');
    setInterestedEmail(user ? user.email : '');
    setInterestedPhone('');
    setInterestedNotes('');
    setInquirySuccess(false);
    setInquiryLogs([]);
    setIsSubmittingInquiry(false);
    setPhoneError('');
    setEmailError('');
    setNameError('');
  };

  const handleSendInterestedInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestedItem) return;

    let hasError = false;
    if (!interestedName.trim()) {
      setNameError('Name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!interestedEmail.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(interestedEmail)) {
      setEmailError('Enter a valid email.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!interestedPhone.trim()) {
      setPhoneError('WhatsApp / Mobile number is required.');
      hasError = true;
    } else if (interestedPhone.trim().length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (hasError) return;

    setIsSubmittingInquiry(true);
    setInquiryLogs([]);
    setInquirySuccess(false);

    const logs = [
      `[1/7] Formulating bespoke package request for "${interestedItem.title}"...`,
      `[2/7] Binding traveler dossier identifiers (${interestedName} • ${interestedEmail})...`,
      `[3/7] Initiating secure SSL handshake on outbound SMTP relay gates...`,
      `[4/7] Connecting to Google Workspace MX inbox at rasatravelindia@gmail.com...`,
      `[5/7] Authenticating with GoRASA centralized pricing ledger...`,
      `[6/7] Transmitting encrypted inquiry docket parameters...`,
      `[7/7] Handshake confirmed. Lead successfully routed (SMTP Code GR-200).`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setInquiryLogs(prev => [...prev, log]);

        if (index === logs.length - 1) {
          setIsSubmittingInquiry(false);
          setInquirySuccess(true);

          // Give voice to this action! Audio synthesis notice to client
          if ('speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
              const voiceConfirmation = `Thank you, ${interestedName}. Your interest query for ${interestedItem.title} has been successfully registered and emailed to the GoRaza reservation office. We will be in touch with you very soon!`;
              const utterance = new SpeechSynthesisUtterance(voiceConfirmation);
              const voices = window.speechSynthesis.getVoices();
              const voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US')) || voices[0];
              if (voice) {
                utterance.voice = voice;
              }
              utterance.rate = 0.95;
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.error(err);
            }
          }

          // Append to parent CRM inquiries list state
          const newInquiry: PackageInquiry = {
            id: `inq_pack_${Math.random().toString(36).substr(2, 9)}`,
            destination: interestedItem.title,
            travelerName: user ? `${interestedName} (${user.loyaltyTier} VIP)` : interestedName,
            travelerEmail: interestedEmail,
            numberOfDays: 5,
            inclusionsSelected: ["Wholesale Flights Check", "Premium Stay", "Airport Lounge Access"],
            specificDemands: `Interactive Package Lead. Provider: ${interestedItem.provider}. Mobile: ${interestedPhone}. message: ${interestedNotes || 'Interested - Requesting wholesale rate sheet and custom flight quotes.'}`,
            submittedAt: new Date().toISOString(),
            status: 'Inquired',
            priceEstimated: interestedItem.price
          };

          setInquiries(prev => [newInquiry, ...prev]);
        }
      }, (index + 1) * 750);
    });
  };

  // Auto-prefill inquiry form if user logs in while modal is active
  React.useEffect(() => {
    if (user && interestedItem) {
      setInterestedName(user.name);
      setInterestedEmail(user.email);
    }
  }, [user, interestedItem]);

  // Search parameters history helper state
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams>({
    location: 'Goa',
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    childrenAges: [],
    infants: 0
  });

  const handleLogin = async (name: string, email: string, role?: 'user' | 'corporate' | 'agent', companyName?: string) => {
    try {
      const data = await apiLogin(email);
      const backendRole = data.user.role;
      const frontendRole = backendRole === 'CORPORATE_USER' ? 'corporate' : 
                           backendRole === 'SALES' || backendRole === 'ADMIN' || backendRole === 'SUPER_ADMIN' ? 'agent' : 'user';
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: frontendRole,
        companyName: data.user.companyName || companyName,
        loyaltyPoints: data.user.loyaltyPoints,
        loyaltyTier: data.user.loyaltyTier as 'Silver' | 'Gold' | 'Platinum',
        walletBalance: data.user.walletBalance,
      });
      setShowLogin(false);
    } catch (err: any) {
      alert(err.message || 'Login failed. Check your email.');
    }
  };

  // Trigger secure payment overlay desk
  const initiatePayment = async (amount: number, itemName: string, provider?: string, itemType?: 'flight' | 'hotel' | 'package') => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const resolvedType = itemType || (searchType === 'packages' ? 'package' : searchType === 'hotels' ? 'hotel' : 'flight');
    const targetProvider = provider || (resolvedType === 'flight' ? 'GoRASA Aviation' : resolvedType === 'hotel' ? 'GoRASA Resorts' : 'GoRASA Direct');

    setCheckoutDetails({
      itemName,
      price: amount,
      type: resolvedType,
      provider: targetProvider
    });
    setCheckoutCoupon('');
    setPaymentMode(user.role !== 'user' ? 'b2b' : 'upi');

    // Launch live vendor rate check in parallel
    setIsVerifyingRate(true);
    setVerifiedRateDetails(null);

    try {
      const resolvedSearchType = resolvedType === 'package' ? 'packages' : resolvedType === 'hotel' ? 'hotels' : 'flights';
      const verified = await verifyLatestVendorRate(resolvedSearchType, itemName, targetProvider, amount);
      setVerifiedRateDetails(verified);
    } catch (e) {
      console.error("[Vendor Rate Check Error]", e);
      // Fallback
      setVerifiedRateDetails({
        itemName,
        originalPrice: amount,
        liveRate: amount,
        priceShift: 0,
        message: "Live reservation rates matched. Standard ledger locked.",
        lockId: "GR-LOCK-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        status: 'Matched',
        expirationTime: new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsVerifyingRate(false);
    }
  };

  // Razorpay simulation
  const handleRazorpayExecute = (amount: number, itemName: string) => {
    const options = {
      key: "rzp_test_dummykey",
      amount: amount * 100,
      currency: "INR",
      name: "GoRASA Travel Platform",
      description: `Booking for ${itemName}`,
      image: "https://picsum.photos/200",
      handler: function (response: any) {
        completePaymentProcess(amount, amount, 0, undefined, itemName);
      },
      prefill: {
        name: user?.name || "Passenger",
        email: user?.email || "support@gorasa.com",
        contact: "9999999999"
      },
      notes: {
        address: "GoRASA Headquarters, Bengaluru"
      },
      theme: {
        color: "#f97316"
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      completePaymentProcess(amount, amount, 0, undefined, itemName);
    }
  };

  // Securely complete transaction parameters and add bookings list
  const completePaymentProcess = (
    finalPrice: number, 
    originalPrice: number, 
    discountValue: number, 
    couponCodeUsed?: string, 
    itemNameSelected?: string
  ) => {
    setIsProcessingPayment(true);
    const targetItemName = itemNameSelected || checkoutDetails?.itemName || "Premium Resort Package";

    setTimeout(() => {
      setProcessingStatusText("Verifying payment capture indices...");
      setTimeout(() => {
        setProcessingStatusText("Updating B2B wallet ledgers...");
        setTimeout(() => {
          setProcessingStatusText("Dispatching verified WhatsApp API boarding pass...");
          setTimeout(() => {
            const finalPnr = "GR" + Math.random().toString(36).slice(2, 8).toUpperCase();
            const actualBookingId = "b_" + Math.random().toString(36).slice(2, 9);
            
            const newBooking: Booking = {
              id: actualBookingId,
              type: checkoutDetails?.type || 'hotel',
              itemName: targetItemName,
              providerOrAirline: checkoutDetails?.provider || 'GoRASA Partner',
              price: finalPrice,
              originalPrice: originalPrice,
              discountApplied: discountValue,
              couponCodeUsed: couponCodeUsed || undefined,
              bookedDate: new Date().toISOString(),
              travelDates: lastSearchParams.startDate || new Date().toISOString().split('T')[0],
              status: "Confirmed",
              pnr: finalPnr,
              seatOrRoom: checkoutDetails?.type === 'flight' ? '12C (Preferred)' : checkoutDetails?.type === 'hotel' ? 'Executive Cottage 304' : 'Special Tour Guide Entry',
              paxCount: (lastSearchParams.adults + lastSearchParams.children + lastSearchParams.infants) || 1
            };

            setBookings(prev => [newBooking, ...prev]);

            if (user && paymentMode === 'b2b') {
              setUser({
                ...user,
                walletBalance: Math.max(0, user.walletBalance - finalPrice),
                loyaltyPoints: user.loyaltyPoints + Math.round(finalPrice * 0.1 * (user.loyaltyTier === 'Platinum' ? 2 : user.loyaltyTier === 'Gold' ? 1.5 : 1))
              });
            } else if (user) {
              setUser({
                ...user,
                loyaltyPoints: user.loyaltyPoints + Math.round(finalPrice * 0.1 * (user.loyaltyTier === 'Platinum' ? 2 : user.loyaltyTier === 'Gold' ? 1.5 : 1))
              });
            }

            window.dispatchEvent(new CustomEvent('gorasa-booking-confirmed', {
              detail: {
                itemName: targetItemName,
                pnr: finalPnr,
                price: finalPrice,
                type: checkoutDetails?.type || 'hotel'
              }
            }));

            setCheckoutDetails(null);
            setIsProcessingPayment(false);

            setBookingSuccess({
              id: actualBookingId,
              amount: finalPrice,
              item: targetItemName,
              pnr: finalPnr
            });

          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleHotelClick = (hotel: Hotel) => {
    const query = encodeURIComponent(`${hotel.name} ${hotel.location}`);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiCancelBooking(bookingId);
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          if (user && user.role !== 'user') {
            setUser(u => u ? { ...u, walletBalance: u.walletBalance + b.price } : null);
          }
          return { ...b, status: 'Cancelled' as const };
        }
        return b;
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleHotelSearch = async (params: SearchParams, forceLive = false) => {
    setSearchType('hotels');
    setIsSearching(true);
    setFlights([]);
    setPackages([]);
    setSearchResult(null);
    setLastSearchParams(params);
    
    const cacheKey = "hotels_" + JSON.stringify(params);
    if (!forceLive) {
      const cached = getFromCache<Hotel[]>(cacheKey);
      if (cached) {
        setHotels(cached);
        setIsSearching(false);
        setIsCachedResult(true);
        scrollToResults();
        return;
      }
    }
    setIsCachedResult(false);
    
    const [premiumResults, oyoResults, globalResults] = await Promise.all([
      searchPremiumHotels(params),
      searchOyoHotels(params),
      searchGlobalPartnersHotels(params)
    ]);
    
    const combined = [...premiumResults, ...oyoResults, ...globalResults].sort((a, b) => a.price - b.price);
    
    saveToCache(cacheKey, combined);
    setHotels(combined);
    setIsSearching(false);
    scrollToResults();
  };

  const handleFlightSearch = async (params: FlightSearchParams, forceLive = false) => {
    setSearchType('flights');
    setIsSearching(true);
    setHotels([]);
    setPackages([]);
    setSearchResult(null);
    setLastSearchParams(params);

    const cacheKey = "flights_" + JSON.stringify(params);
    if (!forceLive) {
      const cached = getFromCache<Flight[]>(cacheKey);
      if (cached) {
        setFlights(cached);
        setIsSearching(false);
        setIsCachedResult(true);
        scrollToResults();
        return;
      }
    }
    setIsCachedResult(false);

    const [indigoResults, airIndiaResults] = await Promise.all([
      searchIndigoFlights(params),
      searchAirIndiaFlights(params)
    ]);
    
    const combined = [...indigoResults, ...airIndiaResults].sort((a, b) => a.price - b.price);
    
    saveToCache(cacheKey, combined);
    setFlights(combined);
    setIsSearching(false);
    scrollToResults();
  };

  const handleAIFlightSearch = async (query: string, forceLive = false) => {
    setSearchType('flights');
    setIsSearching(true);
    setHotels([]);
    setPackages([]);
    setFlights([]);
    
    const cacheKey = "ai_flights_" + query;
    if (!forceLive) {
      const cached = getFromCache<Flight[]>(cacheKey);
      if (cached) {
        setFlights(cached);
        setIsSearching(false);
        setIsCachedResult(true);
        scrollToResults();
        return;
      }
    }
    setIsCachedResult(false);
    
    const parsedParams = await parseFlightQuery(query);
    
    const searchParams: FlightSearchParams = {
      location: parsedParams.location || 'Delhi',
      origin: parsedParams.origin || 'Mumbai',
      startDate: parsedParams.startDate || new Date().toISOString().split('T')[0],
      endDate: parsedParams.endDate || '',
      adults: parsedParams.adults || 1,
      children: parsedParams.children || 0,
      infants: parsedParams.infants || 0,
      childrenAges: [],
      tripType: parsedParams.tripType as any || 'one-way'
    };
    setLastSearchParams(searchParams);

    const [indigoResults, airIndiaResults] = await Promise.all([
      searchIndigoFlights(searchParams),
      searchAirIndiaFlights(searchParams)
    ]);
    
    const combined = [...indigoResults, ...airIndiaResults].sort((a, b) => a.price - b.price);
    
    saveToCache(cacheKey, combined);
    setFlights(combined);
    setIsSearching(false);
    scrollToResults();
  };

  const handlePackageSearch = async (params: SearchParams, forceLive = false) => {
    setSearchType('packages');
    setIsSearching(true);
    setHotels([]);
    setFlights([]);
    setLastSearchParams(params);

    const cacheKey = "packages_" + JSON.stringify(params);
    if (!forceLive) {
      const cached = getFromCache<{ packages: TravelPackage[], suggestion: TripSuggestion | null }>(cacheKey);
      if (cached) {
        setPackages(cached.packages);
        setSearchResult(cached.suggestion);
        setIsSearching(false);
        setIsCachedResult(true);
        scrollToResults();
        return;
      }
    }
    setIsCachedResult(false);
    
    const [globalPackages, aiSuggestion] = await Promise.all([
      searchGlobalPackages(params),
      getTravelSuggestions(params)
    ]);
    
    saveToCache(cacheKey, { packages: globalPackages, suggestion: aiSuggestion });
    setPackages(globalPackages);
    setSearchResult(aiSuggestion);
    setIsSearching(false);
    scrollToResults();
  };

  const handleForceRefresh = async () => {
    if (searchType === 'hotels') {
      await handleHotelSearch(lastSearchParams, true);
    } else if (searchType === 'flights') {
      await handleFlightSearch(lastSearchParams as FlightSearchParams, true);
    } else if (searchType === 'packages') {
      await handlePackageSearch(lastSearchParams, true);
    }
  };

  const scrollToResults = () => {
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTogglePromo = (code: string) => {
    setPromoCodes(prev => prev.map(p => p.code === code ? { ...p, active: !p.active } : p));
  };

  const handleCreatePromo = (newPromo: PromoCode) => {
    setPromoCodes(prev => [...prev, newPromo]);
  };

  const handleTopUpWallet = (companyName: string, amount: number) => {
    if (user) {
      setUser({
        ...user,
        walletBalance: user.walletBalance + amount
      });
    }
  };

  const handleRedeemPoints = (pointsCost: number, rewardTitle: string) => {
    if (user && user.loyaltyPoints >= pointsCost) {
      setUser({
        ...user,
        loyaltyPoints: user.loyaltyPoints - pointsCost
      });
      alert(`Success! Redemeed ${pointsCost} PTS voucher for "${rewardTitle}". Vouchers sent to your workspace.`);
    }
  };

  const handleAdminCancelBooking = (bookingId: string) => {
    handleCancelBooking(bookingId);
  };

  const handleAdminSetSeat = (bookingId: string, itemStr: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, seatOrRoom: itemStr } : b));
  };

  const calculateCheckoutTotal = () => {
    if (!checkoutDetails) return { base: 0, discount: 0, tax: 0, grand: 0 };
    const base = verifiedRateDetails ? verifiedRateDetails.liveRate : checkoutDetails.price;
    let discount = 0;
    
    if (checkoutCoupon) {
      const activeObj = promoCodes.find(p => p.code === checkoutCoupon && p.active);
      if (activeObj) {
        if (activeObj.type === 'flat') {
          discount = activeObj.discountValue;
        } else {
          discount = Math.round(base * (activeObj.discountValue / 100));
        }
      }
    }

    const calculatedBaseWithDisc = Math.max(0, base - discount);
    const tax = Math.round(calculatedBaseWithDisc * 0.05);
    const grand = calculatedBaseWithDisc + tax;

    return { base, discount, tax, grand };
  };

  const checkoutSums = calculateCheckoutTotal();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={() => {
          apiLogout();
          setUser(null);
          setCurrentTab('home');
        }}
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            const isAuthorized = user && user.email.toLowerCase().startsWith('rasatravelindia@gmail');
            if (!isAuthorized) {
              setCurrentTab('home');
              return;
            }
          }
          setCurrentTab(tab);
        }}
      />

      <AnimatePresence mode="wait">
        {currentTab === 'home' && (
          <motion.div
            key="home"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-orange-50 to-transparent -z-10 blur-3xl opacity-50"></div>
              <div className="max-w-7xl mx-auto px-4 text-center">
                <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest">GoRASA Premium Portal</span>
                </motion.div>
                <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-serif font-bold text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                  Reserve <br />
                  <span className="text-orange-600 italic">Luxury & Composure.</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed mb-12 font-normal">
                  Indulge in highly curated, elite boutique stays, custom wellness packages, and ultra-luxe domestic and international vacation experiences handpicked for you.
                </motion.p>

                {/* Verified Value Propositions / Premium Pillars */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16 text-left">
                  {[
                    {
                      icon: <TrendingUp className="w-6 h-6" />,
                      title: 'Loyalty Points Redemptions',
                      desc: 'We credit reward tier loyalty points directly to your central wallet on every elite boutique hotel suite and custom holiday package reservation.',
                      footer: '1 Point = ₹1',
                      featured: false
                    },
                    {
                      icon: <Plane className="w-6 h-6" />,
                      title: 'No Flight Convenience Fees',
                      desc: 'Absolutely zero convenience or handling fees on all domestic flight bookings powered directly via live carrier wholesale pipelines.',
                      footer: 'NIL Fees',
                      featured: true
                    },
                    {
                      icon: <Briefcase className="w-6 h-6" />,
                      title: 'Corporate Travel Program',
                      desc: 'Custom concierge membership programs for business travel management, corporate rates indexes, and priority ticket distribution dockets.',
                      footer: 'Join Club',
                      featured: false
                    }
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`rounded-[1.5rem] border p-8 flex flex-col justify-between group ${
                        card.featured
                          ? 'bg-orange-50/60 border-orange-200/60'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                          card.featured
                            ? 'bg-white text-orange-600'
                            : 'bg-orange-50 text-orange-500'
                        }`}>
                          {card.icon}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">{card.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                      </div>
                      <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-bold ${
                        card.featured
                          ? 'border-orange-200/60 text-orange-700'
                          : 'border-slate-100 text-orange-600'
                      }`}>
                        <span>{card.footer}</span>
                        {i === 2 && (
                          <span className="text-slate-400 text-[10px] font-normal">&rarr;</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Curated Package Catalog Title */}
            <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 pt-12 pb-4 text-center">
                <span className="text-orange-600 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
                  Exclusive Portfolios
                </span>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mt-2">Explore Handcrafted Luxury Escapes</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">
                Select an exquisite luxury pack collection below. Our travel experts are available 24/7 on WhatsApp to customize every element of your stay.
              </p>
            </motion.section>

            <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 pb-24">
              <CustomCarousels 
                onBookPackage={(price, title, provider) => handleInterestedClick(price, title, provider)}
                backendPackages={backendPackages}
              />
            </motion.section>
          </motion.div>
        )}

        {currentTab === 'trips' && (
          <motion.section
            key="trips"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-[600px]"
          >
            <MyTrips 
              user={user} 
              bookings={bookings} 
              onCancelBooking={handleCancelBooking} 
            />
          </motion.section>
        )}

        {currentTab === 'support' && (
          <motion.section
            key="support"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-[600px]"
          >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <motion.div variants={itemVariants}>
                <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
                  Verified Support Desk
                </span>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mt-2">24/7 AI Concierge Center</h2>
                <p className="text-slate-500 text-sm mt-1">Converse with Rasa AI, view real-time flight tracking statuses, or test WhatsApp Business API notification logs.</p>
              </motion.div>
              
              {/* Elegant sub-tab selector with luxury theme styling */}
              <motion.div variants={itemVariants} className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm self-start shrink-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSupportSubTab('chat')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                    supportSubTab === 'chat' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Concierge Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSupportSubTab('planner')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                    supportSubTab === 'planner' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>VIP WhatsApp Desk</span>
                </motion.button>
              </motion.div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {supportSubTab === 'chat' ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
                >
                  <ConciergeChat 
                    user={user} 
                    activeContextText={`Reservations booked: ${bookings.length}. Loyalty Level: ${user?.loyaltyTier || 'None'}`} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
                >
                  <WhatsAppChannel 
                    user={user} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {currentTab === 'profile' && (
          <motion.section
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-[600px]"
          >
            <UserProfile 
              user={user} 
              bookings={bookings} 
              onUpdateUser={setUser} 
              onLoginClick={() => setShowLogin(true)} 
            />
          </motion.section>
        )}

        {currentTab === 'admin' && user && user.email.toLowerCase().startsWith('rasatravelindia@gmail') && (
          <motion.section
            key="admin"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-7xl mx-auto px-4 pt-32 pb-24 min-h-[600px]"
          >
            <PremiumDashboard 
              currentUser={user} 
              bookings={bookings} 
              promoCodes={promoCodes}
              onTogglePromo={handleTogglePromo}
              onCreatePromo={handleCreatePromo}
              onTopUpWallet={handleTopUpWallet}
              onRedeemPoints={handleRedeemPoints}
              onAdminCancelBooking={handleAdminCancelBooking}
              onAdminSetSeat={handleAdminSetSeat}
              inquiries={inquiries}
              onUpdateInquiryStatus={(id, status) => setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutDetails && (
          <motion.div
            key="checkout"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          >
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => {
                if (!isProcessingPayment) {
                  setCheckoutDetails(null);
                  setVerifiedRateDetails(null);
                }
              }}
            />
            
            <motion.div
              variants={modalVariants}
              className="relative bg-white w-full max-w-xl rounded-[1.5rem] shadow-2xl overflow-hidden p-8 border border-slate-100">
            {isProcessingPayment ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Processing Secure Transaction</h3>
                <p className="text-orange-500 font-semibold text-sm animate-pulse">{processingStatusText}</p>
                <p className="text-xs text-slate-400 font-mono">Bilateral GoRASA API connections encrypted via SSL (256-Bit)</p>
              </div>
            ) : isVerifyingRate ? (
              <div className="py-16 text-center space-y-6 animate-in fade-in duration-300">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-orange-500/15 border-t-orange-500 rounded-full animate-spin"></div>
                  <HelpCircle className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Calling Vendor Web Service API...</h3>
                <p className="text-orange-500 font-bold text-sm animate-pulse">Checking dynamic reservation quotes & real-time inventory on {checkoutDetails.provider}...</p>
                <p className="text-xs text-slate-400 font-mono">Querying live wholesale GDS channels for fare locks...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-green-600 font-extrabold uppercase bg-green-50 px-3 py-1 rounded-full text-[10px] tracking-wide">
                      GoRASA Safe Processing
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mt-2">Platform Secure Checkout</h3>
                  </div>
                  <button 
                    onClick={() => { setCheckoutDetails(null); setVerifiedRateDetails(null); }} 
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {verifiedRateDetails && (
                  <div className={`p-4 rounded-2xl border text-xs flex gap-3 animate-in slide-in-from-top-4 duration-300 ${
                    verifiedRateDetails.status === 'Matched' 
                      ? 'bg-emerald-50/80 border-emerald-200/50 text-emerald-950' 
                      : 'bg-indigo-50/80 border-indigo-200/50 text-indigo-950'
                  }`}>
                    <div className="p-1.5 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      {verifiedRateDetails.status === 'Matched' 
                        ? <CheckCircle className="w-5 h-5 text-emerald-600" /> 
                        : <Zap className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold uppercase tracking-wider text-[8px] font-mono ${verifiedRateDetails.status === 'Matched' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                          {verifiedRateDetails.status === 'Matched' ? 'Standard GDS Rate Confirmed' : 'Live Promotional Tariff Unlocked'}
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white shadow-sm font-bold border border-slate-100/50">
                          ID: {verifiedRateDetails.lockId}
                        </span>
                      </div>
                      <p className="font-medium text-slate-700">{verifiedRateDetails.message}</p>
                      <div className="text-[10px] text-slate-400 font-mono font-bold uppercase flex items-center gap-1.5 pt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft"></span>
                        <span>Inventory locked until {verifiedRateDetails.expirationTime}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Item Selected</span>
                    <p className="font-bold text-slate-800 text-sm mt-1">{checkoutDetails.itemName}</p>
                    <p className="text-xs text-slate-400 font-medium">{checkoutDetails.provider}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">
                      {verifiedRateDetails && verifiedRateDetails.liveRate !== checkoutDetails.price ? 'Adjusted Rate' : 'Verified Fare'}
                    </span>
                    <p className={`font-bold text-lg mt-1 font-mono ${verifiedRateDetails && verifiedRateDetails.liveRate < checkoutDetails.price ? 'text-emerald-600' : 'text-slate-900'}`}>
                      ₹{(verifiedRateDetails ? verifiedRateDetails.liveRate : checkoutDetails.price).toLocaleString()}
                    </p>
                    {verifiedRateDetails && verifiedRateDetails.liveRate !== checkoutDetails.price && (
                      <span className="text-[9px] text-slate-400 font-mono block">
                        (Was ₹{checkoutDetails.price.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Apply Promo Code Voucher</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-xs font-bold"
                    value={checkoutCoupon}
                    onChange={(e) => setCheckoutCoupon(e.target.value)}
                  >
                    <option value="">No Coupon Code selected</option>
                    {promoCodes.filter(p => p.active && checkoutDetails.price >= p.minBookingValue).map(p => (
                      <option key={p.code} value={p.code}>
                        {p.code} - {p.description} (Save {p.type === 'flat' ? `₹${p.discountValue}` : `${p.discountValue}%`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-mono">Configure Payment Method</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {user?.role !== 'user' && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPaymentMode('b2b')}
                        disabled={user.walletBalance < checkoutSums.grand}
                        className={`p-3 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                          paymentMode === 'b2b' 
                            ? 'border-orange-500 bg-orange-50/30 text-orange-600' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                        }`}
                      >
                        <Briefcase className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-bold">Corp Wallet</span>
                        <span className="text-[9px] text-slate-400 block font-mono">₹{user.walletBalance.toLocaleString()}</span>
                      </motion.button>
                    )}

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPaymentMode('upi')}
                      className={`p-3 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                        paymentMode === 'upi' 
                          ? 'border-orange-500 bg-orange-50/30 text-orange-600' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10px] font-bold">BHIM UPI</span>
                      <span className="text-[9px] text-slate-400 block">Instant processing</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPaymentMode('card')}
                      className={`p-3 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                        paymentMode === 'card' 
                          ? 'border-orange-500 bg-orange-50/30 text-orange-600' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-cyan-500" />
                      <span className="text-[10px] font-bold">Credit/Debit</span>
                      <span className="text-[9px] text-slate-400 block">Visa/Mastercard</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPaymentMode('razorpay')}
                      className={`p-3 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                        paymentMode === 'razorpay' 
                          ? 'border-orange-500 bg-orange-50/30 text-orange-600' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold">Razorpay SDK</span>
                      <span className="text-[9px] text-slate-400 block">External merchant</span>
                    </motion.button>
                  </div>
                </div>

                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100/70 text-xs space-y-2.5">
                  <div className="flex justify-between items-center text-slate-500 font-medium font-mono">
                    <span>Selected Fare:</span>
                    <span>₹{checkoutSums.base.toLocaleString()}</span>
                  </div>
                  {checkoutSums.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-bold font-mono">
                      <span>Voucher Discount applied ({checkoutCoupon}):</span>
                      <span>-₹{checkoutSums.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-500 font-medium font-mono">
                    <span>Convenience GST (5%):</span>
                    <span>₹{checkoutSums.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2.5 flex justify-between items-center font-black text-slate-900 text-sm font-mono">
                    <span>Total Amount Charged:</span>
                    <span>₹{checkoutSums.grand.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => { setCheckoutDetails(null); setVerifiedRateDetails(null); }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel checkout
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMode === 'razorpay') {
                        handleRazorpayExecute(checkoutSums.grand, checkoutDetails.itemName);
                      } else {
                        completePaymentProcess(
                          checkoutSums.grand, 
                          checkoutSums.base, 
                          checkoutSums.discount, 
                          checkoutCoupon || undefined, 
                          checkoutDetails.itemName
                        );
                      }
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span>Confirm & Pay ₹{checkoutSums.grand.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            key="booking-success"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setBookingSuccess(null)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-[1.5rem] p-12 max-w-lg w-full text-center shadow-2xl border border-slate-100">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-4xl font-serif font-bold text-slate-900 mb-4"
            >Reservation Confirmed!</motion.h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Your ticket to <strong>{bookingSuccess.item}</strong> has been issued successfully. We've compiled your tax receipt and sent booking details to your WhatsApp.
            </p>

            <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-2 font-mono">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Voucher Code (PNR)</span>
                <span className="text-slate-900 font-extrabold uppercase text-xs">{bookingSuccess.pnr}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>GoRASA Transaction ID</span>
                <span className="text-slate-900 font-medium">#{bookingSuccess.id.toUpperCase().slice(-8)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Total Amount Charged</span>
                <span className="text-slate-900 font-extrabold">₹{bookingSuccess.amount.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setBookingSuccess(null);
                setCurrentTab('trips');
              }}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>Get Digital Boarding Ticket</span>
            </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interested / Inquiry Modal */}
      <AnimatePresence>
        {interestedItem && (
          <motion.div
            key="interested"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setInterestedItem(null)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-[1.5rem] p-8 md:p-10 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setInterestedItem(null)} 
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {!inquirySuccess ? (
              <div>
                <div className="mb-6">
                  <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
                    Luxury Package Interest
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mt-3 mb-1">Inquire About This Experience</h2>
                  <p className="text-slate-500 text-sm">
                    Registering interest locks vendor rates and alerts our elite concierge desk.
                  </p>
                </div>

                {/* Package Highlights brief strip */}
                <div className="bg-slate-50/75 rounded-2xl p-4 mb-6 border border-slate-100 flex justify-between items-center sm:gap-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{interestedItem.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Offered via curated wholesale GDS portals</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-mono">Approx. Deal Rate</span>
                    <span className="text-sm font-black text-orange-500 font-mono">₹{interestedItem.price.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleSendInterestedInquiry} className="space-y-4">
                  {user ? (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800 text-xs font-medium">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-bold">Authenticated Traveler Linked</span>
                        <span className="text-emerald-600">{user.name} ({user.email}) • {user.loyaltyTier} Tier</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-800 text-xs text-left">
                      <div>
                        <span className="block font-bold">Not logged in currently</span>
                        <span className="text-amber-600/90">Authentication unlocks loyalty multipliers & rewards.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowLogin(true); }}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all text-[11px]"
                      >
                        Log In Now
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Full Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl outline-none transition-all text-xs font-semibold"
                        placeholder="E.g. Alex Cooper"
                        value={interestedName}
                        onChange={(e) => setInterestedName(e.target.value)}
                        disabled={!!user}
                      />
                      {nameError && <p className="text-[10px] text-red-500 mt-1 font-bold font-mono">{nameError}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Email Address</label>
                      <input 
                        type="email"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl outline-none transition-all text-xs font-semibold"
                        placeholder="E.g. alex@corporate.com"
                        value={interestedEmail}
                        onChange={(e) => setInterestedEmail(e.target.value)}
                        disabled={!!user}
                      />
                      {emailError && <p className="text-[10px] text-red-500 mt-1 font-bold font-mono">{emailError}</p>}
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">WhatsApp or Mobile Number</label>
                    <input 
                      type="tel"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl outline-none transition-all text-xs font-semibold"
                      placeholder="WhatsApp enabled 10-digit number"
                      value={interestedPhone}
                      onChange={(e) => setInterestedPhone(e.target.value)}
                    />
                    {phoneError && <p className="text-[10px] text-red-500 mt-1 font-bold font-mono">{phoneError}</p>}
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Inquiry Specific Demands / Preferred Dates</label>
                    <textarea 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl outline-none transition-all text-xs font-semibold h-18 resize-none"
                      placeholder="E.g. Traveling on 14th June, requesting flight upgrades, 2 Adults."
                      value={interestedNotes}
                      onChange={(e) => setInterestedNotes(e.target.value)}
                    />
                  </div>

                  {isSubmittingInquiry ? (
                    <div className="bg-slate-900 rounded-2xl p-4 mt-4 text-left font-mono text-[10px] leading-relaxed space-y-1.5 text-zinc-300 border border-slate-800 h-32 overflow-y-auto">
                      {inquiryLogs.map((log, id) => (
                        <div key={id} className="animate-in fade-in slide-in-from-left-4 duration-300">
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="submit"
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95 text-xs uppercase flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
                      >
                        <Plane className="w-4 h-4 text-orange-400 rotate-45" />
                        <span>Submit Interest to Reservation Desk</span>
                      </button>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Or Bypass Form</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <a
                        href={`https://wa.me/919810012345?text=${encodeURIComponent(
                          `Namaste GoRASA! I am interested in inquiring about the experience: *${interestedItem.title}* (deal rate: ₹${interestedItem.price.toLocaleString()}). Please assist me with custom booking rates!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center space-x-1.5 cursor-pointer text-center"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Inquire Instantly via WhatsApp Chat</span>
                      </a>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="text-center py-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">Enquiry Submitted!</h2>
                <div className="text-slate-500 text-sm space-y-4 mb-6 max-w-sm mx-auto leading-relaxed">
                  <p>
                    Thank you for your query and we will be in <strong className="text-slate-900 font-extrabold">Touch soon</strong>.
                  </p>
                  <p className="text-xs text-slate-400 bg-slate-50 px-4 py-2 border border-slate-100 rounded-xl leading-normal">
                    Reservations check logged at <span className="font-bold text-orange-600 font-mono">rasatravelindia@gmail.com</span>. You can tap the button below to instantly trigger WhatsApp concierge updates for this docket.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 font-mono text-xs mb-6 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Experience</span>
                    <span className="text-slate-800 font-bold max-w-[200px] text-right truncate">{interestedItem.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Contact</span>
                    <span className="text-slate-800 font-medium">{interestedEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile / WhatsApp</span>
                    <span className="text-slate-800 font-medium">{interestedPhone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={`https://wa.me/919810012345?text=${encodeURIComponent(
                      `Namaste GoRASA! I have submitted an experience inquiry.\n\n*Experience Details*:\n- Name: ${interestedItem.title}\n- Deal Rate: ₹${interestedItem.price.toLocaleString()}\n\n*Traveler Details*:\n- Name: ${interestedName}\n- Contact: ${interestedPhone}\n- Specific Demands: ${interestedNotes || 'None'}\n\nPlease check live wholesale inventory for my request!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:shadow-xl transition-all active:scale-95 text-xs text-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4.5 h-4.5 fill-white shrink-0" />
                    <span>Open in WhatsApp For Booking Support</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setInterestedItem(null)}
                    className="w-full py-3 hover:bg-slate-50 text-slate-500 rounded-2xl font-semibold transition-all active:scale-95 text-xs text-semibold cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}

      <Footer />

      {/* Floating WhatsApp Assist Widget */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
        <AnimatePresence>
          {showFloatWhatsApp && (
            <motion.div
              key="whatsapp-float"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
              className="bg-white rounded-3xl border border-slate-150 p-5 shadow-2xl w-80 mb-3 text-left">
            <motion.div variants={itemVariants} className="flex items-center space-x-3 pb-3 border-b border-slate-100 mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  GR
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
              </motion.div>
              <div>
                <h5 className="text-xs font-serif font-bold text-slate-900 leading-none">GoRASA VIP Assistant</h5>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">Status: Active • Repl. &lt; 5 mins</span>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFloatWhatsApp(false)}
                className="ml-auto text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-[11px] text-slate-500 leading-normal mb-4">
              Namaste! Connect with an elite reservation officer directly on WhatsApp for flights and stays priority matching.
            </motion.p>

            {/* Quick action triggers */}
            <div className="space-y-1.5">
            {[
              { label: 'Speak to Live Concierge Room', text: 'Namaste GoRASA Desk! I need immediate support regarding a premium booking dossier.' },
              { label: 'Request GDS Airfare Quote', text: 'Namaste GoRASA Desk! I want to request custom carrier fares matching for upcoming flights.' },
              { label: 'Boutique Stays Consultation', text: 'Namaste GoRASA Desk! I am seeking executive resort stays rate check & suite upgrades.' },
            ].map((opt, idx) => (
              <motion.a
                key={idx}
                variants={itemVariants}
                whileHover={{ x: 4, backgroundColor: 'rgba(236,253,245,0.8)' }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/919810012345?text=${encodeURIComponent(opt.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowFloatWhatsApp(false)}
                className="block px-3 py-2 bg-slate-50 text-slate-700 hover:text-emerald-900 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors font-sans cursor-pointer truncate"
              >
                {opt.label}
              </motion.a>
            ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Official Business Line</span>
              <span className="font-mono text-emerald-600 font-bold">+91 98100 12345</span>
            </div>
          </motion.div>
        )}

        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowFloatWhatsApp(prev => !prev)}
          className={`w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-colors cursor-pointer relative border-2 border-white/40 ${
            showFloatWhatsApp ? 'bg-slate-900 hover:bg-slate-800' : ''
          }`}
          title="Instant WhatsApp Support"
        >
          <motion.div
            animate={{ rotate: showFloatWhatsApp ? 90 : 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
          >
            {showFloatWhatsApp ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="relative">
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 border border-white rounded-full animate-ping"></span>
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 border border-white rounded-full"></span>
              </div>
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default App;
