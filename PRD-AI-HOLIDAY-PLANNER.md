# GoRASA — AI Holiday Planner: Feature Requirements

> **Feature:** AI-Powered Holiday Planner
> **Page:** `/holidays`
> **Version:** 1.0
> **Date:** June 12, 2026
> **Status:** Draft

---

## Problem

Current `/holidays` page is a static form:
- User fills Destination, Days, Travelers, Requests
- Clicks "Submit Inquiry"
- Sees "We'll reach out in 24 hours"
- Gets nothing instantly → drops off

**Result:** Low conversion, no engagement, poor lead quality.

---

## Solution

Replace the static form with an **AI Planning Assistant** — a conversational interface that:
1. Asks questions to understand the trip
2. Generates a day-by-day itinerary instantly
3. Lets users refine through conversation
4. Hands off to a human expert with full context

---

## Feature 1: AI Chat Interface

### What It Does
A chat widget where users talk to an AI travel planner. The AI asks clarifying questions and guides the user through trip planning.

### How It Works

**Opening Message (auto-sent on page load):**
> "Namaste! I'm your GoRASA travel planning assistant. Tell me — where would you love to go?"

**Quick Reply Buttons (appear below chat):**
- Phase 1 (empty chat): `[Goa]` `[Kerala]` `[Maldives]` `[Manali]` `[Rajasthan]` `[Surprise me]`
- Phase 2 (after destination): `[3 days]` `[5 days]` `[7 days]` `[10+ days]`
- Phase 3 (after duration): `[Solo]` `[Couple]` `[Family]` `[Group]`
- Phase 4 (after travelers): `[Budget-friendly]` `[Comfortable]` `[Luxury]` `[No limit]`

**Conversation Flow:**
1. User types or clicks a quick reply
2. AI responds with next question
3. Typing indicator shows while AI generates
4. After 3-4 questions, AI generates the itinerary

### Visual Design

