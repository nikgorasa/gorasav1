import { SearchParams, TripSuggestion, FlightSearchParams } from "../types";

const tripSuggestions: Record<string, TripSuggestion> = {
  default: {
    title: "Discover Your Perfect Escape",
    highlights: ["Local Cuisine", "Historic Landmarks", "Cultural Immersion", "Scenic Views"],
    vibe: "Elegant and adventurous",
    bestTime: "Late spring or early autumn"
  },
  goa: {
    title: "Goa - Where Sun Meets Serenity",
    highlights: ["Pristine Beaches & Water Sports", "Portuguese Heritage Architecture", "Sea Food & Beach Shacks", "Sunset Cruises"],
    vibe: "Relaxed tropical bliss with a touch of luxury",
    bestTime: "November to February"
  },
  manali: {
    title: "Manali - Himalayan Hideaway",
    highlights: ["Snow-Capped Mountain Views", "River Rafting & Trekking", "Solang Valley Adventures", "Hot Springs & Apple Orchards"],
    vibe: "Adventurous yet peaceful mountain escape",
    bestTime: "March to June"
  },
  jaipur: {
    title: "Jaipur - The Pink City Royalty",
    highlights: ["Amber Fort & City Palace", "Traditional Rajasthani Cuisine", "Heritage Haveli Stays", "Elephant Safari & Bazaars"],
    vibe: "Regal heritage meets vibrant culture",
    bestTime: "October to March"
  },
  delhi: {
    title: "Delhi - A Capital of Contrasts",
    highlights: ["Red Fort & Qutub Minar", "Street Food Tour", "Lodhi Art District", "Chandni Chowk Rickshaw Ride"],
    vibe: "Fast-paced urban exploration",
    bestTime: "October to March"
  },
  mumbai: {
    title: "Mumbai - The City That Never Sleeps",
    highlights: ["Marine Drive Sunset", "Street Food Extravaganza", "Bollywood Studio Tour", "Elephanta Caves"],
    vibe: "Cosmopolitan energy with coastal charm",
    bestTime: "November to February"
  },
  kerala: {
    title: "Kerala - God's Own Country",
    highlights: ["Houseboat Cruise on Backwaters", "Munnar Tea Plantations", "Kerala Ayurveda Spa", "Kathakali Performance"],
    vibe: "Tranquil wellness meets tropical beauty",
    bestTime: "September to March"
  },
  udaipur: {
    title: "Udaipur - The City of Lakes",
    highlights: ["Lake Pichola Boat Ride", "City Palace & Gardens", "Heritage Hotel Stay", "Sunset at Sajjangarh Fort"],
    vibe: "Romantic royal elegance",
    bestTime: "October to March"
  },
  maldives: {
    title: "Maldives - Overwater Paradise",
    highlights: ["Overwater Villa Stay", "Snorkeling with Manta Rays", "Underwater Dining", "Private Sandbank Picnic"],
    vibe: "Ultimate luxury island escape",
    bestTime: "December to April"
  }
};

export async function getTravelSuggestions(params: SearchParams): Promise<TripSuggestion> {
  const location = params.location.toLowerCase().trim();
  
  const suggestions: TripSuggestion = tripSuggestions[location] || tripSuggestions.default;
  
  if (suggestions === tripSuggestions.default) {
    const matchedKey = Object.keys(tripSuggestions).find(key => 
      location.includes(key) || key.includes(location)
    );
    if (matchedKey) {
      return {
        ...tripSuggestions[matchedKey],
        title: tripSuggestions[matchedKey].title + ` - ${params.adults + params.children + params.infants} Travelers`
      };
    }
    return {
      ...tripSuggestions.default,
      title: `Exploring ${params.location}`,
      highlights: tripSuggestions.default.highlights,
    };
  }
  
  return {
    ...suggestions,
    title: suggestions.title + ` - ${params.adults + params.children + params.infants} Travelers`
  };
}

export async function parseFlightQuery(query: string): Promise<Partial<FlightSearchParams>> {
  const today = new Date().toISOString().split('T')[0];
  const lower = query.toLowerCase();
  
  let origin = 'Mumbai';
  let location = 'Delhi';
  let tripType: 'one-way' | 'return' = 'one-way';
  let adults = 1;
  let children = 0;
  let infants = 0;
  
  const cities = ['mumbai', 'delhi', 'bangalore', 'goa', 'chennai', 'kolkata', 'hyderabad', 'jaipur', 'pune', 'ahmedabad', 'kochi'];
  
  const foundOrigins = cities.filter(c => lower.includes(`from ${c}`) || lower.startsWith(c));
  if (foundOrigins.length > 0) origin = foundOrigins[0].charAt(0).toUpperCase() + foundOrigins[0].slice(1);
  
  const foundDests = cities.filter(c => lower.includes(`to ${c}`) || lower.includes(`for ${c}`));
  if (foundDests.length > 0) location = foundDests[0].charAt(0).toUpperCase() + foundDests[0].slice(1);
  
  if (lower.includes('return') || lower.includes('round trip') || lower.includes('both ways')) {
    tripType = 'return';
  }
  
  if (lower.includes('2 adults') || lower.includes('two adults')) adults = 2;
  if (lower.includes('3 adults') || lower.includes('three adults')) adults = 3;
  if (lower.includes('4 adults') || lower.includes('four adults')) adults = 4;
  if (lower.includes(' with ')) adults = 2;
  
  return { origin, location, startDate: today, endDate: '', adults, children, infants, tripType, childrenAges: [] };
}

