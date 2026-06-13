# GoRASA — Database Changes Log

> **Purpose:** Living document tracking all DB schema and data changes across environments.
> **Format:** `Date | Time (IST) | Change Type | Table(s) | DB(s) | Description | Commit`
> **Updated:** After every DB change, before deploy.

---

## Change Types

| Type | Description |
|------|-------------|
| `SCHEMA` | Column add/drop/rename, type change, constraint |
| `DATA` | Row insert/update/delete |
| `INDEX` | Index create/drop |
| `RLS` | Row Level Security policy change |

---

## Changes

| Date | Time | Type | Table(s) | DB(s) | Description | Commit |
|------|------|------|----------|-------|-------------|--------|
| 2026-06-13 | 18:30 | DATA | NavigationItem | NEON (dev, qa) | Deleted "Explore" nav item | 5ed4e23 |
| 2026-06-13 | 18:30 | DATA | NavigationItem | NEON (dev, qa) | Renamed "Reservation Desk" → "My Bookings" | c264b47 |
| 2026-06-13 | 18:30 | DATA | NavigationItem | NEON (dev, qa) | Renamed "AI Support Desk" → "Help Desk" | c264b47 |
| 2026-06-13 | 18:30 | DATA | NavigationItem | NEON (dev, qa) | Reordered: Plan My Holiday(1), Hotels(2), Flights(3), My Bookings(4), Help Desk(5) | e6f4f05 |
| 2026-06-13 | 18:30 | DATA | NavigationItem | Supabase (prod) | Same 4 changes as NEON above | c264b47, e6f4f05 |
| 2026-06-13 | 21:30 | SCHEMA | Booking | NEON (dev) | Added `leadGuestPan TEXT` column for PAN card compliance | 7db0627 |
| 2026-06-13 | 22:00 | SCHEMA | Booking | NEON (qa) | Added `leadGuestPan TEXT` column (synced from dev) | f4c884e |

---

## Environment DB Mapping

| Environment | DB Provider | Project | Connection |
|-------------|-------------|---------|------------|
| **Dev** | NEON | gorasa-dev | `ep-quiet-tooth-aiehj2mq` |
| **QA** | NEON | gorasa-qa | `ep-wispy-thunder-adigjqv3` |
| **Prod** | Supabase | isubgeemvhvhnhikxbjb | Direct REST API |

---

## Pending Sync

| Change | Dev Status | QA Status | Prod Status |
|--------|------------|-----------|-------------|
| NavigationItem cleanup | ✅ Done | ✅ Done | ✅ Done |
| Booking.leadGuestPan | ✅ Done | ✅ Done | ❌ Not needed (Supabase schema separate) |

---

## How to Use

1. **Before any DB change:** Log the planned change here with date/time
2. **After applying:** Update the status column
3. **Before deploy:** Verify all environments have the change
4. **Format:** Always include the exact SQL or API call used

---

## Quick Reference: Apply Schema to QA

```bash
# Connect to QA NEON
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:<password>@ep-wispy-thunder-adigjqv3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });
pool.query('<SQL HERE>').then(r => { console.log(r.rows); pool.end(); });
"
```

## Quick Reference: Apply Data to Supabase

```bash
# Supabase REST API
curl -s -X PATCH "https://isubgeemvhvhnhikxbjb.supabase.co/rest/v1/<Table>?<filter>" \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '<JSON BODY>'
```
