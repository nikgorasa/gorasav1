# GoRASA CockroachDB Standalone — Config Reference

> **Purpose:** Single source of truth for all configuration.

---

## 1. Git Repositories

| Remote | URL | Purpose |
|--------|-----|---------|
| `cockroach` | `https://github.com/Gorasa-In-2026/Gorasa-Cockroach.git` | CockroachDB standalone repo |
| `origin` | `https://github.com/Gorasa-In-2026/gorasav1.git` | Original DEV/QA/PROD pipeline |

## 2. Vercel Projects

| Project | URL | Root Dir | Git Integration |
|---------|-----|----------|----------------|
| `project-10o7w` | https://project-10o7w.vercel.app | `gorasa-next/` | Manual push (no auto-deploy) |

## 3. Database

| Property | Value |
|----------|-------|
| Provider | CockroachDB Basic (Serverless) |
| Cluster | `aqua-pony-27730.j77.aws-ap-south-1.cockroachlabs.cloud:26257` |
| Database | `defaultdb` |
| Tables | 31 |
| Rows | 249 |
| FK constraints | 14 (all re-added after migration) |
| Free tier | 50M RUs/month, 10 GiB storage |

## 4. Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma connection string to CockroachDB |
| `DIRECT_URL` | Direct connection string to CockroachDB |
| `DATABASE_PROVIDER` | Set to `prisma` (no dual-mode) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth URL (unchanged) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (unchanged) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (unchanged) |
| `TBO_USERNAME` | TBO flight API username |
| `TBO_PASSWORD` | TBO flight API password |
| `TBO_HOTEL_USERNAME` | TBO hotel API username |
| `TBO_HOTEL_PASSWORD` | TBO hotel API password |
| `TBO_ENDPOINT` | TBO API endpoint |

## 5. Auth

| Provider | Project Ref | Status |
|----------|-------------|--------|
| Supabase | `isubgeemvhvhnhikxbjb` | Not migrated — kept as-is |

## 6. Migration Details

| Step | Details |
|------|---------|
| Export | 31 tables, 249 rows from Supabase PostgreSQL |
| FK handling | All 14 dropped before import, re-added after |
| Import script | `gorasa-next/scripts/migrate-to-cockroach.js` |
| Rewritten files | 9 files switched from Supabase client to Prisma |
