# GoRASA - Luxury Travel Platform

A bilingual static travel booking platform for flight searches, hotel browsing, holiday packages, loyalty rewards, and B2B corporate travel management.

## Features

- **Flight Search** — Browse Indigo and Air India flights with static route data
- **Hotel Discovery** — Explore Premium, OYO, and Global partner hotels
- **Holiday Packages** — Browse curated luxury travel packages
- **AI Concierge Chat** — Rule-based support assistant (no external API needed)
- **Booking Management** — Reservation desk with PNR tracking
- **Loyalty Program** — Silver/Gold/Platinum tier reward system
- **Corporate Wallet** — B2B wallet top-up and commission tracking
- **Admin Dashboard** — Promo CMS, CRM leads, booking ledger
- **WhatsApp Notifications** — Simulated booking alerts

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (via CDN)
- **State:** React state + localStorage persistence
- **Data:** Static JSON files (no backend, no API keys required)
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

Output in `dist/` — deployable to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## Project Structure

```
public/data/          # Static JSON data files
  ├── flights.json    # Indigo & Air India routes
  ├── hotels.json     # Premium, OYO, Global hotels
  ├── packages.json   # Holiday packages
  ├── users.json      # Demo user profiles
  └── initialData.json # Seed bookings, promos, inquiries
services/             # Data access layer
  ├── flightService.ts
  ├── hotelService.ts
  ├── globalService.ts
  ├── geminiService.ts   # Rule-based chat + suggestions
  ├── vendorService.ts   # Rate verification simulation
  └── cacheService.ts
components/           # UI components
  ├── Navbar.tsx
  ├── LoginModal.tsx
  ├── ConciergeChat.tsx
  ├── WhatsAppChannel.tsx
  ├── CustomCarousels.tsx
  ├── PremiumDashboard.tsx
  ├── UserProfile.tsx
  └── MyTrips.tsx
```

## Demo Accounts

- **Traveler** — alex@gorasa.com
- **Corporate** — vikram@corporate.com
- **B2B Agent** — nisha@agents.com
- **Admin** — rasatravelindia@gmail.com

## License

Private — RASA Online Travel Private Limited
