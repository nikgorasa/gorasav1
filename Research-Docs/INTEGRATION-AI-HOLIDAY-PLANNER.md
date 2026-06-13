# Integration Guide: GoRASA AI Ecosystem

> **Status:** All Phases Complete
> **Last Updated:** June 12, 2026
> **Total Files:** 55+ new, 0 modified existing

---

## Table of Contents

1. [What Was Built](#1-what-was-built)
2. [Module Overview](#2-module-overview)
3. [File Inventory](#3-file-inventory)
4. [Integration Steps](#4-integration-steps)
5. [Configuration](#5-configuration)
6. [Testing Checklist](#6-testing-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. What Was Built

### Complete AI Ecosystem

| Module | Purpose | Status |
|--------|---------|--------|
| **AI Holiday Planner** | Conversational trip planning with itinerary generation | ✅ Complete |
| **Intent Classification** | Unified intent detection across all modules | ✅ Complete |
| **AI Providers** | Multi-provider support (Gemini, OpenAI, MiMo) | ✅ Complete |
| **Support System** | FAQ engine + smart routing + escalation | ✅ Complete |
| **Ticket Management** | Supabase-backed ticket CRUD + admin dashboard | ✅ Complete |
| **Unified Chat** | Single chat component for all modules | ✅ Complete |
| **Feature Flags** | Environment-based feature toggles | ✅ Complete |
| **Analytics** | Event tracking for all user actions | ✅ Complete |

---

## 2. Module Overview

### Module 1: AI Core (`lib/ai/`)

**Purpose:** AI provider abstraction, intent classification, holiday planning

| File | Purpose |
|------|---------|
| `client.ts` | Auto-selects AI provider based on env vars |
| `holidayPlanner.ts` | Rule-based planner (no API key needed) |
| `holidayPlannerAI.ts` | AI-powered planner (requires API key) |
| `providers/*.ts` | Gemini, OpenAI, MiMo implementations |
| `intent/*.ts` | Local + AI intent classifiers |
| `filters/*.ts` | Hotel/flight filter utilities |
| `i18n/translations.ts` | Hindi/English translations |
| `session/*.ts` | Session persistence (localStorage) |
| `unified/*.ts` | Unified intent system |

### Module 2: Support System (`lib/support/`)

**Purpose:** FAQ matching, smart routing, escalation

| File | Purpose |
|------|---------|
| `faqEngine.ts` | 12 FAQ rules with fuzzy matching |
| `intentRouter.ts` | Intent detection + escalation |
| `quickActions.ts` | Related page suggestions |
| `smartRouter.ts` | Main routing logic (FAQ → Intent → Default) |

### Module 3: Ticket Management (`lib/ticket/`)

**Purpose:** Supabase-backed ticket CRUD

| File | Purpose |
|------|---------|
| `types.ts` | Ticket, Note, Activity types |
| `ticketManager.ts` | Client-side (localStorage) |
| `serverManager.ts` | Server-side (Supabase) |

### Module 4: Components

| Component | Purpose |
|-----------|---------|
| `UnifiedChat.tsx` | Single chat for support/planner/general |
| `HolidayPlanner.tsx` | AI planner wrapper |
| `ChatInterface.tsx` | Reusable chat UI |
| `ItineraryPreview.tsx` | Sidebar with day cards |
| `DayCard.tsx` | Collapsible day card |
| `QuickReplies.tsx` | Pill buttons |
| `TypingIndicator.tsx` | Animated dots |
| `HandoffModal.tsx` | "Get Full Quote" form |
| `FilterPanel.tsx` | Hotel/flight filters |
| `IntentDemo.tsx` | Intent classifier demo |
| `SupportDemo.tsx` | Support system demo |
| `CreateTicketModal.tsx` | Ticket creation form |
| `TicketList.tsx` | Ticket list with filters |
| `TicketDetail.tsx` | Ticket detail + notes |
| `EscalationFlow.tsx` | Escalation → ticket/WhatsApp/call |
| `PlannerHandoff.tsx` | Support → Planner handoff |
| `FeatureFlag.tsx` | Conditional rendering |

### Module 5: Hooks

| Hook | Purpose |
|------|---------|
| `useIntentClassifier.ts` | Intent classification |
| `useFilters.ts` | Hotel/flight filters |
| `useLanguage.ts` | Hindi/English i18n |
| `useSupport.ts` | Support chat |

### Module 6: API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/holiday-plan` | Rule-based planner |
| `POST /api/ai/holiday-plan-ai` | AI-powered planner |
| `POST /api/ai/classify-intent` | Intent classification |
| `POST /api/support` | Support responses |
| `GET/POST /api/tickets` | List/Create tickets |
| `GET/PATCH /api/tickets/[id]` | Get/Update ticket |
| `GET/POST /api/tickets/[id]/notes` | List/Add notes |

### Module 7: Pages

| Page | Purpose |
|------|---------|
| `/planner` | AI Holiday Planner |
| `/admin/ai-leads` | Admin AI leads dashboard |
| `/admin/tickets` | Admin ticket dashboard |

### Module 8: Config & Analytics

| File | Purpose |
|------|---------|
| `lib/config/flags.ts` | Feature flags |
| `lib/analytics/events.ts` | Event tracking |

---

## 3. File Inventory

### New Files (55+)

```
gorasa-next/src/
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   ├── holidayPlanner.ts
│   │   ├── holidayPlannerAI.ts
│   │   ├── providers/ (5 files)
│   │   ├── intent/ (5 files)
│   │   ├── filters/ (3 files)
│   │   ├── i18n/ (1 file)
│   │   ├── session/ (3 files)
│   │   └── unified/ (3 files)
│   ├── support/ (6 files)
│   ├── ticket/ (3 files + serverManager.ts)
│   ├── config/flags.ts
│   └── analytics/events.ts
├── components/ (17 files)
├── hooks/ (4 files)
├── app/
│   ├── planner/page.tsx
│   ├── admin/ai-leads/page.tsx
│   ├── admin/tickets/page.tsx
│   └── api/ (7 endpoints)
└── supabase/migrations/20260612_tickets.sql
```

### Modified Files (0)

No existing files were changed.

---

## 4. Integration Steps

### Step 1: Verify Build

```bash
cd gorasa-next
npx tsc --noEmit
npm run build
```

### Step 2: Run Supabase Migration

```bash
# Apply ticket tables to Supabase
# Option 1: Supabase Dashboard → SQL Editor → Run migration
# Option 2: Supabase CLI
cd gorasa-next
npx supabase db push
```

### Step 3: Test Each Module

| Module | URL | Test |
|--------|-----|------|
| AI Planner | `/planner` | Chat, generate itinerary, handoff |
| Support | `/support` | FAQ matching, escalation |
| Tickets | `/admin/tickets` | Create, list, status change |
| Intent | IntentDemo component | Classify messages |

### Step 4: Configure Feature Flags

Add to `.env.local`:

```bash
# AI Features
NEXT_PUBLIC_AI_PLANNER_ENABLED=true
NEXT_PUBLIC_UNIFIED_CHAT_ENABLED=true
NEXT_PUBLIC_INTENT_CLASSIFICATION_ENABLED=true

# Support Features
NEXT_PUBLIC_SUPPORT_CHAT_ENABLED=true
NEXT_PUBLIC_TICKETS_ENABLED=true

# Other
NEXT_PUBLIC_FILTER_PANEL_ENABLED=true
NEXT_PUBLIC_MULTI_LANGUAGE_ENABLED=true
NEXT_PUBLIC_SESSION_PERSISTENCE_ENABLED=true
```

### Step 5: Configure AI Provider (Optional)

```bash
# Add one of:
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
MIMO_API_KEY=your_key
```

---

## 5. Configuration

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Supabase service role |
| `GEMINI_API_KEY` | No | — | Google Gemini API |
| `OPENAI_API_KEY` | No | — | OpenAI API |
| `MIMO_API_KEY` | No | — | XIAOMI MiMo API |
| `NEXT_PUBLIC_AI_PLANNER_ENABLED` | No | false | Enable AI planner |
| `NEXT_PUBLIC_SUPPORT_CHAT_ENABLED` | No | false | Enable support chat |
| `NEXT_PUBLIC_TICKETS_ENABLED` | No | false | Enable tickets |

### Feature Flags

| Flag | Controls |
|------|----------|
| `AI_PLANNER_ENABLED` | AI Holiday Planner at `/planner` |
| `SUPPORT_CHAT_ENABLED` | Support chat at `/support` |
| `TICKETS_ENABLED` | Ticket system |
| `UNIFIED_CHAT_ENABLED` | Unified chat component |
| `FILTER_PANEL_ENABLED` | Filter panels on search pages |
| `INTENT_CLASSIFICATION_ENABLED` | Intent classifier |
| `MULTI_LANGUAGE_ENABLED` | Hindi support |
| `SESSION_PERSISTENCE_ENABLED` | Session save/resume |

---

## 6. Testing Checklist

### AI Planner
- [ ] Greeting appears automatically
- [ ] Quick replies work
- [ ] Itinerary generates after 4 questions
- [ ] Day cards are collapsible
- [ ] "Get Full Quote" opens modal
- [ ] Handoff creates lead

### Support System
- [ ] FAQ matching works (baggage, cancellation, etc.)
- [ ] Intent detection routes correctly
- [ ] Escalation creates ticket
- [ ] Quick actions show relevant pages

### Ticket System
- [ ] Ticket creation works
- [ ] Tickets appear in admin dashboard
- [ ] Status changes save to Supabase
- [ ] Notes can be added
- [ ] Stats cards show correct counts

### Unified Chat
- [ ] Mode switching works (support/planner/general)
- [ ] Intent classification works
- [ ] Routing to pages works
- [ ] Escalation flow works

### Feature Flags
- [ ] Flags toggle features on/off
- [ ] Components respect flags

---

## 7. Troubleshooting

### Issue: Build fails with pricing-service error
**Cause:** Pre-existing issue in `promos/validate/route.ts`
**Solution:** Not related to this work. Can be ignored.

### Issue: Tickets not saving
**Cause:** Supabase migration not applied
**Solution:** Run migration in Supabase dashboard

### Issue: AI not responding
**Cause:** No API key configured
**Solution:** Add `GEMINI_API_KEY` or use rule-based mode

### Issue: Intent classification inaccurate
**Cause:** Using local classifier (keyword-based)
**Solution:** Add AI API key for LLM-powered classification

---

## Quick Reference

### Key Paths

| What | Path |
|------|------|
| AI Library | `gorasa-next/src/lib/ai/` |
| Support Library | `gorasa-next/src/lib/support/` |
| Ticket Library | `gorasa-next/src/lib/ticket/` |
| Components | `gorasa-next/src/components/` |
| Hooks | `gorasa-next/src/hooks/` |
| API Endpoints | `gorasa-next/src/app/api/` |
| Planner Page | `gorasa-next/src/app/planner/page.tsx` |
| Admin Dashboard | `gorasa-next/src/app/admin/tickets/page.tsx` |
| Migration | `gorasa-next/supabase/migrations/20260612_tickets.sql` |

### Quick Commands

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Dev server
npm run dev
```

---

*Integration guide for GoRASA AI Ecosystem*
*Last updated: June 12, 2026*
