# GoRASA — Luxury Travel Platform

GoRASA is a premium travel discovery platform for Indian travelers. It lets you search flights, browse luxury hotels, explore holiday packages, manage bookings, and track loyalty rewards — all in one place.

---

## Project Structure

```
rasa-zero-app-main/
├── gorasa-next/          ← Next.js app (current active codebase)
├── packages/frontend/    ← Legacy React app (deprecated)
├── packages/backend/     ← Legacy Express server (deprecated)
└── scripts/              ← Deployment & migration scripts
```

The active app lives in **`gorasa-next/`** — a Next.js application deployed on Vercel.

---

## Environments

| Environment | Branch | URL | Deploy Trigger |
|---|---|---|---|
| **Dev** | `dev` | https://project-uul0v.vercel.app | Push to `dev` |
| **QA** | `qa` | https://project-sm6gc.vercel.app | Merge PR into `qa` |
| **Production** | `main` | https://gorasa-next.vercel.app | Manual `workflow_dispatch` + approval |

### Workflow
```
dev → PR → qa → PR → main → manual deploy → Production
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework (App Router) |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility CSS framework |
| **Supabase** | Authentication + Database |
| **NEON (Dev/QA)** | Standalone Postgres for staging |
| **TBO API** | Flight & hotel search |
| **Vercel** | Hosting (3 projects) |
| **GitHub Actions** | CI/CD pipeline |

---

## Demo Users

All environments share the same Supabase project. Use these emails to log in:

| Role | Email |
|---|---|
| **SUPER_ADMIN** | hmittal@gorasa.in |
| **ADMIN** | admin@gorasa.in |
| **SALES** | sales@gorasa.in |
| **CORPORATE_USER** | neha@corp.in |
| **CUSTOMER** | amit@example.com |
| **CUSTOMER** | priya@example.com |

---

## Running Locally

```bash
cd gorasa-next
cp .env.local.example .env.local   # Fill in your env vars
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployments are handled via **GitHub Actions** workflows:

- `deploy-dev.yml` — auto on push to `dev`
- `deploy-qa.yml` — auto on push to `qa`
- `deploy-prod.yml` — manual (`workflow_dispatch`) with **nikjp2021 approval gate**

See `CONFIG-REFERENCE.md` for all environment variables and secrets.

---

## License

Private — GoRasa-In-2026
