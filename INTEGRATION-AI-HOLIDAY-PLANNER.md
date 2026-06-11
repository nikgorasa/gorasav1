# Integration Guide: AI Holiday Planner

> **Status:** Ready for Integration
> **Built at:** `/planner` route (safe, non-destructive)
> **Target:** `/holidays` route (replace existing form)

---

## What Was Built

A complete AI-powered holiday planning assistant at `/planner` that replaces the static inquiry form with:

- **Conversational chat interface** — AI asks questions, user responds
- **Instant itinerary generation** — Day-by-day plan with activities, hotels, costs
- **Interactive refinement** — Modify itinerary via natural language
- **Handoff to human expert** — Full context transfer to sales team
- **Mobile responsive** — Chat/itinerary toggle on small screens

---

## Files to Integrate

### New Files (15)

| Source | Destination |
|--------|-------------|
| `gorasa-next/src/app/planner/page.tsx` | `gorasa-next/src/app/holidays/page.tsx` |
| `gorasa-next/src/components/HolidayPlanner.tsx` | (keep in place) |
| `gorasa-next/src/components/ChatInterface.tsx` | (keep in place) |
| `gorasa-next/src/components/ItineraryPreview.tsx` | (keep in place) |
| `gorasa-next/src/components/DayCard.tsx` | (keep in place) |
| `gorasa-next/src/components/QuickReplies.tsx` | (keep in place) |
| `gorasa-next/src/components/TypingIndicator.tsx` | (keep in place) |
| `gorasa-next/src/components/HandoffModal.tsx` | (keep in place) |
| `gorasa-next/src/lib/ai/holidayPlanner.ts` | Rule-based planner (no API key needed) |
| `gorasa-next/src/lib/ai/holidayPlannerAI.ts` | AI-powered planner (requires API key) |
| `gorasa-next/src/lib/ai/client.ts` | AI provider client |
| `gorasa-next/src/lib/ai/providers/types.ts` | Provider type definitions |
| `gorasa-next/src/lib/ai/providers/gemini.ts` | Google Gemini provider |
| `gorasa-next/src/lib/ai/providers/openai.ts` | OpenAI provider |
| `gorasa-next/src/lib/ai/providers/mimo.ts` | XIAOMI MiMo provider |
| `gorasa-next/src/lib/ai/providers/index.ts` | Provider exports |
| `gorasa-next/src/app/api/ai/holiday-plan/route.ts` | Rule-based API endpoint |
| `gorasa-next/src/app/api/ai/holiday-plan-ai/route.ts` | AI-powered API endpoint |

### Existing Files (0 modified)

No existing files were changed.

---

## Integration Steps

### Step 1: Verify Build

```bash
cd gorasa-next
npx tsc --noEmit
npm run build
```

Both should pass with no errors.

### Step 2: Test at /planner

```bash
cd gorasa-next
npm run dev
```

Visit `http://localhost:5173/planner` and verify:

1. [ ] AI greeting appears automatically
2. [ ] Quick reply buttons work (clicking sends message)
3. [ ] Typing indicator shows while AI responds
4. [ ] After 4 questions, itinerary generates
5. [ ] Itinerary appears in right sidebar (desktop)
6. [ ] Day cards are collapsible
7. [ ] "Get Full Quote" button opens modal
8. [ ] Modal form submits successfully
9. [ ] Mobile view toggles between chat and itinerary
10. [ ] Existing `/holidays` page still works

### Step 3: Integrate to /holidays

When ready to go live:

```bash
# Copy planner page to holidays
cp gorasa-next/src/app/planner/page.tsx gorasa-next/src/app/holidays/page.tsx

# Remove planner route
rm -rf gorasa-next/src/app/planner/

# Rebuild
cd gorasa-next
npm run build
```

### Step 4: Verify Production

1. [ ] `/holidays` loads with AI planner
2. [ ] All 10 test cases pass
3. [ ] No console errors
4. [ ] Mobile responsive works

---

## AI Provider Configuration

### Supported Providers

