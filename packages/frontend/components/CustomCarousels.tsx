import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { TravelPackage } from '../types';
import { 
  TOP_DEALS, 
  WEEKEND_DEALS, 
  INTERNATIONAL_PACKAGES, 
  ALL_INCLUSIVE_DEALS, 
  BEACH_VACATIONS, 
  GORASA_SELECT 
} from '../packagesData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Star, 
  Tag, 
  Sparkles, 
  Compass, 
  Sun, 
  MapPin, 
  Award, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

interface CustomCarouselsProps {
  onBookPackage: (price: number, title: string, provider: string) => void;
  backendPackages?: TravelPackage[];
}

const CustomCarousels: React.FC<CustomCarouselsProps> = ({ onBookPackage, backendPackages = [] }) => {
  // Setup individual refs for each carousel to support precise horizontal scrolling controls
  const topDealsRef = useRef<HTMLDivElement>(null);
  const weekendDealsRef = useRef<HTMLDivElement>(null);
  const internationalRef = useRef<HTMLDivElement>(null);
  const allInclusiveRef = useRef<HTMLDivElement>(null);
  const beachRef = useRef<HTMLDivElement>(null);
  const gorasaSelectRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const calculateDiscountPercent = (price: number, originalPrice?: number) => {
    if (!originalPrice) return null;
    const diff = originalPrice - price;
    return Math.round((diff / originalPrice) * 100);
  };

  const renderCarouselSection = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    items: TravelPackage[],
    scrollRef: React.RefObject<HTMLDivElement>,
    badgeColor: string,
    badgeText: string
  ) => {
    return (
      <div className="space-y-6 pt-12 first:pt-4 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${badgeColor}`}>
                {icon}
                <span className="ml-1.5">{badgeText}</span>
              </span>
            </div>
            <h3 className="text-3xl font-serif font-black text-slate-900 mt-2 tracking-tight">
              {title}
            </h3>
            <p className="text-slate-500 text-sm font-normal">
              {subtitle}
            </p>
          </motion.div>

          <div className="hidden sm:flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#fff7ed' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll(scrollRef, 'left')}
              className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-orange-500 rounded-full hover:shadow-md transition-colors cursor-pointer"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#fff7ed' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll(scrollRef, 'right')}
              className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-orange-500 rounded-full hover:shadow-md transition-colors cursor-pointer"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Carousel Runway */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((pkg, idx) => {
              const discount = calculateDiscountPercent(pkg.price, pkg.originalPrice);
              return (
                <motion.div
                  key={pkg.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { delay: idx * 0.05 } }
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  whileHover={{ y: -6 }}
                  className="w-[310px] sm:w-[380px] shrink-0 bg-white rounded-[2.5rem] border border-slate-150 shadow-sm hover:shadow-xl transition-shadow duration-300 snap-start overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => onBookPackage(pkg.price, pkg.title, pkg.provider)}
                >
                  {/* Top Image Banner */}
                  <div className="h-56 relative overflow-hidden shrink-0">
                    <img 
                      src={pkg.imageUrl} 
                      alt={pkg.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                      {discount && (
                        <span className="bg-orange-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow-md flex items-center w-fit">
                          <Tag className="w-3.5 h-3.5 mr-1" />
                          Save {discount}%
                        </span>
                      )}
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs w-fit">
                        {pkg.duration}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                        {pkg.provider}
                      </span>
                    </div>

                    {/* Star Rating Overlay */}
                    <div className="absolute bottom-4 right-4 bg-amber-400 text-slate-900 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center shadow-md">
                      <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900 mr-1" />
                      {pkg.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {pkg.title}
                      </h4>

                      {/* Inclusions list */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Premium Inclusions</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {pkg.inclusions.slice(0, 3).map((inc, i) => (
                            <div key={i} className="flex items-center text-xs text-slate-600">
                              <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mr-2" />
                              <span className="truncate">{inc}</span>
                            </div>
                          ))}
                          {pkg.inclusions.length > 3 && (
                            <p className="text-[10px] italic text-slate-400 pl-5">+ And {pkg.inclusions.length - 3} premium features</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Section */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {pkg.originalPrice && (
                          <span className="text-xs text-slate-400 line-through block font-medium">
                            ₹{pkg.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <div className="flex items-baseline">
                          <span className="text-2xl font-black font-mono text-slate-900">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">/Pax</span>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, backgroundColor: '#f97316' }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookPackage(pkg.price, pkg.title, pkg.provider);
                        }}
                        className="bg-slate-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-2xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Interested
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16 py-12">
      {/* Backend Packages (from database) */}
      {backendPackages.length > 0 && renderCarouselSection(
        'Live from Database',
        'Packages loaded from the GoRASA backend API — real data, live prices.',
        <Sparkles className="w-3.5 h-3.5 text-violet-600" />,
        backendPackages,
        backendRef,
        'bg-violet-50 text-violet-600 border border-violet-100',
        'Live Data'
      )}

      {/* 1. Top Deals */}
      {renderCarouselSection(
        'Top Holiday Deals',
        'Our most selected and highly discounted luxury seasonal packages.',
        <TrendingUp className="w-3.5 h-3.5 text-orange-600" />,
        TOP_DEALS,
        topDealsRef,
        'bg-orange-50 text-orange-600 border border-orange-100',
        'Top Deals'
      )}

      {/* 2. Weekend Deals */}
      {renderCarouselSection(
        'Weekend Gateways',
        'Fast mini-vacations, premium nature stays, and heritage wellness boutique villas.',
        <Calendar className="w-3.5 h-3.5 text-emerald-600" />,
        WEEKEND_DEALS,
        weekendDealsRef,
        'bg-emerald-50 text-emerald-600 border border-emerald-100',
        'Weekend Deals'
      )}

      {/* 3. International Packages */}
      {renderCarouselSection(
        'International Packages',
        'Epic bucket-list escapes from Dubai, Maldives waters and cold Swiss Alps.',
        <Compass className="w-3.5 h-3.5 text-blue-600" />,
        INTERNATIONAL_PACKAGES,
        internationalRef,
        'bg-blue-50 text-blue-600 border border-blue-100',
        'International Packages'
      )}

      {/* 4. All Inclusive deals */}
      {renderCarouselSection(
        'All-Inclusive Stays',
        'Indulge with peace-of-mind package structures providing transfers, unlimited gourmet, flights, and activities.',
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
        ALL_INCLUSIVE_DEALS,
        allInclusiveRef,
        'bg-purple-50 text-purple-600 border border-purple-100',
        'All Inclusive Deals'
      )}

      {/* 5. Beach Vacations */}
      {renderCarouselSection(
        'Beach Vacations',
        'Golden sands, private beachfront villas, surfing instructions, and incredible sunset waters.',
        <Sun className="w-3.5 h-3.5 text-amber-600" />,
        BEACH_VACATIONS,
        beachRef,
        'bg-amber-50 text-amber-600 border border-amber-100',
        'Beach Vacations'
      )}

      {/* 7. GoRASA select */}
      {renderCarouselSection(
        'GoRASA Select Exclusives',
        'Handpicked, ultra-VIP heritage palace suites, Michelin eco-retreats, and butler-serviced packages.',
        <Award className="w-3.5 h-3.5 text-rose-600" />,
        GORASA_SELECT,
        gorasaSelectRef,
        'bg-rose-50 text-rose-600 border border-rose-100',
        'GoRASA Select'
      )}
    </div>
  );
};

export default CustomCarousels;
