# GoRASA — Luxury Travel Platform

GoRASA is a premium travel discovery platform for Indian travelers. It lets you search flights, browse luxury hotels, explore holiday packages, manage bookings, and track loyalty rewards — all in one place.

Think of it as a personal travel concierge in your browser.

---

## What's in this project?

This project is organized into two main parts that work together:

```
rasa-zero-app-main/
├── packages/
│   ├── frontend/     ← The website you see in your browser
│   └── backend/      ← The server that stores and serves data
├── package.json      ← Tells the project how to start both parts
└── dist/             ← The built website (auto-generated, don't touch)
```

### packages/frontend/ — The Website

This is what loads in your browser. It's a React app (think of it as a modern, faster way to build websites). When you open `http://localhost:3000`, you see:

- A home page with flight search, hotel browsing, and holiday packages
- Booking management (view your trips, cancel bookings)
- Login modal (choose your role and email to sign in)
- A WhatsApp-style concierge chat
- An admin dashboard (if you're logged in as admin)
- A footer with company info and policies

### packages/backend/ — The Server

This is the brain that powers the website. It runs on `http://localhost:3001` and does three things:

1. **Listens for requests** — When you click "Login" or "View my bookings" on the website, it sends a request to the backend
2. **Talks to the database** — The backend reads/writes data from a small database file (`SQLite`)
3. **Returns data** — It sends the response back to the website, which then displays it

**The backend handles:**
- **Auth** — Login with email + role, get a token (like a digital ID card)
- **Packages** — Browse travel packages
- **Leads** — Sales team manages customer inquiries
- **Bookings** — View and cancel your bookings
- **Dashboard** — Admin sees stats (total users, revenue, etc.)

---

## How to run it locally

You need **Node.js** installed (a free program that runs JavaScript outside the browser). If you don't have it, download it from [nodejs.org](https://nodejs.org/).

### Step 1: Open a terminal

On your computer, open Terminal (Mac/Linux) or Command Prompt (Windows).

### Step 2: Navigate to this project folder

```bash
cd /path/to/rasa-zero-app-main
```

Replace `/path/to/` with the actual location of this folder on your computer.

### Step 3: Install dependencies

This downloads all the helper libraries the project needs:

```bash
npm install
```

You'll see a lot of text scroll by — that's normal. Wait for it to finish.

### Step 4: Seed the database

This fills the database with sample data (users, packages, bookings):

```bash
npm run db:seed
```

You should see a success message with a list of login emails.

### Step 5: Start both servers

```bash
npm run dev
```

This starts two things at once:
- The **website** at → `http://localhost:3000`
- The **server** at → `http://localhost:3001`

### Step 6: Open your browser

Go to `http://localhost:3000` — the GoRASA homepage should load.

---

## Dev Login (no password needed)

Since this is a prototype, you don't need a real password. Just pick a role and email from this table:

| Role | Email |
|---|---|
| **SUPER_ADMIN** (full access) | hmittal@gorasa.in |
| **ADMIN** (manage everything) | admin@gorasa.in |
| **SALES** (manage leads) | sales@gorasa.in |
| **CORPORATE_USER** (company travel) | neha@corp.in |
| **CUSTOMER** (regular user) | amit@example.com |
| **CUSTOMER** (regular user) | priya@example.com |

Click "Login" on the website, enter one of these emails, pick the matching role from the dropdown, and you're in.

---

## Project structure explained (for beginners)

```
packages/
├── frontend/                    ← The website
│   ├── index.html               ← The main HTML page (skeleton)
│   ├── index.tsx                ← The React app entry point
│   ├── App.tsx                  ← The main app component (biggest file)
│   ├── components/              ← Reusable pieces of the website
│   │   ├── Navbar.tsx           ← Top navigation bar
│   │   ├── Footer.tsx           ← Bottom footer
│   │   ├── LoginModal.tsx       ← Login popup
│   │   ├── GoRasaLogo.tsx       ← The GoRASA logo SVG
│   │   ├── CustomCarousels.tsx  ← Image carousels
│   │   ├── ConciergeChat.tsx    ← Chat assistant
│   │   ├── WhatsAppChannel.tsx  ← WhatsApp button
│   │   ├── PremiumDashboard.tsx ← Admin dashboard
│   │   ├── MyTrips.tsx          ← My bookings page
│   │   └── UserProfile.tsx      ← User profile page
│   ├── services/                ← Code that talks to servers/APIs
│   ├── public/                  ← Images, icons, static data
│   ├── vite.config.ts           ← Vite configuration (build tool)
│   └── package.json             ← Frontend dependencies list
│
└── backend/                     ← The server
    ├── src/
    │   ├── index.ts             ← Server entry point (starts Express)
    │   ├── routes/              ← API endpoints (the "menu" of requests)
    │   │   ├── auth.ts          ← Login/logout
    │   │   ├── packages.ts      ← Travel packages
    │   │   ├── leads.ts         ← Customer inquiries
    │   │   ├── bookings.ts      ← Booking management
    │   │   └── dashboard.ts     ← Admin stats
    │   ├── middleware/
    │   │   └── auth.ts          ← Permission checking code
    │   └── lib/
    │       ├── prisma.ts        ← Database connection
    │       └── jwt.ts           ← Token generation code
    ├── prisma/
    │   ├── schema.prisma        ← Database structure (7 tables)
    │   ├── seed.ts              ← Sample data filler
    │   └── dev.db               ← The actual database file (SQLite)
    ├── tsconfig.json            ← TypeScript settings
    └── package.json             ← Backend dependencies list
```

---

## How to deploy

### Website (Frontend) → Netlify (free)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) and click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Set the following in Netlify settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/`
5. Click **Deploy**

The website goes live at a `*.netlify.app` URL.

### Server (Backend) → Render (free)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub repo (`nikjp2021/gorasa-app`)
3. Fill in:

| Field | Value |
|---|---|
| **Name** | `gorasa-backend` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm run start -w packages/backend` |
| **Plan** | **Free** |

4. **Advanced** → Add environment variable:
   - `JWT_SECRET` = any random string (e.g. `gorasa-prod-secret-123`)

5. Click **Create Web Service**

The API goes live at `https://gorasa-backend.onrender.com`. The start command automatically creates database tables and fills sample data on every launch.

### Connect frontend to backend

In your Netlify dashboard:
- Go to **Site settings** → **Environment variables**
- Add `VITE_API_URL` = `https://gorasa-backend.onrender.com`
- Rebuild the site

Now the website knows where the API lives.

---

## Tech stack (for the curious)

| Technology | What it does |
|---|---|
| **React 19** | A JavaScript library for building the website UI |
| **TypeScript** | JavaScript with type-checking (catches bugs early) |
| **Vite** | A build tool that bundles the website for production |
| **Tailwind CSS** | A utility-based CSS framework for styling |
| **Motion** | A library for animations and transitions |
| **Lucide React** | A set of clean SVG icons |
| **Express** | A Node.js framework for the backend server |
| **Prisma** | A database toolkit (write queries in JavaScript) |
| **SQLite** | A file-based database (no setup needed) |
| **JWT (JSON Web Tokens)** | A token-based authentication system |
| **Zod** | A validation library for API requests |

---

## License

Private — RASA Travel Services India Private Limited
