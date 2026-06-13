# GoRASA — Production DB Migration Plan

> **Purpose:** Exact SQL to migrate Supabase production DB to match dev NEON.
> **Generated:** 2026-06-13 22:30 IST
> **Source:** Dev NEON (gorasa-dev) → Target: Supabase Production (isubgeemvhvhnhikxbjb)

---

## Schema Differences

| Table | Column | Dev (NEON) | Prod (Supabase) | Action |
|-------|--------|------------|-----------------|--------|
| Booking | leadGuestPan | ✅ EXISTS | ❌ MISSING | ADD COLUMN |

---

## Data Differences

### NavigationItem (main section)

| Label | Dev Sortorder | Dev Active | Prod Sortorder | Prod Active | Action |
|-------|---------------|------------|----------------|-------------|--------|
| Explore | DELETED | — | 1 | false | DELETE ROW |
| Plan My Holiday | 1 | true | 6 | true | UPDATE sortorder=1 |
| Hotels | 2 | true | 5 | true | UPDATE sortorder=2 |
| Flights | 3 | true | 4 | true | UPDATE sortorder=3 |
| My Bookings | 4 | true | 2 | true | UPDATE sortorder=4 |
| Help Desk | 5 | true | 3 | true | UPDATE sortorder=5 |

### PackageCategory

| ID | Dev Title | Dev Sortorder | Prod Title | Prod Sortorder | Action |
|----|-----------|---------------|------------|----------------|--------|
| GORASA_SELECT | GoRASA Select Exclusives | 6 | Top Boutique Stays | 1 | UPDATE title + sortorder |
| TOP_DEALS | Top Holiday Deals | 1 | Top Deals | 2 | UPDATE title + sortorder |
| WEEKEND_DEALS | Weekend Gateways | 3 | Weekend Getaways | 3 | UPDATE title |
| INTERNATIONAL_PACKAGES | International Packages | 3 | International Packages | 5 | UPDATE sortorder |
| ALL_INCLUSIVE_DEALS | All-Inclusive Stays | 4 | All-Inclusive Stays | 4 | — |
| BEACH_VACATIONS | Beach Vacations | 5 | Beach Vacations | 6 | UPDATE sortorder |

---

## Migration SQL (Ordered)

### Step 1: Schema — Add Booking.leadGuestPan

```sql
-- Add PAN card column to Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "leadGuestPan" TEXT;
```

### Step 2: NavigationItem — Delete Explore

```sql
-- Delete Explore nav item (already inactive, but remove entirely)
DELETE FROM "NavigationItem" WHERE label = 'Explore';
```

### Step 3: NavigationItem — Reorder main items

```sql
-- Reorder main nav items to match dev
UPDATE "NavigationItem" SET sortorder = 1 WHERE label = 'Plan My Holiday' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 2 WHERE label = 'Hotels' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 3 WHERE label = 'Flights' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 4 WHERE label = 'My Bookings' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 5 WHERE label = 'Help Desk' AND section = 'main';
```

### Step 4: PackageCategory — Sync titles and sortorder

```sql
-- Sync PackageCategory with dev
UPDATE "PackageCategory" SET title = 'GoRASA Select Exclusives', sortorder = 6 WHERE id = 'GORASA_SELECT';
UPDATE "PackageCategory" SET title = 'Top Holiday Deals', sortorder = 1 WHERE id = 'TOP_DEALS';
UPDATE "PackageCategory" SET title = 'Weekend Gateways' WHERE id = 'WEEKEND_DEALS';
UPDATE "PackageCategory" SET sortorder = 3 WHERE id = 'INTERNATIONAL_PACKAGES';
UPDATE "PackageCategory" SET sortorder = 5 WHERE id = 'BEACH_VACATIONS';
```

---

## Verification Queries

After migration, run these to confirm:

```sql
-- NavigationItem (main) — should show 5 items in order
SELECT label, sortorder, isactive FROM "NavigationItem" WHERE section = 'main' ORDER BY sortorder;
-- Expected: Plan My Holiday(1), Hotels(2), Flights(3), My Bookings(4), Help Desk(5)

-- PackageCategory — should match dev
SELECT id, title, sortorder FROM "PackageCategory" ORDER BY sortorder;
-- Expected: TOP_DEALS(1,"Top Holiday Deals"), WEEKEND_DEALS(2,"Weekend Gateways"), INTERNATIONAL_PACKAGES(3), ALL_INCLUSIVE_DEALS(4), BEACH_VACATIONS(5), GORASA_SELECT(6,"GoRASA Select Exclusives")

-- Booking column — should exist
SELECT column_name FROM information_schema.columns WHERE table_name = 'Booking' AND column_name = 'leadGuestPan';
-- Expected: leadGuestPan
```

---

## Rollback

```sql
-- Restore Explore nav item
INSERT INTO "NavigationItem" (id, label, href, icon, section, sortorder, isactive) VALUES ('22d2ce86-a9e7-4ce1-b320-ccfe083996ba', 'Explore', '/', 'Compass', 'main', 1, false);

-- Restore original sortorder
UPDATE "NavigationItem" SET sortorder = 2 WHERE label = 'My Bookings' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 3 WHERE label = 'Help Desk' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 4 WHERE label = 'Flights' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 5 WHERE label = 'Hotels' AND section = 'main';
UPDATE "NavigationItem" SET sortorder = 6 WHERE label = 'Plan My Holiday' AND section = 'main';

-- Drop leadGuestPan
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "leadGuestPan";
```
