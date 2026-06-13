# GoRASA — Product Requirements Document

> **Version:** 2.0  
> **Date:** June 11, 2026  
> **Status:** Internal Beta  
> **Live URL:** https://gorasa-next.vercel.app  
> **Repository:** github.com/Gorasa-In-2026/gorasav1

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Users](#3-target-users)
4. [Core Features](#4-core-features)
5. [AI-Enabled Features Roadmap](#5-ai-enabled-features-roadmap)
6. [Technical Architecture](#6-technical-architecture)
7. [API Integrations](#7-api-integrations)
8. [Database Schema](#8-database-schema)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Admin Panel](#10-admin-panel)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Future Enhancements](#13-future-enhancements)
14. [Success Metrics](#14-success-metrics)

---

## 1. Executive Summary

GoRASA is a luxury travel discovery platform designed for Indian travelers. It provides a comprehensive solution for searching flights, browsing luxury hotels, exploring holiday packages, managing bookings, and tracking loyalty rewards — all in one place.

Think of it as a personal travel concierge in your browser.

---

## 2. Product Vision

**Mission:** Empower Indian travelers with a premium, AI-assisted travel booking experience that combines real-time pricing, personalized recommendations, and seamless booking management.

**Key Differentiators:**
- Real-time flight and hotel pricing via TBO (Travel Boutiques Online) API integration
- AI-powered concierge chat support
- Loyalty rewards program with points redemption
- Corporate B2B travel management with wallet system
- WhatsApp-style communication for bookings and support

---

## 3. Target Users

### Primary User Personas

| Persona | Role | Description |
|---------|------|-------------|
| **Premium Traveler** | CUSTOMER | Individual seeking luxury travel experiences with personalized service |
| **Corporate Traveler** | CORPORATE_USER | Business traveler needing streamlined booking and expense management |
| **Travel Agent** | SALES | Professional managing customer inquiries and lead pipeline |
| **Platform Admin** | ADMIN/SUPER_ADMIN | Operations team managing packages, users, and business analytics |

### Demo Users

| Email | Role | Access Level |
|-------|------|--------------|
| hmittal@gorasa.in | SUPER_ADMIN | Full system access |
| admin@gorasa.in | ADMIN | Admin panel + all features |
| sales@gorasa.in | SALES | Lead management + customer support |
| neha@corp.in | CORPORATE_USER | B2B travel + wallet management |
| amit@example.com | CUSTOMER | Browse, book, manage trips |
| priya@example.com | CUSTOMER | Browse, book, manage trips |

---

## 4. Core Features

### 4.1 Flight Search & Booking

**User Story:** As a traveler, I want to search for flights with flexible options so I can find the best deals for my trip.

**Requirements:**
- Origin/destination search with 1,000+ Indian cities (via TBO CityList API)
- Trip type toggle: One Way / Return
- Date picker for departure/return
- Passenger count selector (1-6 passengers)
- Real-time flight results with pricing
- Flight detail modal showing:
  - Airline and flight number
  - Departure/arrival times
  - Duration and stops
  - Fare class (Lite/Standard/Flexi/Economy/Business)
  - Price breakdown (Published Fare + 2% TDS)

**Technical Details:**
- API: TBO Flight API (`api.tektravels.com`)
- Auth: TokenId-based authentication
- Flow: Authenticate → Search → FareRule → FareQuote → Book → Ticket
- Mock fallback: Available when API credentials are unavailable

### 4.2 Hotel Search & Booking

**User Story:** As a traveler, I want to search for luxury hotels with real-time availability and pricing.

**Requirements:**
- Location search with Indian + international cities
- Brand filter tabs: All / Premium / Budget / Global
- Check-in/Check-out date pickers
- Guest count selector (1-6 guests)
- Hotel results grid with:
  - Hotel images
  - Star rating
  - Amenities
  - Price per night
  - "Book Now" functionality
- Hotel detail modal with full information

**Technical Details:**
- API: TBO Hotel REST API (`api.tbotechnology.in`)
- Auth: Basic Auth on every request
- Flow: Search → PreBook → Book
- Caching: City/hotel lists cached at module level

### 4.3 Holiday Packages

**User Story:** As a traveler, I want to browse curated holiday packages with detailed itineraries.

**Requirements:**
- Homepage carousels organized by category:
  - Top Deals
  - Weekend Getaways
  - International Packages
  - All-Inclusive
  - Beach Destinations
  - GoRASA Select
- Package cards showing:
  - Duration
  - Price (with original price strikethrough)
  - Rating
  - Provider
  - Inclusions list
- "Interested" button → Inquiry form → Lead creation
- Package detail view with full itinerary

**Technical Details:**
- Database: Package table in Supabase
- Rich text: Tiptap editor for itineraries
- Categories: Dynamic from PackageCategory table

### 4.4 Booking Management (My Trips)

**User Story:** As a user, I want to view and manage all my bookings in one place.

**Requirements:**
- Booking list with:
  - Type icons (Flight/Hotel/Package)
  - Status badges (Confirmed/Pending/Cancelled)
  - Date and price information
- Boarding pass modal (dark gradient ticket with QR code)
- Invoice modal (tax invoice with GST breakdown)
- WhatsApp delivery modal (chat UI with quick replies)
- Cancel booking flow with confirmation

**Technical Details:**
- API: `/api/bookings` with `x-user-email` header
- Storage: Supabase Booking table
- QR: Generated for boarding passes

### 4.5 User Profile

**User Story:** As a user, I want to manage my profile, preferences, and travel documents.

**Requirements:**
- 5-tab profile page:
  1. **Personal Info:** Name, email, role, loyalty points, passport
  2. **Saved Travellers:** Add/remove passenger profiles
  3. **Preferences:** Meal, seat, hotel, carrier, notifications
  4. **Loyalty & Referrals:** Points balance, wallet, referral code, birthday reward
  5. **Wishlist:** Saved destinations with images
- Auto-save on changes (debounced)
- Persistent storage in Supabase

**Technical Details:**
- API: `/api/profile` GET/PATCH
- Storage: JSONB columns for passengers, preferences, wishlist
- Auth: `x-user-email` header for identification

### 4.6 AI Support Desk (Current Implementation)

**User Story:** As a user, I want instant answers to my travel questions via an intelligent chat interface.

**Current Implementation (Keyword-Based):**
- Chat interface with message history and typing indicators
- Keyword-matching system queries FAQ categories from Supabase
- Quick reply buttons for common queries (flights, hotels, loyalty, corporate, contact)
- Voice narration (text-to-speech) with Hindi-English support
- WhatsApp support link and contact info sidebar
- Responsive design with animated transitions

**Technical Details:**
- File: `gorasa-next/src/app/support/page.tsx` (260 lines)
- Response Logic: `getAIResponse()` matches keywords → queries `/api/faq?keyword={matchedId}`
- Data: FAQ categories and site config fetched from Supabase on mount
- Limitations: No context awareness, no booking integration, no personalization

**Upgrade Path:** See [Section 5: AI-Enabled Features Roadmap](#5-ai-enabled-features-roadmap) for the complete plan to transform this into an intelligent, context-aware travel concierge.

---

## 5. AI-Enabled Features Roadmap

> **Vision:** Transform the keyword-based support desk into an intelligent, context-aware travel concierge that drives bookings, increases engagement, and reduces support costs.

### 5.1 Current State Assessment

| Aspect | Current | Target |
|--------|---------|--------|
| **Response Engine** | Keyword matching → FAQ lookup | LLM-powered with RAG |
| **Context** | None (stateless) | User bookings, preferences, history |
| **Personalization** | None | Destination recommendations, price alerts |
| **Proactivity** | None | Abandoned cart recovery, trip reminders |
| **Multi-language** | English only | Hindi, Tamil, Telugu, Bengali |
| **Voice** | TTS output only | Full voice input + output |
| **Booking Flow** | Manual search | AI-guided conversational booking |
| **Analytics** | None | Intent tracking, conversion attribution |
| **Human Handoff** | WhatsApp link | Seamless agent transfer with context |

### 5.2 Phase 1: LLM Integration (Week 1-2)

**Goal:** Replace keyword matching with intelligent, natural language responses.

#### 5.2.1 LLM Provider Selection

| Provider | Model | Cost (per 1M tokens) | Latency | Recommendation |
|----------|-------|---------------------|---------|----------------|
| OpenAI | GPT-4o-mini | $0.15 input / $0.60 output | ~1s | **Primary choice** — best cost/performance |
| OpenAI | GPT-4o | $2.50 input / $10.00 output | ~2s | Premium tier for complex queries |
| Anthropic | Claude 3.5 Sonnet | $3.00 input / $15.00 output | ~2s | Alternative option |
| Google | Gemini 1.5 Flash | $0.075 input / $0.30 output | ~1s | Budget option |

**Recommended:** GPT-4o-mini for standard queries, GPT-4o for booking assistance.

#### 5.2.2 System Prompt Design

```typescript
const SYSTEM_PROMPT = `You are GoRASA Concierge, a luxury travel assistant for Indian travelers.

CAPABILITIES:
- Search flights and hotels via TBO API
- Provide holiday package recommendations
- Answer questions about bookings, loyalty rewards, and corporate travel
- Assist with booking modifications and cancellations
- Provide destination guides and travel tips

CONTEXT:
- User: {userName} ({userRole})
- Loyalty Points: {loyaltyPoints}
- Recent Bookings: {recentBookings}
- Saved Preferences: {preferences}

RESPONSE GUIDELINES:
- Be concise and helpful (2-3 sentences max unless detailed info needed)
- Use Indian Rupees (₹) for all prices
- Include actionable next steps
- For complex requests, offer to connect with human agent
- Never fabricate flight/hotel prices — use real-time API data

TRAVEL DOMAIN KNOWLEDGE:
- Indian domestic airports: DEL, BOM, BLR, MAA, CCU, HYD, etc.
- Popular destinations: Goa, Kerala, Rajasthan, Ladakh, Maldives, Dubai
- Airlines: IndiGo (6E), Air India (AI), SpiceJet (SG), Vistara (UK)
- Hotel chains: Taj, Oberoi, ITC, Leela, Marriott, Hyatt`;
```

#### 5.2.3 RAG (Retrieval-Augmented Generation) Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query                                │
│            "What's the best time to visit Goa?"              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Query Processing Pipeline                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Intent Classification (LLM)                              │
│    → Intent: "destination_info"                              │
│    → Entity: "Goa"                                          │
│                                                              │
│ 2. Context Assembly                                         │
│    → User Profile (if logged in)                             │
│    → Recent Searches                                        │
│    → Active Bookings                                        │
│                                                              │
│ 3. Knowledge Retrieval                                      │
│    → FAQ Database (Supabase)                                 │
│    → Package Database (relevant packages)                    │
│    → Destination Guide (static + dynamic)                    │
│                                                              │
│ 4. Response Generation (LLM)                                │
│    → System Prompt + Context + Retrieved Info + User Query   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Response + Actions                              │
├─────────────────────────────────────────────────────────────┤
│ "Goa is best from November to February with pleasant        │
│  weather (20-32°C). Monsoons (June-September) offer         │
│  lush greenery but heavy rain."                             │
│                                                              │
│ [View Goa Packages] [Search Hotels in Goa] [Talk to Agent]  │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.4 Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/ai/llm-client.ts` | LLM API client (OpenAI/Anthropic) |
| `src/lib/ai/system-prompts.ts` | System prompts for different intents |
| `src/lib/ai/rag-pipeline.ts` | Query processing + context assembly |
| `src/lib/ai/intent-classifier.ts` | Classify user intent from query |
| `src/app/api/ai/chat/route.ts` | Chat API endpoint |
| `src/app/api/ai/stream/route.ts` | Streaming response endpoint |

#### 5.2.5 Cost Projections

| Usage Level | Monthly Queries | Avg Tokens/Query | Monthly Cost |
|-------------|-----------------|------------------|--------------|
| Low (Beta) | 1,000 | 500 | ~$0.30 |
| Medium | 10,000 | 500 | ~$3.00 |
| High | 50,000 | 500 | ~$15.00 |
| Enterprise | 200,000 | 500 | ~$60.00 |

### 5.3 Phase 2: Context-Aware Responses (Week 3-4)

**Goal:** AI remembers user context and provides personalized assistance.

#### 5.3.1 User Context Assembly

```typescript
interface UserContext {
  // Identity
  userId: string;
  name: string;
  role: "CUSTOMER" | "CORPORATE_USER" | "SALES" | "ADMIN";
  
  // Travel History
  recentBookings: Booking[];
  upcomingTrips: Booking[];
  cancelledBookings: Booking[];
  
  // Preferences
  preferredDestinations: string[];
  preferredAirlines: string[];
  preferredHotels: string[];
  mealPreference: string;
  seatPreference: string;
  
  // Loyalty
  loyaltyPoints: number;
  walletBalance: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  
  // Session
  currentSearch: SearchContext | null;
  cartItems: CartItem[];
  wishlist: string[];
}

interface SearchContext {
  type: "flight" | "hotel" | "package";
  origin?: string;
  destination?: string;
  dates?: { checkIn: Date; checkOut: Date };
  passengers?: number;
}
```

#### 5.3.2 Context-Enhanced Prompts

```typescript
function buildContextPrompt(user: UserContext, query: string): string {
  const contextParts = [];
  
  if (user.recentBookings.length > 0) {
    contextParts.push(`Recent bookings: ${formatBookings(user.recentBookings)}`);
  }
  
  if (user.upcomingTrips.length > 0) {
    contextParts.push(`Upcoming trips: ${formatBookings(user.upcomingTrips)}`);
  }
  
  if (user.preferredDestinations.length > 0) {
    contextParts.push(`Preferred destinations: ${user.preferredDestinations.join(", ")}`);
  }
  
  if (user.loyaltyPoints > 0) {
    contextParts.push(`Loyalty points: ${user.loyaltyPoints.toLocaleString()}`);
  }
  
  return `
USER CONTEXT:
${contextParts.join("\n")}

USER QUERY: ${query}

Respond using the user's context to personalize your answer.`;
}
```

#### 5.3.3 Contextual Response Examples

| User Context | Query | Contextual Response |
|--------------|-------|---------------------|
| Has upcoming flight to Goa | "What's the weather like?" | "Your flight to Goa is on Dec 15! Expect sunny weather (25-32°C). Pack light cotton clothes and sunscreen." |
| 5,000 loyalty points | "Can I get a discount?" | "You have 5,000 loyalty points worth ₹500! You can redeem them during checkout. Shall I search for packages?" |
| Corporate user | "I need to book for my team" | "For corporate bookings, I can help with group rates. How many travelers? I'll check your corporate wallet balance." |
| Cancelled booking last week | "I want to rebook" | "I see your Goa trip was cancelled on Dec 3. Would you like me to search for similar packages with flexible cancellation?" |

### 5.4 Phase 3: Proactive Assistance (Week 5-6)

**Goal:** AI initiates helpful interactions based on user behavior.

#### 5.4.1 Proactive Triggers

| Trigger | Condition | AI Action |
|---------|-----------|-----------|
| **Abandoned Search** | User searched flights but didn't book within 10 min | "Found 3 flights DEL→GOI. Prices start ₹4,299. Want me to save these?" |
| **Price Drop Alert** | Saved destination price drops >10% | "Great news! Goa hotels are 15% cheaper this week. View deals?" |
| **Trip Reminder** | 3 days before departure | "Your Goa trip is in 3 days! Here's your checklist: boarding pass, hotel confirmation, packing list." |
| **Review Request** | 24 hours after trip completion | "How was your Kerala trip? Share your experience and earn 200 loyalty points!" |
| **Birthday Reward** | User's birthday month | "Happy birthday! 🎂 You've earned a 10% discount code. Claim it now?" |
| **Loyalty Milestone** | Points approaching next tier | "You're 500 points away from Gold tier! Earn double points on your next booking." |

#### 5.4.2 Notification System

```typescript
interface ProactiveNotification {
  id: string;
  type: "price_drop" | "trip_reminder" | "review_request" | "birthday" | "loyalty" | "abandoned";
  userId: string;
  channel: "chat" | "email" | "whatsapp" | "push";
  title: string;
  message: string;
  actionUrl?: string;
  expiresAt?: Date;
  metadata: Record<string, unknown>;
}
```

#### 5.4.3 Abandoned Cart Recovery Flow

```
User searches flights → Adds to cart → Leaves without booking
                    │
                    ▼ (10 min timeout)
┌─────────────────────────────────────────────────────────────┐
│         AI-initiated Chat Message                            │
│ "Hi! I noticed you were looking at Delhi → Goa flights.      │
│  The best fare (₹4,299) is still available. Want me to      │
│  hold it while you decide?"                                  │
├─────────────────────────────────────────────────────────────┤
│ [View Flights] [Hold for 30 min] [No thanks]                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼ (2 hours, no response)
┌─────────────────────────────────────────────────────────────┐
│         Email / WhatsApp Follow-up                           │
│ Subject: "Still thinking about your Goa trip?"              │
│ Body: Price comparison + limited-time offer                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Phase 4: Conversational Booking (Week 7-8)

**Goal:** Enable complete booking flow through chat conversation.

#### 5.5.1 Conversational Booking Flow

```
User: "I want to go to Goa next weekend for 2 people"

AI: "Great choice! Let me search for Goa options.
     
     🛫 Flights (Dec 13-15, 2 passengers):
     1. IndiGo 6E-204: DEL→GOI, ₹8,598 (Direct, 2h 15m)
     2. SpiceJet SG-815: DEL→GOI, ₹7,999 (Direct, 2h 20m)
     
     🏨 Hotels (Dec 13-15, 2 nights):
     1. Taj Holiday Village - ₹12,500/night (5★, Beach)
     2. The Leela Goa - ₹15,000/night (5★, Pool)
     
     Which would you like? Or should I show more options?"

User: "IndiGo flight and Taj hotel"

AI: "Perfect! Here's your package:
     
     ✈️ IndiGo 6E-204: DEL→GOI, Dec 13, 06:00-08:15
     🏨 Taj Holiday Village: Dec 13-15 (2 nights)
     
     💰 Total: ₹33,598
     🎁 You have 2,400 loyalty points (₹240 value)
     
     Shall I proceed with booking? I'll need passenger details."

User: "Yes, use my saved travelers"

AI: "I've loaded your saved travelers:
     1. Nikhil Mehra (Adult)
     2. Priya Mehra (Adult)
     
     Any special requests? (meal preference, seat selection, etc.)"

User: "Window seat for both, vegetarian meals"

AI: "Done! Here's your booking summary:
     
     ✈️ IndiGo 6E-204: DEL→GOI, Dec 13, 06:00-08:15
        Passengers: Nikhil, Priya | Seats: Window | Meals: Veg
     
     🏨 Taj Holiday Village: Dec 13-15
        Room: Deluxe Garden View | Check-in: 14:00
     
     💰 Total: ₹33,598
     🎁 Loyalty Points Applied: -₹240
     💳 Amount Due: ₹33,358
     
     [Confirm & Pay] [Modify] [Cancel]"
```

#### 5.5.2 Booking State Machine

```typescript
type BookingState = 
  | "idle"
  | "searching_flights"
  | "searching_hotels"
  | "searching_packages"
  | "selecting_flight"
  | "selecting_hotel"
  | "collecting_passengers"
  | "collecting_preferences"
  | "confirming_booking"
  | "processing_payment"
  | "booking_complete";

interface BookingSession {
  state: BookingState;
  userId: string;
  searchParams: SearchParams;
  selectedFlight?: FlightResult;
  selectedHotel?: HotelResult;
  passengers: Passenger[];
  preferences: BookingPreferences;
  totalAmount: number;
  loyaltyPointsUsed: number;
}
```

### 5.6 Phase 5: Multi-Language Support (Week 9-10)

**Goal:** Support Hindi, Tamil, Telugu, and Bengali for broader Indian market reach.

#### 5.6.1 Language Support Matrix

| Language | Script | Support Level | Priority |
|----------|--------|---------------|----------|
| English | Latin | Full | — |
| Hindi | Devanagari | Full | High |
| Tamil | Tamil | Partial | Medium |
| Telugu | Telugu | Partial | Medium |
| Bengali | Bengali | Partial | Low |
| Malayalam | Malayalam | Partial | Low |
| Marathi | Devanagari | Partial | Low |

#### 5.6.2 Implementation Approach

```typescript
interface LanguageConfig {
  code: string;          // "hi", "ta", "te", "bn"
  name: string;          // "हिन्दी", "தமிழ்", "తెలుగు", "বাংলা"
  systemPrompt: string;  // Translated system prompt
  fallbackResponses: Record<string, string>;  // Pre-translated FAQ
}

// LLM handles translation dynamically
const SYSTEM_PROMPT_HI = `आप GoRASA कॉन्सिएर्ज हैं, भारतीय यात्रियों के लिए एक विलासिता यात्रा सहायक।

क्षमताएं:
- TBO API के माध्यम से उड़ानें और होटल खोजें
- छुट्टियों के पैकेज की सिफारिशें प्रदान करें
- बुकिंग, वफादारी पुरस्कार और कॉर्पोरेट यात्रा के बारे में प्रश्नों के उत्तर दें

प्रतिक्रिया दिशानिर्देश:
- संक्षिप्त और सहायक रहें (2-3 वाक्य)
- सभी कीमतों के लिए भारतीय रुपये (₹) का उपयोग करें
- कार्यात्मक अगले चरण शामिल करें`;
```

#### 5.6.3 Language Detection & Switching

```typescript
async function detectLanguage(query: string): Promise<string> {
  // Use LLM for detection
  const response = await llm.classify({
    query,
    categories: ["en", "hi", "ta", "te", "bn", "ml", "mr"],
    prompt: "Detect the language of this query. Return only the language code."
  });
  return response.label;
}

// User can also explicitly switch
// "हिंदी में बात करो" → Switch to Hindi
// "Speak in Tamil" → Switch to Tamil
```

### 5.7 Phase 6: Voice Interface (Week 11-12)

**Goal:** Full voice input/output for hands-free travel assistance.

#### 5.7.1 Voice Features

| Feature | Implementation | Status |
|---------|----------------|--------|
| **Voice Input** | Web Speech API (SpeechRecognition) | Planned |
| **Voice Output** | Web Speech API (SpeechSynthesis) | Current (basic) |
| **Wake Word** | "Hey GoRASA" detection | Planned |
| **Voice Booking** | Complete booking via voice | Planned |
| **Multilingual TTS** | Hindi, Tamil, Telugu voices | Planned |

#### 5.7.2 Voice Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Voice Input                               │
│            "Hey GoRASA, find me flights to Goa"             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Speech-to-Text (Web Speech API)                 │
│            → "find me flights to goa"                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              NLU Pipeline (same as text)                     │
│            Intent: search_flight                             │
│            Destination: Goa                                  │
│            Passengers: 1 (default)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Text-to-Speech Output                           │
│            "I found 5 flights to Goa. The cheapest           │
│             is IndiGo at ₹4,299 departing at 6 AM.          │
│             Want me to show more details?"                   │
└─────────────────────────────────────────────────────────────┘
```

#### 5.7.3 Voice-Specific UX

- **Continuous Listening Mode:** Hold microphone button for hands-free conversation
- **Visual Feedback:** Animated waveform during listening
- **Confirmation Prompts:** "Did you say Goa? Say yes to confirm."
- **Error Recovery:** "I didn't catch that. Could you repeat?"
- **Offline Support:** Basic commands cached locally

### 5.8 Phase 7: Analytics & Insights (Week 13-14)

**Goal:** Track AI performance, user behavior, and conversion attribution.

#### 5.8.1 Analytics Events

| Event | Properties | Purpose |
|-------|------------|---------|
| `ai_chat_started` | userId, timestamp, source | Track chat initiation |
| `ai_message_sent` | query, intent, sentiment | Understand user needs |
| `ai_response_generated` | responseTime, tokens, model | Monitor AI performance |
| `ai_intent_classified` | intent, confidence, entities | Improve intent detection |
| `ai_action_triggered` | actionType, targetUrl, converted | Measure conversion |
| `ai_escalation_requested` | reason, previousMessages | Identify AI limitations |
| `ai_feedback_given` | rating, comment, messageId | Improve response quality |

#### 5.8.2 Dashboard Metrics

```typescript
interface AIAnalytics {
  // Usage
  totalConversations: number;
  averageMessagesPerConversation: number;
  peakHours: { hour: number; count: number }[];
  
  // Performance
  averageResponseTime: number;  // ms
  intentClassificationAccuracy: number;  // %
  userSatisfactionScore: number;  // 1-5
  
  // Conversion
  chatToBookingRate: number;  // %
  revenueFromChat: number;  // ₹
  averageOrderValue: number;  // ₹
  
  // Popular Intents
  topIntents: { intent: string; count: number; conversionRate: number }[];
  
  // Escalation
  escalationRate: number;  // %
  topEscalationReasons: string[];
}
```

#### 5.8.3 A/B Testing Framework

| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Response Style | Formal | Friendly | Satisfaction |
| Proactive Timing | 10 min | 30 min | Conversion |
| Quick Reply Count | 4 options | 6 options | Engagement |
| Voice vs Text | Voice enabled | Text only | Usage |
| Personalization | With context | Without context | Booking rate |

### 5.9 Phase 8: Agent Handoff & Hybrid Support (Week 15-16)

**Goal:** Seamless transfer to human agents with full context.

#### 5.9.1 Handoff Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Explicit Request** | User says "talk to human" | Immediate transfer |
| **Low Confidence** | AI confidence < 60% | Suggest transfer |
| **Complex Query** | Requires manual intervention | Queue for agent |
| **Negative Sentiment** | User frustrated/angry | Priority transfer |
| **Booking Issue** | Payment failure, modification | Connect to support |

#### 5.9.2 Handoff Context Package

```typescript
interface HandoffContext {
  // Conversation
  conversationId: string;
  messages: Message[];
  summary: string;  // AI-generated summary
  
  // User
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  role: string;
  
  // Intent
  primaryIntent: string;
  entities: Record<string, string>;
  
  // Sentiment
  sentiment: "positive" | "neutral" | "negative";
  frustrationLevel: number;  // 0-10
  
  // Actions Taken
  searchesPerformed: Search[];
  bookingsReferenced: Booking[];
  linksShared: string[];
}
```

#### 5.9.3 Agent Interface

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│ Incoming Chat Request                                        │
│                                                              │
│ User: Nikhil Mehra (nikhil@gorasa.in)                       │
│ Role: CUSTOMER | Loyalty: Gold (8,500 pts)                  │
│                                                              │
│ Intent: Booking modification request                         │
│ Sentiment: Neutral                                           │
│ AI Confidence: 45% (low - reason: complex date change)      │
│                                                              │
│ Conversation Summary:                                        │
│ "User wants to change Goa trip dates from Dec 13-15 to      │
│  Dec 20-22. AI unable to handle date modification for       │
│  confirmed booking."                                         │
│                                                              │
│ [Accept Chat] [Transfer to Specialist] [View Booking]       │
└─────────────────────────────────────────────────────────────┘
```

### 5.10 AI Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| LLM Integration | 🔴 High | 🟡 Medium | **P0** | Phase 1 |
| Context Awareness | 🔴 High | 🟡 Medium | **P0** | Phase 2 |
| Proactive Assistance | 🟡 Medium | 🟡 Medium | **P1** | Phase 3 |
| Conversational Booking | 🔴 High | 🔴 High | **P1** | Phase 4 |
| Multi-Language (Hindi) | 🟡 Medium | 🟢 Low | **P1** | Phase 5 |
| Voice Interface | 🟡 Medium | 🔴 High | **P2** | Phase 6 |
| Analytics Dashboard | 🟡 Medium | 🟡 Medium | **P2** | Phase 7 |
| Agent Handoff | 🟡 Medium | 🟡 Medium | **P2** | Phase 8 |

### 5.11 Technical Requirements

#### 5.11.1 New Dependencies

| Package | Purpose | Cost |
|---------|---------|------|
| `openai` | OpenAI API client | Free (pay per usage) |
| `@supabase/supabase-js` | Realtime subscriptions | Free tier available |
| `langchain` | LLM orchestration (optional) | Free |
| `zod` | Schema validation (existing) | Free |

#### 5.11.2 New Database Tables

| Table | Purpose |
|-------|---------|
| `AIConversation` | Chat session tracking |
| `AIMessage` | Individual messages with metadata |
| `AIIntent` | Classified intents with confidence |
| `AIAnalytics` | Aggregated analytics data |
| `AINotification` | Proactive notifications queue |
| `AIBookingSession` | Conversational booking state |

#### 5.11.3 New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/chat` | POST | Send message, get AI response |
| `/api/ai/stream` | POST | Streaming response (SSE) |
| `/api/ai/context` | GET | Get user context for chat |
| `/api/ai/sessions` | GET | List chat sessions |
| `/api/ai/analytics` | GET | Dashboard metrics |
| `/api/ai/feedback` | POST | User feedback on responses |
| `/api/ai/handoff` | POST | Request human agent |

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 16.2.7 | React framework with App Router |
| **UI** | React | 19.2.4 | Component library |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Animations** | Motion | 12.40.0 | Framer Motion successor |
| **Icons** | Lucide React | 1.17.0 | SVG icon library |
| **Database** | Supabase | — | PostgreSQL + Auth + Realtime |
| **ORM** | Prisma | 6.19.3 | Type-safe database access |
| **Search UI** | cmdk | 1.1.1 | Command palette component |
| **Rich Text** | Tiptap | 3.26.0 | WYSIWYG editor |
| **Deployment** | Vercel | — | Serverless deployment |

### 6.2 Project Structure

```
gorasa-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (fonts, metadata, AuthProvider)
│   ├── page.tsx           # Homepage (ISR with 5-min cache)
│   ├── login/page.tsx     # Login page
│   ├── flights/page.tsx   # Flight search
│   ├── hotels/page.tsx    # Hotel search
│   ├── holidays/page.tsx  # Holiday packages
│   ├── trips/page.tsx     # My bookings
│   ├── profile/page.tsx   # User profile
│   ├── support/page.tsx   # AI support chat
│   ├── admin/             # Admin panel
│   │   ├── layout.tsx     # Admin layout with sidebar
│   │   ├── page.tsx       # Dashboard
│   │   ├── leads/page.tsx # Lead CRM
│   │   ├── packages/page.tsx # Package CMS
│   │   ├── promos/page.tsx # Promo codes
│   │   ├── loyalty/page.tsx # Loyalty rewards
│   │   ├── b2b/page.tsx   # B2B wallet
│   │   └── users/page.tsx # User management
│   └── api/               # API routes (27+ endpoints)
├── components/            # React components
├── hooks/                 # Custom hooks (useAuth)
├── lib/                   # Utilities, TBO clients, Supabase
├── prisma/                # Database schema + seed
└── public/                # Static assets
```

### 6.3 Data Flow

```
User Browser
    ↓
Next.js App Router (SSR/CSR)
    ↓
API Routes (/api/*)
    ↓
Supabase Client (Service Role)
    ↓
PostgreSQL Database
```

---

## 7. API Integrations

### 7.1 TBO Flight API

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Authenticate | `api.tektravels.com/SharedData.svc/rest/Authenticate` | Get TokenId |
| Search | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search` | Flight search |
| FareRule | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule` | Fare rules |
| FareQuote | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote` | Price quote |
| Book | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book` | Non-LCC booking |
| Ticket | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket` | Generate ticket |
| GetBookingDetails | `api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails` | Booking status |

**Auth Flow:**
- TokenId: One per day (00:00–23:59 UTC)
- TraceId: Valid 15 minutes, returned by Search
- ClientId: `ApiIntegrationNew`

### 7.2 TBO Hotel REST API

| Endpoint | URL | Auth |
|----------|-----|------|
| Search | `api.tbotechnology.in/TBOHolidays_HotelAPI/Search` | Basic Auth |
| PreBook | `api.tbotechnology.in/TBOHolidays_HotelAPI/PreBook` | Basic Auth |
| Book | `api.tbotechnology.in/TBOHolidays_HotelAPI/Book` | Basic Auth |
| CountryList | `api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList` | Basic Auth |
| CityList | `api.tbotechnology.in/TBOHolidays_HotelAPI/CityList` | Basic Auth |
| TBOHotelCodeList | `api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList` | Basic Auth |

**Key Differences from Flight API:**
- Basic Auth on every request (no token caching)
- Different credentials than flight API
- Requires HotelCodes for search (city-based search returns error)

### 7.3 Authentication

| Provider | Method | Status |
|----------|--------|--------|
| Google OAuth | Supabase Auth | Ready (needs Google Cloud Console config) |
| Email/Password | Supabase Auth | Working |
| Demo Login | Direct DB lookup | Working (no password required) |

---

## 8. Database Schema

### 8.1 Core Tables (Prisma - 10 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| User | User accounts | id, email, name, role, loyaltyPoints, wallet |
| Company | B2B corporate accounts | id, name, walletBalance, discountRate |
| Lead | Sales pipeline | id, stage, contactEmail, travelers |
| Activity | Lead interactions | id, leadId, type, description |
| Package | Holiday packages | id, title, price, duration, itinerary |
| Booking | User bookings | id, userId, type, status, details |
| Payment | Transaction records | id, bookingId, amount, method |
| Invoice | Tax invoices | id, bookingId, gstNumber, total |
| CancellationRequest | Cancellation requests | id, bookingId, reason, status |
| PricingRule | Dynamic pricing | id, packageId, markup, validFrom |

### 8.2 Configuration Tables (Supabase - 27+ tables)

| Table | Purpose | Rows |
|-------|---------|------|
| City | Flight/hotel search | 35 (30 domestic + 5 international) |
| PackageCategory | Homepage carousels | 6 |
| ValueProposition | Homepage VPs | 4 |
| FaqCategory | Support quick replies | 6 |
| LeadStage | Pipeline stages | 7 |
| SiteConfig | Contact info, WhatsApp | 5 |
| QuickTopUpAmount | B2B wallet presets | 4 |
| NavigationItem | Navbar + admin nav | 14 |
| FooterLink | Footer sections | 8 |
| PreferenceOption | Profile dropdowns | 15 |
| Role | LoginModal roles | 5 |
| Testimonial | Customer reviews | 3 |
| Flight | Mock flight data | 11 |
| Faq | FAQ entries | Multiple |
| PromoCode | Discount codes | Multiple |
| LoyaltyReward | Rewards catalog | 6 |
| Redemption | Points history | Multiple |

---

## 9. Authentication & Authorization

### 9.1 User Roles

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| SUPER_ADMIN | Full | All CRUD, system settings, user management |
| ADMIN | High | Dashboard, leads, packages, users |
| SALES | Medium | Lead management, customer support |
| CORPORATE_USER | Medium | B2B travel, wallet management |
| CUSTOMER | Basic | Browse, book, manage trips, profile |

### 9.2 Auth Mechanisms

| Mechanism | Implementation | Use Case |
|-----------|----------------|----------|
| Supabase Auth | Google OAuth + Email/Password | Primary authentication |
| Demo Mode | Direct DB lookup (no password) | Prototype/testing |
| Service Role | `SUPABASE_SERVICE_ROLE_KEY` | Server-side API routes |
| x-user-email header | Custom header | Profile, bookings API |

### 9.3 Security Considerations

- **RLS (Row Level Security):** Enabled on 27+ Supabase tables
- **Service Role Bypass:** Server routes use service role key to bypass RLS
- **JWT Rotation:** Keys may rotate; verification script provided
- **No CI/CD:** Manual deployment (no automated security scanning)

---

## 10. Admin Panel

### 10.1 Dashboard

- Real KPIs: Users, Packages, Leads, Bookings, Revenue
- Role distribution breakdown
- Recent activity feed

### 10.2 Lead CRM

- Pipeline view: NEW → QUALIFIED → CONTACTED → MEETING → QUOTED → NEGOTIATION → WON
- Lead detail modal with traveler info
- Stage update via API
- Filters by stage

### 10.3 Package CMS

- Package list with search
- Create/Edit forms with Tiptap rich text editor
- Tag input for inclusions/exclusions/images
- Status toggle (DRAFT/PUBLISHED)
- Soft delete (isActive flag)

### 10.4 Promo Code CMS

- List active promos with toggle switches
- Create new promo with code, type, value, description
- Toggle active/inactive
- Stats: Total, Active, Inactive counts

### 10.5 Loyalty Rewards

- Rewards grid with icons and point costs
- Redeem functionality with points validation
- Points history (earned/redeemed)
- Available points display

### 10.6 B2B Registry

- Corporate accounts list
- Wallet balance per company
- Wallet top-up (quick amounts + custom)
- Corporate policy display

### 10.7 User Management

- User list with search
- Role change dropdown
- Active/inactive toggle
- Edit name and email
- Pagination for large lists

---

## 11. Deployment & Infrastructure

### 11.1 Current Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Next.js App | Vercel | https://gorasa-next.vercel.app |
| Database | Supabase | `isubgeemvhvhnhikxbjb.supabase.co` |
| Legacy Frontend | Netlify | (inactive) |
| Legacy Backend | Render | (inactive) |

### 11.2 Deployment Process

**Auto-deploy (preferred):**
```bash
git push neworigin main  # Triggers Vercel auto-deploy
```

**Manual deploy:**
```bash
cd gorasa-next
npx vercel --prod --yes
```

### 11.3 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB access | Yes |
| `DATABASE_URL` | Prisma pooled connection | Yes |
| `DIRECT_URL` | Prisma direct connection | Yes |
| `TBO_USERNAME` | Flight API login | Yes |
| `TBO_PASSWORD` | Flight API password | Yes |
| `TBO_HOTEL_USERNAME` | Hotel API login | Yes |
| `TBO_HOTEL_PASSWORD` | Hotel API password | Yes |

### 11.4 Build Configuration

```json
{
  "buildCommand": "npx prisma generate && npx next build",
  "rootDirectory": "gorasa-next"
}
```

---

## 12. Non-Functional Requirements

### 12.1 Performance

- **ISR (Incremental Static Regeneration):** Homepage cached for 5 minutes
- **API Response Time:** < 2 seconds for search queries
- **Image Optimization:** Next.js Image component with remote patterns
- **Caching:** Module-level caching for TBO static data

### 12.2 Scalability

- **Database:** Supabase PostgreSQL with connection pooling
- **Serverless:** Vercel serverless functions
- **Stateless:** No server-side session state

### 12.3 Reliability

- **Mock Fallback:** TBO API failures gracefully fall back to mock data
- **Error Handling:** Try-catch with user-friendly messages
- **Data Persistence:** All bookings, leads, profile data in Supabase

### 12.4 Security

- **RLS:** Row Level Security on all user-facing tables
- **Service Role:** Server-side only, never exposed to client
- **JWT:** Secure token-based authentication
- **Environment Variables:** All secrets in Vercel dashboard (not committed)

### 12.5 Accessibility

- **Semantic HTML:** Proper heading hierarchy, landmarks
- **Keyboard Navigation:** All interactive elements focusable
- **Color Contrast:** WCAG 2.1 AA compliance
- **Screen Reader:** ARIA labels on icons and interactive elements

---

## 13. Future Enhancements

### 13.1 High Priority

| Feature | Description | Dependencies |
|---------|-------------|--------------|
| Real Payment Flow | PhonePe integration for actual payments | PhonePe credentials |
| Production TBO Credentials | Replace test hotel credentials | TBO account activation |
| Google OAuth Setup | Complete Google Cloud Console configuration | Client ID/Secret |
| RLS Security Policies | Comprehensive RLS for all 27 tables | Security audit |

### 13.2 Medium Priority

| Feature | Description |
|---------|-------------|
| SSR for SEO | Server-side rendering for search engine optimization |
| WhatsApp Business API | Real WhatsApp notifications and support |
| Email Notifications | Booking confirmations, receipts, reminders |
| Multi-language Support | Hindi, Tamil, Telugu, etc. |
| Mobile App | React Native or Flutter companion app |

### 13.3 Low Priority

| Feature | Description |
|---------|-------------|
| Dynamic Pricing Engine | Real-time pricing based on demand |
| Multi-currency Support | INR, USD, EUR, GBP |
| Travel Insurance Integration | Partner with insurance providers |
| Loyalty Program Expansion | Partner rewards, tier system |
| AI Voice Booking | Complete voice-driven booking flow |
| AI Multi-Language | Hindi, Tamil, Telugu, Bengali support |

> **Note:** AI-powered features are detailed in [Section 5: AI-Enabled Features Roadmap](#5-ai-enabled-features-roadmap).

---

## 14. Success Metrics

### 14.1 User Engagement

| Metric | Target | Current |
|--------|--------|---------|
| Daily Active Users | 100+ | TBD |
| Session Duration | > 5 minutes | TBD |
| Pages per Session | > 3 | TBD |
| Return Rate | > 30% | TBD |

### 14.2 Conversion

| Metric | Target | Current |
|--------|--------|---------|
| Search to Booking | > 5% | TBD |
| Inquiry to Lead | > 20% | TBD |
| Lead to Customer | > 15% | TBD |

### 14.3 Technical

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 2s | ~1s (mock) |
| Uptime | 99.9% | TBD |
| Error Rate | < 1% | TBD |
| Build Success | 100% | 100% ✅ |

### 14.4 AI-Specific Metrics

| Metric | Target | Current | Phase |
|--------|--------|---------|-------|
| AI Response Accuracy | > 90% | N/A | Phase 1 |
| Intent Classification Accuracy | > 85% | N/A | Phase 1 |
| Average Response Time | < 2s | N/A | Phase 1 |
| User Satisfaction Score | > 4.0/5.0 | N/A | Phase 2 |
| Chat-to-Booking Conversion | > 5% | N/A | Phase 4 |
| AI Escalation Rate | < 15% | N/A | Phase 8 |
| Proactive Notification CTR | > 20% | N/A | Phase 3 |
| Multi-Language Usage | > 30% | N/A | Phase 5 |
| Voice Interface Adoption | > 15% | N/A | Phase 6 |

---

## Appendices

### A. Glossary

| Term | Definition |
|------|------------|
| TBO | Travel Boutiques Online — flight and hotel API provider |
| LCC | Low Cost Carrier (IndiGo, SpiceJet) |
| GDS | Global Distribution System (Air India, international) |
| TokenId | Daily authentication token for TBO Flight API |
| TraceId | 15-minute session token from Search response |
| ISR | Incremental Static Regeneration (Next.js caching) |
| RLS | Row Level Security (Supabase/PostgreSQL) |
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |

### B. API Endpoints Summary

**Authentication:**
- POST `/api/auth/login` — Find/create user
- GET `/api/auth/me` — Current user

**Core Features:**
- GET/POST `/api/bookings` — Booking CRUD
- GET/POST `/api/packages` — Package CRUD
- GET/POST `/api/leads` — Lead management
- POST `/api/tbo` — Flight search (TBO)
- POST `/api/tbo-hotels` — Hotel search (TBO)

**Configuration:**
- GET `/api/cities` — City dropdowns
- GET `/api/categories` — Package categories
- GET `/api/roles` — Role colors/labels
- GET `/api/site-config` — Site-wide config

**Admin:**
- GET `/api/dashboard` — KPI stats
- GET/POST `/api/promos` — Promo codes
- GET `/api/rewards` — Loyalty rewards
- GET/PATCH `/api/users` — User management

### C. Database Tables Reference

**Prisma Tables (10):**
User, Company, Lead, Activity, Package, PricingRule, Booking, Payment, Invoice, CancellationRequest

**Supabase Tables (27+):**
Testimonial, PackageCategory, ValueProposition, City, Flight, Faq, FaqCategory, FooterLink, NavigationItem, Role, SiteConfig, PromoCode, LoyaltyReward, Redemption, LeadStage, PreferenceOption, QuickTopUpAmount, and more.

---

*Document prepared by MiMo Code Agent*  
*Based on project inspection of rasa-zero-app-main*  
*Last updated: June 11, 2026*  
*Version 2.0 — Added AI-Enabled Features Roadmap (Section 5)*
