---
name: GoRASA
description: Premium travel tech platform for Indian luxury travelers
colors:
  primary: "#C2410C"
  primary-light: "#F97316"
  primary-wash: "#FFF7ED"
  neutral-bg: "#F8FAFC"
  neutral-card: "#FFFFFF"
  neutral-border: "#E2E8F0"
  neutral-text-primary: "#0F172A"
  neutral-text-secondary: "#64748B"
  neutral-text-muted: "#94A3B8"
  success: "#059669"
  warning: "#D97706"
  error: "#DC2626"
  info: "#4F46E5"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1rem, 2vw, 1.125rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.1em"
    textTransform: "uppercase"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.neutral-text-primary}"
    textColor: "{colors.neutral-card}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "#1E293B"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-secondary}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  card-default:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.xl}"
    padding: "32px"
  input-text:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    borderColor: "{colors.neutral-border}"
---

# Design System: GoRASA

## 1. Overview

**Creative North Star: "The Saffron Compass"**

Warm Indian hospitality meets precise travel technology. The Saffron Compass points toward trusted journeys: every rate is verified, every booking has a PNR trail, and a human concierge is one tap away. The interface feels like a well-appointed travel desk — confident but not cold, luxurious but not fussy.

This system explicitly rejects the dense coupon-cluttered OTA aesthetic. No blinking discount badges, no "hurry only 2 left" panic, no closeout-sale visual noise. Spacing is generous. Type is intentional. The burnt saffron accent signals premium, not urgency.

**Key Characteristics:**
- Warm neutrals with a single burnt saffron accent
- Serif headings for editorial luxury, sans body for readability
- Flat surfaces that lift on interaction, never decorative shadows
- Generous whitespace that signals premium without emptiness
- Motion that explains transitions, never decorates

## 2. Colors

A single-accent palette built around burnt saffron against warm-leaning slate neutrals. The commitment is deliberate: one saturated color carries the brand weight so it actually means something when it appears.

### Primary