export async function getSupportChatResponse(userMessage: string, contextString: string): Promise<string> {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes('baggage') || lower.includes('luggage') || lower.includes('check-in') || lower.includes('checkin')) {
    return `Here are the baggage guidelines for your GoRASA booking:\n\n• **Indigo Lite**: 15kg check-in + 7kg cabin\n• **Indigo Standard/Flexi**: 20kg check-in + 7kg cabin\n• **Air India Economy**: 25kg check-in + 7kg cabin\n• **Air India Business**: 35kg check-in + 10kg cabin\n\nExcess baggage can be pre-booked at a discounted rate through your My Trips dashboard.`;
  }
  
  if (lower.includes('loyalty') || lower.includes('points') || lower.includes('reward')) {
    return `Your GoRASA Loyalty Program:\n\n• **Silver Tier**: 1x points on all bookings\n• **Gold Tier**: 1.5x points + lounge access promotions\n• **Platinum Tier**: 2x points + complimentary premium meals\n\nPoints can be redeemed for seat upgrades, lounge passes, and hotel room upgrades. Visit your Profile & Loyalty section to see available rewards.`;
  }
  
  if (lower.includes('cancel') || lower.includes('refund')) {
    return `GoRASA Cancellation Policy:\n\n• **Flights**: Free cancellation within 24 hours of booking. After that, standard airline cancellation fees apply.\n• **Hotels**: Free cancellation up to 48 hours before check-in.\n• **Packages**: Cancellation terms vary by package - check your booking details in My Trips.\n\nCancelled bookings are processed instantly with refunds credited back to your original payment method within 5-7 business days.`;
  }
  
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('wallet')) {
    return `GoRASA accepts the following payment methods:\n\n• **UPI** (Google Pay, PhonePe, Paytm)\n• **Credit/Debit Cards** (Visa, Mastercard, RuPay)\n• **Corporate Wallet** (for registered corporate accounts)\n• **Razorpay** (secure third-party gateway)\n\nCorporate wallet users get priority booking and instant checkout without entering card details each time.`;
  }
  
  if (lower.includes('seat') || lower.includes('upgrade') || lower.includes('meal')) {
    return `You can manage your booking extras through the My Trips section:\n\n• **Seat Selection**: Choose window/aisle seats for ₹200-500\n• **Meal Upgrades**: Pre-book special meals (veg, Jain, child) starting ₹350\n• **Class Upgrade**: Upgrade from Economy to Business on Air India flights\n\nSimply go to Reservation Desk → Select your booking → Modify Seats/Extras.`;
  }
  
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey') || lower.includes('namaste')) {
    return `Namaste! Welcome to GoRASA Travel Concierge. How can I assist you today? You can ask me about:\n\n• Baggage allowances and check-in limits\n• Loyalty points and reward redemptions\n• Booking cancellations and refunds\n• Seat upgrades and meal preferences\n• Payment methods and corporate wallets\n\nHow may I help you with your travel plans?`;
  }
  
  if (lower.includes('contact') || lower.includes('support') || lower.includes('human') || lower.includes('agent')) {
    return `Need to speak with a human? Here's how to reach us:\n\n• **WhatsApp Business**: +91-XXXXXXXXXX (instant response)\n• **Email**: support@gorasa.com (24hr response time)\n• **AI Concierge**: I'm here 24/7 and can handle most requests instantly!\n\nOur corporate support desk operates Monday-Saturday, 9 AM - 9 PM IST.`;
  }

  return `Thank you for reaching out to the GoRASA Travel Concierge. I've noted your query regarding "${userMessage.substring(0, 50)}...".

Here's what I can help you with:
• **Booking Management** — View, modify, or cancel reservations
• **Flight Details** — Baggage, seat selection, meal preferences
• **Loyalty Program** — Points balance, tier benefits, reward redemption
• **Payment Support** — Wallet balance, payment methods, invoices
• **Travel Information** — Destination guides, package inclusions

Could you please be more specific so I can provide the exact assistance you need? Alternatively, you can visit the Reservation Desk to manage your bookings directly.`;
}
