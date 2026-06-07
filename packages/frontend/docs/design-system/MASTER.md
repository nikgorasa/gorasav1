# GoRASA Design System

## Product Profile

- **Type:** Luxury Travel Tech / OTA (Online Travel Agency)
- **Audience:** Premium Indian travelers, corporate travel desks, B2B agents
- **Tone:** Opulent, Trustworthy, Warm, Modern
- **Platform:** Web (React 19 + Vite + Tailwind CSS)

---

## Brand Colors (Preserved)

### Primary Palette

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--color-brand-50` | `#FFF7ED` | `orange-50` | Light washes, badges, hover bg |
| `--color-brand-100` | `#FFEDD5` | `orange-100` | Subtle fills |
| `--color-brand-500` | `#F97316` | `orange-500` | Primary CTAs, accents |
| `--color-brand-600` | `#EA580C` | `orange-600` | Active states, hover |
| `--color-brand-700` | `#C2410C` | `orange-700` | Logo, strong emphasis |

### Neutral Palette

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--color-surface` | `#F8FAFC` | `slate-50` | Page background |
| `--color-card` | `#FFFFFF` | `white` | Cards, modals |
| `--color-border` | `#E2E8F0` | `slate-200` | Borders, dividers |
| `--color-text-primary` | `#0F172A` | `slate-900` | Headings |
| `--color-text-secondary` | `#64748B` | `slate-500` | Body text |
| `--color-text-muted` | `#94A3B8` | `slate-400` | Placeholder, captions |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#059669` | `emerald-600` |
| `--color-warning` | `#D97706` | `amber-600` |
| `--color-error` | `#DC2626` | `red-600` |
| `--color-info` | `#4F46E5` | `indigo-600` |

---

## Typography

### Font Stack

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Display / Heading** | `Playfair Display` | 700, 800, 900 | `Georgia, serif` |
| **Body / UI** | `Inter` | 300–800 | `system-ui, sans-serif` |
| **Mono / Data** | `ui-monospace` | 400, 700 | `SFMono-Regular, monospace` |

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `h1` | `3rem` (48px) | 800 | `1.0` | `-0.03em` |
| `h2` | `2.25rem` (36px) | 800 | `1.1` | `-0.02em` |
| `h3` | `1.5rem` (24px) | 700 | `1.2` | `-0.01em` |
| `h4` | `1.125rem` (18px) | 700 | `1.3` | `0` |
| `body` | `0.875rem` (14px) | 400 | `1.5` | `0` |
| `small` | `0.75rem` (12px) | 500 | `1.4` | `0` |
| `caption` | `0.625rem` (10px) | 700 | `1.3` | `0.05em` |
| `badge` | `0.625rem` (10px) | 800 | `1` | `0.1em` |

---

## Spacing Scale

| Token | Rem | px | Tailwind |
|-------|-----|----|----------|
| `--space-1` | `0.25rem` | 4 | `1` |
| `--space-2` | `0.5rem` | 8 | `2` |
| `--space-3` | `0.75rem` | 12 | `3` |
| `--space-4` | `1rem` | 16 | `4` |
| `--space-5` | `1.25rem` | 20 | `5` |
| `--space-6` | `1.5rem` | 24 | `6` |
| `--space-8` | `2rem` | 32 | `8` |
| `--space-10` | `2.5rem` | 40 | `10` |
| `--space-12` | `3rem` | 48 | `12` |
| `--space-16` | `4rem` | 64 | `16` |

---

## Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | `0` | Page content |
| Sticky | `10` | Sticky headers |
| Dropdown | `20` | Dropdown menus |
| Navbar | `50` | Fixed navbar |
| Overlay | `80` | Backdrop scrims |
| Modal | `100` | Modal dialogs |
| Checkout | `120` | Checkout overlay |
| Toast | `150` | Toast notifications |
| Tooltip | `200` | Tooltips |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.5rem` (8px) | Buttons, inputs |
| `--radius-md` | `0.75rem` (12px) | Cards |
| `--radius-lg` | `1rem` (16px) | Panels |
| `--radius-xl` | `1.5rem` (24px) | Modals, large surfaces |
| `--radius-full` | `9999px` | Badges, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04)` | Default cards |
| `--shadow-elevated` | `0 4px 12px rgba(0,0,0,0.06)` | Hovered cards |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.12)` | Modals |
| `--shadow-dropdown` | `0 8px 24px rgba(0,0,0,0.08)` | Dropdowns |

---

## Animation

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interaction | 150ms | `ease-out` |
| UI transition | 200–300ms | `cubic-bezier(0.25, 0.1, 0, 1)` |
| Modal entrance | 350ms | `cubic-bezier(0.25, 0.1, 0, 1)` |
| Page transition | 400–500ms | `cubic-bezier(0.25, 0.1, 0, 1)` |
| Exit | 200ms (60% of enter) | `ease-in` |

### Motion Rules

- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`
- Entry ease-out, exit ease-in (faster)
- Maximum 2 animated elements per view
- Respect `prefers-reduced-motion`
- Stagger children by 80–100ms

---

## Component Patterns

### Buttons

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | `slate-900` | `white` | none |
| Hover | `slate-800` | `white` | none |
| Active/Tap | `slate-950` | `white` | none |
| Disabled | `slate-200` | `slate-400` | none |
| Secondary | `white` | `slate-600` | `slate-200` |
| Ghost | transparent | `slate-600` | none |

### Cards

| Property | Value |
|----------|-------|
| Background | `white` |
| Border | `1px solid var(--color-border)` |
| Border Radius | `--radius-md` (or `xl` for hero) |
| Shadow | `--shadow-card` |
| Hover | `--shadow-elevated`, `translateY(-2px)` |

### Inputs

| Property | Value |
|----------|-------|
| Background | `slate-50` |
| Border | `1px solid slate-200` |
| Focus Ring | `2px solid orange-500` |
| Radius | `--radius-sm` |
| Padding | `0.625rem 1rem` |
| Label | `caption` weight, `slate-400` |

---

## Accessibility Standards

- **Contrast ratio:** 4.5:1 for body text (AA), 3:1 for large text
- **Touch targets:** minimum 44×44px
- **Focus:** visible 2px ring on all interactive elements
- **Reduced motion:** all animations disabled when `prefers-reduced-motion: reduce`
- **Labels:** all form inputs have visible labels (not placeholder-only)
- **ARIA:** icon-only buttons must have `aria-label`