| Element | Style |
|---------|-------|
| Container | White rounded card, 2/3 width on desktop, full on mobile |
| Height | 600px, scrollable message area |
| AI messages | White bubble, left-aligned, bot icon avatar |
| User messages | Orange (#F59E0B) bubble, right-aligned, user icon avatar |
| Typing indicator | 3 animated dots |
| Input bar | Text field + orange send button at bottom |
| Quick replies | Outlined pill buttons, orange on hover |

### Acceptance Criteria
- [ ] AI sends greeting automatically on page load
- [ ] Quick replies change based on conversation state
- [ ] Typing indicator shows while AI is generating
- [ ] Messages auto-scroll to bottom
- [ ] User can type free text OR click quick replies
- [ ] AI never goes off-topic (redirects to travel planning)
- [ ] Mobile: chat takes full width

---

## Feature 2: AI Itinerary Generation

### What It Does
After gathering inputs, AI generates a complete day-by-day itinerary with activities, hotels, and estimated costs.

### How It Works

**Trigger:** After AI has collected destination + days + travelers + budget (3-4 messages).

**AI Response Format:**
```
Great! Here's your 5-day Goa itinerary for 2 travelers:

📍 Day 1 — Arrival & North Goa
• 14:00 Airport pickup & hotel check-in
• 16:00 Anjuna Beach sunset walk
• 19:00 Dinner at Britto's, Baga Beach
🏨 Est. hotel: Taj Holiday Village (5★)
💰 Est. cost: ₹12,000

📍 Day 2 — Water Sports & Nightlife
• 09:00 Baga Beach water sports
• 14:00 Lunch at Gunpowder, Assagao
• 20:00 Tito's Lane nightlife
🏨 Same hotel
💰 Est. cost: ₹8,000

... (continues for all days)

💰 Total Estimated: ₹1,45,000 for 2 travelers
✅ Includes: Accommodation, Breakfast, Airport transfers
❌ Excludes: Flights, Lunch & Dinner, Activities

Want me to make any changes?
```

### Visual Design
Itinerary also appears in the right sidebar (desktop) as collapsible day cards:

| Element | Style |
|---------|-------|
| Container | White card, 1/3 width, sticky on scroll |
| Day cards | Collapsed by default, click to expand |
| Day number | Orange circle badge (Day 1, Day 2...) |
| Activities | Small text with time + description |
| Hotel | Hotel name + star rating |
| Cost | Per-day cost in muted text |
| Total | Bold orange, bottom of sidebar |
| CTA Button | "Get Full Quote" — orange, full-width |

### Acceptance Criteria
- [ ] Itinerary generates within 10 seconds
- [ ] Each day has 2-4 activities with times
- [ ] Each day shows estimated hotel and cost
- [ ] Total cost shown at bottom
- [ ] Inclusions/exclusions listed
- [ ] Day cards are collapsible in sidebar
- [ ] Itinerary appears in BOTH chat AND sidebar
- [ ] "Estimated" label on all costs (never exact)

---

## Feature 3: Interactive Refinement

### What It Does
Users modify the itinerary by typing natural language instructions. AI updates the plan in real-time.

### How It Works

**User says:** "Make Day 3 more romantic"
**AI responds:** "I've updated Day 3 for your anniversary:
- Added: Sunset cruise on Mandovi River
- Changed: Spa → Couples spa package
- Added: Private candlelight dinner
- Updated cost: +₹8,000
Any other changes?"

**User says:** "Change hotel to something more luxury"
**AI responds:** "I've upgraded your hotels:
- Kochi: Trident (5★) instead of Brunton Boatyard
- Munnar: Spice Tree (5★ luxury resort)
- New total: ₹1,85,000 (was ₹1,45,000)
Worth it for the experience?"

### Common Modification Intents

| User Says | AI Does |
|-----------|---------|
| "Add more activities" | Adds 1-2 activities per day |
| "Remove the museum" | Removes museum from itinerary |
| "Make it cheaper" | Suggests budget alternatives |
| "Upgrade hotel" | Changes to higher-star hotels |
| "Add a spa day" | Inserts spa day, adjusts schedule |
| "More adventure" | Adds trekking, water sports, etc. |
| "Less hectic" | Reduces activities, adds rest time |
| "Start over" | Resets to clarification phase |

### Acceptance Criteria
- [ ] AI understands natural language modifications
- [ ] Itinerary updates visually in sidebar
- [ ] Cost updates reflect changes
- [ ] AI explains what changed and why
- [ ] User can modify any number of times
- [ ] "Start over" resets the conversation

---

## Feature 4: Handoff to Human Expert

### What It Does
When user is satisfied, they click "Get Full Quote" to transfer the conversation + itinerary to a human travel expert.

### How It Works

**User clicks:** "Get Full Quote" button

**Modal appears:**
```
┌─────────────────────────────────────┐
│  Get Your Personalized Quote        │
│                                      │
│  Our travel expert will finalize    │
│  your itinerary and provide exact   │
│  pricing within 4 hours.            │
│                                      │
│  Full Name: [___________]           │
│  Email: [___________]               │
│  Phone: [___________] (optional)    │
│                                      │
│  [Submit Inquiry]                   │
│                                      │
│  * Logged-in users: auto-filled     │
└─────────────────────────────────────┘
```

**After submit:**
```
┌─────────────────────────────────────┐
│  ✅ Expert Assigned!                │
│                                      │
│  Neha from our travel team will     │
│  contact you within 4 hours with    │
│  your personalized Goa itinerary.   │
│                                      │
│  [View My Inquiries]                │
└─────────────────────────────────────┘
```

### What Gets Transferred

| Data | Source |
|------|--------|
| Full conversation | Chat messages |
| Generated itinerary | AI output |
| User preferences | Extracted from conversation |
| Contact details | Modal form |
| Source tag | "AI Planner" |

### Acceptance Criteria
- [ ] "Get Full Quote" button visible only after itinerary generated
- [ ] Modal pre-fills for logged-in users
- [ ] Form validates name + email required
- [ ] Lead created in admin panel with full context
- [ ] Confirmation message shows expert name + timeframe
- [ ] User can view their inquiry status

---

## Feature 5: Save & Resume

### What It Does
Planning sessions are saved so users can return and continue where they left off.

### How It Works

| User Type | Storage | Duration |
|-----------|---------|----------|
| Guest | localStorage | 7 days |
| Logged-in | Database | Forever |

**On return:**
- Page detects saved session
- Shows banner: "Continue planning your Goa trip?"
- Clicking restores full conversation + itinerary

### Acceptance Criteria
- [ ] Session auto-saves after each message
- [ ] Guest sessions persist 7 days
- [ ] Logged-in sessions persist forever
- [ ] "Continue planning" banner shows on return
- [ ] Clicking banner restores full state
- [ ] User can clear/reset saved session

---

## Feature 6: Smart Suggestions

### What It Does
AI proactively suggests upgrades, experiences, and tips based on the itinerary.

### How It Works

**During planning, AI occasionally suggests:**
- "Since it's your anniversary, would you like me to add a couples spa?"
- "Goa in December can be crowded. Want me to suggest quieter alternatives?"
- "Most travelers to Kerala also visit Munnar. Add it to your trip?"

**Suggestions appear as:**
- Inline chat messages with quick reply buttons
- "[Yes, add it]" / "[No, thanks]" / "[Tell me more]"

### Acceptance Criteria
- [ ] Suggestions are contextually relevant
- [ ] Suggestions appear max 2-3 times per session
- [ ] User can dismiss with one click
- [ ] Suggestions don't interrupt flow
- [ ] No hard-sell language

---

## Page Layout

### Desktop (>1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR                                                     │
├─────────────────────────────────────────────────────────────┤
│  HEADER: "🌴 Plan Your Dream Holiday"                       │
│  SUBTITLE: "AI-powered itinerary planning — instant & free" │
├────────────────────────────────────┬────────────────────────┤
│                                    │                        │
│         CHAT INTERFACE             │    ITINERARY SIDEBAR   │
│         (col-span-2)               │    (col-span-1)        │
│                                    │                        │
│  Messages scroll area              │  Day cards (collapsible)│
│                                    │  Total cost            │
│  [Quick Replies]                   │  [Get Full Quote]      │
│  [Input + Send]                    │                        │
│                                    │                        │
├────────────────────────────────────┴────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (<1024px)

```
┌─────────────────────┐
│  NAVBAR             │
├─────────────────────┤
│  HEADER             │
├─────────────────────┤
│                     │
│  CHAT INTERFACE     │
│  (full width)       │
│                     │
│  Messages           │
│  Quick Replies      │
│  Input              │
│                     │
├─────────────────────┤
│  [View Itinerary]   │  ← Toggles to itinerary view
├─────────────────────┤
│  FOOTER             │
└─────────────────────┘
```

Mobile itinerary view (when "View Itinerary" tapped):
```
┌─────────────────────┐
│  ← Back to Chat     │
├─────────────────────┤
│  Day 1: Arrival     │
│  • Activity 1       │
│  • Activity 2       │
├─────────────────────┤
│  Day 2: ...         │
├─────────────────────┤
│  Total: ₹1,45,000   │
│  [Get Full Quote]   │
└─────────────────────┘
```

---

## UI Components

### 1. HolidayPlanner (main wrapper)
- Manages conversation state
- Renders ChatInterface + ItineraryPreview
- Handles mobile view toggle

### 2. ChatInterface
- Message list (scrollable)
- Typing indicator
- Quick replies (dynamic)
- Text input + send button

### 3. ItineraryPreview
- Day cards (collapsible)
- Cost summary
- CTA button

### 4. DayCard
- Day number badge
- Activity list with times
- Hotel info
- Day cost

### 5. QuickReplies
- Pill-shaped buttons
- Configurable labels
- Click handler

### 6. HandoffModal
- Form (name, email, phone)
- Confirmation state
- Pre-fill logic

---

## Content & Copy

### AI Personality
- Warm, professional, enthusiastic
- Use "Namaste" for greeting
- Emojis sparingly (✈️ 🏨 🍽️ 🎭)
- Concise: 2-4 sentences unless detailing itinerary
- Always end with a question or next step

### Labels & Buttons

| Element | Text |
|---------|------|
| Page title | Plan Your Dream Holiday |
| Subtitle | AI-powered itinerary planning — instant & free |
| AI greeting | "Namaste! I'm your GoRASA travel planning assistant. Where would you love to go?" |
| Typing indicator | "Planning your trip..." |
| Quick reply: destinations | Goa, Kerala, Maldives, Manali, Rajasthan, Surprise me |
| Quick reply: duration | 3 days, 5 days, 7 days, 10+ days |
| Quick reply: travelers | Solo, Couple, Family, Group |
| Quick reply: budget | Budget-friendly, Comfortable, Luxury, No limit |
| CTA button | Get Full Quote |
| Modal title | Get Your Personalized Quote |
| Modal subtitle | Our travel expert will finalize your itinerary and provide exact pricing within 4 hours. |
| Success message | Expert Assigned! |
| Success detail | [Name] from our travel team will contact you within 4 hours. |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User types unrelated topic | "I'd love to help with that! But first, let's plan your trip. Where would you go?" |
| User asks for specific hotel prices | "I can give estimates, but exact pricing depends on dates. Want me to generate the itinerary?" |
| User wants to book directly | "Great enthusiasm! Let me create your itinerary first, then connect you with our booking team." |
| User asks "who are you" | "I'm GoRASA's AI travel planner, built to help you design the perfect holiday!" |
| AI fails to generate | Show error: "Something went wrong. Let me try again." + retry button |
| User abandons mid-flow | Auto-save session. On return: "Continue planning your Goa trip?" |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time on page | ~30 seconds | 3-5 minutes |
| Messages per session | 0 | 6-10 |
| Inquiry completion | ~15% | 40% |
| Handoff to human | N/A | 25% of sessions |
| Lead quality (context) | Low (4 fields) | High (full itinerary) |

---

## Implementation Notes

### Existing Stack to Use
- Next.js 16 + React 19 (already in project)
- Tailwind CSS + Motion (already in project)
- Lucide React icons (already in project)
- Supabase for database (already configured)
- `geminiService.ts` to upgrade (existing, needs real API)

### New Files Needed
- `src/components/HolidayPlanner.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/ItineraryPreview.tsx`
- `src/components/DayCard.tsx`
- `src/components/QuickReplies.tsx`
- `src/components/HandoffModal.tsx`
- `src/lib/ai/holiday-planner.ts`
- `src/app/api/ai/holiday-plan/route.ts`
- `src/app/api/leads/ai-handoff/route.ts`

### Files to Modify
- `src/app/holidays/page.tsx` (rewrite)

---

*Feature spec for IDE agent implementation*
*Last updated: June 12, 2026*