| Provider | Environment Variable | Model (Default) |
|----------|---------------------|-----------------|
| Google Gemini | `GEMINI_API_KEY` | `gemini-2.0-flash` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` |
| XIAOMI MiMo | `MIMO_API_KEY` | `MiMo-7B-RL` |

### Setup Steps

1. **Get an API key** from one of the providers above

2. **Add to `.env.local`** in `gorasa-next/`:
   ```bash
   # Option 1: Google Gemini (recommended - free tier available)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Option 2: OpenAI
   OPENAI_API_KEY=your_openai_api_key_here

   # Option 3: XIAOMI MiMo
   MIMO_API_KEY=your_mimo_api_key_here
   ```

3. **Optional: Override default models**
   ```bash
   GEMINI_MODEL=gemini-1.5-pro
   OPENAI_MODEL=gpt-4o
   MIMO_MODEL=MiMo-7B-RL
   ```

4. **Switch HolidayPlanner to use AI**

   Edit `gorasa-next/src/components/HolidayPlanner.tsx`:
   ```typescript
   // Change this line:
   import { generateHolidayResponse } from "@/lib/ai/holidayPlanner";

   // To this:
   import { generateHolidayResponse } from "@/lib/ai/holidayPlannerAI";
   ```

   Edit `gorasa-next/src/app/api/ai/holiday-plan/route.ts`:
   ```typescript
   // Change this line:
   import { generateHolidayResponse } from "@/lib/ai/holidayPlanner";

   // To this:
   import { generateHolidayResponse } from "@/lib/ai/holidayPlannerAI";
   ```

5. **Restart dev server**
   ```bash
   cd gorasa-next
   npm run dev
   ```

### How It Works

The AI module (`client.ts`) automatically selects the provider based on which API key is set:

```
GEMINI_API_KEY set?  → Use Gemini
OPENAI_API_KEY set?  → Use OpenAI
MIMO_API_KEY set?    → Use MiMo
None set?            → Throw error
```

### Fallback Behavior

If the AI API fails (network error, rate limit, etc.), the system automatically falls back to the rule-based planner. No user-facing errors.

### Cost Estimates

| Provider | Free Tier | Paid (per 1M tokens) |
|----------|-----------|---------------------|
| Gemini | 60 RPM, 1M tokens/day | $0.075 input / $0.30 output |
| OpenAI | None | $0.15 input / $0.60 output (gpt-4o-mini) |
| MiMo | Check provider | Check provider |

---

## Architecture Notes

### AI Logic

The system supports two modes:

**Rule-Based (Default):** No API key required. Uses conversation state to determine what question to ask next:

| User Messages | State | AI Action |
|---------------|-------|-----------|
| 0 | GREETING | Ask destination |
| 1 | CLARIFYING | Ask duration |
| 2 | CLARIFYING | Ask travelers |
| 3 | CLARIFYING | Ask budget |
| 4 | GENERATING | Generate itinerary |
| 5+ | REFINING | Modify based on feedback |

### Itinerary Generation

Itineraries are generated based on:
- **Destination** — Matches against known destinations (Goa, Kerala, Maldives, etc.)
- **Duration** — Creates day-by-day plan (1-10 days)
- **Budget** — Adjusts hotel tier and activities (Budget/Comfortable/Luxury)
- **Special requests** — Romantic, adventure, family, etc.

### Handoff Flow

When user clicks "Get Full Quote":
1. Modal opens with name/email/phone form
2. Form pre-fills for logged-in users
3. On submit, creates lead via `POST /api/leads`
4. Lead includes: full conversation + itinerary + user preferences
5. Success message shows expert name + 4-hour timeframe

---

## Customization Points

### Change AI Responses

Edit `gorasa-next/src/lib/ai/holidayPlanner.ts`:
- `generateHolidayResponse()` — Main logic function
- `DESTINATIONS` — Add/modify destination data
- `generateItinerary()` — Customize itinerary templates

### Change Quick Replies

Edit `quickReplies` arrays in `generateHolidayResponse()`:
- Greeting: `["Goa", "Kerala", ...]`
- Duration: `["3 days", "5 days", ...]`
- Budget: `["Budget-friendly", "Luxury", ...]`

### Change UI Styling

All components use Tailwind CSS with brand colors:
- `orange-500` — Primary brand color
- `orange-600` — Hover states
- `slate-900` — Dark backgrounds
- `slate-50` — Light backgrounds

### Connect to Real AI (Gemini/OpenAI)

Replace rule-based logic in `holidayPlanner.ts`:

```typescript
// Instead of rule-based, call Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateHolidayResponse(messages: Message[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(buildPrompt(messages));
  return parseAIResponse(result.response.text());
}
```

---

## Dependencies

No new dependencies required. Uses existing stack:
- Next.js 16 + React 19
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide React icons
- Supabase (for leads API)

---

## Rollback

If issues arise after integration:

```bash
# Restore original holidays page from git
git checkout gorasa-next/src/app/holidays/page.tsx

# Rebuild
cd gorasa-next
npm run build
```

---

*Integration guide for AI Holiday Planner*
*Last updated: June 12, 2026*