- **Burnt Saffron** (#C2410C / oklch(45% 0.16 40)): The brand anchor. Used for the logo, primary badges, and emphasis markers. Appears on roughly 5–15% of any screen — badges, tags, star ratings, the active nav state. Never used as a surface fill outside of small decorative moments.
- **Ember Orange** (#F97316 / oklch(64% 0.19 45)): Hover and interactive accent. The lighter, more energetic sibling of burnt saffron. Used for focus rings, hover states on ghost controls, the gradient hero text.
- **Saffron Wash** (#FFF7ED / oklch(98% 0.005 60)): The tinted whisper. Used for badge backgrounds, pill backgrounds, light fills behind icons. Never carries text by itself.

### Neutral

- **Cloud Slate** (#F8FAFC / oklch(97% 0.002 250)): Page background. The thinnest possible warm-leaning off-white.
- **White Card** (#FFFFFF): Card and modal surfaces. Pure white, as close as the system gets to #fff.
- **Ash Border** (#E2E8F0 / oklch(92% 0.004 250)): Dividers, borders, separators. Low enough contrast to recede, high enough to define edges.
- **Ink Primary** (#0F172A / oklch(15% 0.01 250)): Headings and primary text. Almost black, never pure #000.
- **Ink Secondary** (#64748B / oklch(55% 0.01 250)): Body text. Readable at 14px without fighting the background.
- **Ink Muted** (#94A3B8 / oklch(68% 0.01 250)): Placeholders, captions, metadata. The quietest voice.

### Semantic

- **Verified Green** (#059669): Booking confirmed, PNR issued, success states.
- **Alert Amber** (#D97706): Warnings, rate changes, expiring locks.
- **Error Red** (#DC2626): Form errors, cancellations, destructive actions.
- **Info Indigo** (#4F46E5): Vendor rate updates, informational banners.

### Named Rules

**The Saffron Rarity Rule.** Burnt saffron appears on no more than 15% of any screen. Its scarcity is what gives it weight. If a screen feels orange-heavy, too many elements are competing for the same signal.

## 3. Typography

**Display Font:** Playfair Display (700–900 weight), Georgia, serif
**Body Font:** Inter (300–800 weight), system-ui, sans-serif
**Label/Mono Font:** Outfit (850 weight), system-ui, sans-serif

**Character:** The pairing is editorial-meets-utility. Playfair Display brings the gravitas of a luxury travel magazine — it's the font of concierge letterhead and first-class menus. Inter is the working font: fast, legible, unpretentious. Together they say "this is both beautiful and functional."

### Hierarchy

- **Display** (800 weight, clamp(2rem, 5vw, 4.5rem), 1.0 line-height, -0.03em tracking): Hero headlines only. Not reusable for section titles. Not available in a smaller size.
- **Headline** (700 weight, clamp(1.5rem, 3vw, 2.25rem), 1.1 line-height, -0.02em tracking): Section headers, modal titles, card naming. The most common serif size.
- **Title** (700 weight, clamp(1rem, 2vw, 1.125rem), 1.3 line-height): Card subtitles, feature titles, emphasis within body text. Sans-serif, always.
- **Body** (400 weight, 0.875rem, 1.5 line-height): The workhorse. Every paragraph, description, label body. Max line length 65–75ch on desktop.
- **Label** (800 weight, 0.625rem, 1.0 line-height, 0.1em tracking, uppercase): Badges, pill tags, form labels, metadata. The Outfit weight gives it presence at a tiny size.

### Named Rules

**The Serif-Only-For-Heading Rule.** Playfair Display is reserved for hero copy and section headers. Never use it for body text, captions, buttons, or form labels. If it's longer than two lines, it belongs in Inter.

## 4. Elevation

Flat by default, lifted on interaction. Surfaces sit on the page with no shadow at rest. Shadows appear only as a response to state — card hover, button press, modal entrance. This keeps the interface calm and the interaction moments meaningful.

### Shadow Vocabulary

- **Card Hover** (`0 4px 12px rgba(0,0,0,0.06)`): The primary interaction shadow. Cards raise 2px on hover, revealing their tappability.
- **Modal Overlay** (`0 20px 60px rgba(0,0,0,0.12)`): The deepest shadow in the system. Reserved for modals and checkout overlays that need to feel spatially distinct.
- **Button Drop** (`0 4px 6px rgba(0,0,0,0.05)`): Subtle shadow under primary buttons. Adds physicality without depth competition.

### Named Rules

**The Flat-By-Default Rule.** Surfaces at rest have no shadow. Elevation is a response, not a permanent property. If a surface needs depth at rest, use a border instead.

## 5. Components

### Buttons

- **Shape:** Gently curved edges (12px radius).
- **Primary:** Slate-900 background, white text, 12px/20px padding. Hover shifts to slate-800, lifts 1px with a subtle shadow.
- **Ghost:** Transparent background, slate-500 text. Hover shifts text to orange-600, no shadow. Used for secondary actions and tab-like controls.
- **Disabled:** Slate-200 background, slate-400 text, cursor not-allowed. No hover state.

### Cards / Containers

- **Corner Style:** Generous curve (24px radius) for hero cards, standard curve (16px radius) for utility cards.
- **Background:** White (#FFFFFF) with a 1px slate-200 border.
- **Shadow Strategy:** None at rest. Card Hover shadow (0 4px 12px rgba(0,0,0,0.06)) + 2px upward translate on hover.
- **Internal Padding:** 32px for hero cards, 20–24px for utility cards. Never less than 16px.

### Inputs / Fields

- **Style:** Slate-50 background, 1px slate-200 border, 12px radius.
- **Focus:** 2px burnt saffron ring, border becomes transparent. The glow is the only focus indicator — no shadow, no background shift.
- **Label:** Outfit 10px uppercase, slate-400. Always present outside the input (never placeholder-only).
- **Error:** Red-600 border, 2px ring on focus, error message below in red-600 at 10px.

### Navigation (Top Navbar)

- **Style:** Fixed top, white with 80% backdrop-blur, 1px slate-200 bottom border.
- **Typography:** Inter 14px, medium weight. Active state uses burnt saffron text with 700 weight.
- **Hover:** Text shifts to orange-600, subtle scale on the button (1.05).
- **Mobile:** Hidden by default. Scroll-based or breakpoint-triggered.

### Badges / Pills

- **Style:** Saffron Wash background (FFF7ED), Burnt Saffron text, full radius, 10px Outfit uppercase.
- **Usage:** Section labels, category tags, status markers. Never used for numeric counts or notifications.

## 6. Do's and Don'ts

### Do:

- **Do** let whitespace carry the luxury signal. If a section feels cramped, double the padding before adding anything.
- **Do** use burnt saffron sparingly — one badge per section, one active nav item, one primary accent per view.
- **Do** show system state clearly: verified rate locks, PNR numbers, processing status text. Trust through transparency.
- **Do** keep card content inside the border-radius. No overflow-hidden surprises.
- **Do** use the WhatsApp concierge as a release valve. Every complex workflow offers a "talk to a human" escape.

### Don't:

- **Don't** use gradient text (background-clip: text). Emphasis comes from weight and size, not color gradients.
- **Don't** use side-stripe borders (border-left greater than 1px as an accent). Use full borders, background tints, or nothing.
- **Don't** build hero sections with the big-number-small-label SaaS template. Tell a story instead.
- **Don't** show identical card grids (same-sized cards with icon + heading + text, repeated endlessly). Vary the layout.
- **Don't** default to modals. Exhaust inline panels, progressive disclosure, and expandable sections first.
- **Don't** use emoji as structural icons. Every system icon must be an SVG from a consistent family (lucide-react).
- **Don't** use glassmorphism decoratively. The backdrop-blur on modals and the navbar is functional — it signals a layer above content. Don't extend it to cards or panels.
- **Don't** animate layout properties (width, height, top, left). Animate only transform and opacity with exponential ease-out curves.
