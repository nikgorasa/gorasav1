---
name: supabase-table-route
description: |
  Reusable workflow for creating a new Supabase table + Next.js API route + frontend migration.
  Used 11 times in Phase 6 to migrate all hardcoded data to database-driven endpoints.
  Triggers: creating new DB tables, adding API routes, migrating hardcoded constants to Supabase.
---

# Supabase Table + API Route Creation

Standardized workflow for adding a new database-backed feature to GoRASA. Used 11 times during Phase 6 hardc data migration.

## When to Use

- Creating a new Supabase table
- Adding a new `/api/<resource>` route
- Migrating hardcoded constants/array to database-driven API
- Any task involving "create table, create route, update frontend"

## Workflow

### Step 1: Create Supabase Table

```sql
-- In Supabase SQL Editor or migration
CREATE TABLE <TableName> (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- domain-specific columns (use lowercase or quoted camelCase)
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE <TableName> ENABLE ROW LEVEL SECURITY;

-- Grant access to anon/authenticated roles
GRANT SELECT ON <TableName> TO anon;
GRANT SELECT ON <TableName> TO authenticated;
```

**Critical:** PostgreSQL folds unquoted identifiers to lowercase. Either:
- Quote column names in SQL: `"isActive" BOOLEAN DEFAULT true`
- Or use lowercase in API routes: `row.isactive`

### Step 2: Seed Data

```sql
INSERT INTO <TableName> (column1, column2, ...) VALUES
  ('value1', 'value2', ...),
  ('value1', 'value2', ...);
```

### Step 3: Create API Route

Create `gorasa-next/src/app/api/<resource>/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterParam = searchParams.get('filter');

  let query = supabase.from('<TableName>').select('*');

  if (filterParam) {
    query = query.eq('column', filterParam);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Key patterns from GoRASA:**
- Use `SUPABASE_SERVICE_ROLE_KEY` for server-side routes (bypasses RLS)
- Use `NEXT_PUBLIC_SUPABASE_URL` for the project URL
- Return `NextResponse.json(data)` for success
- Filter via `searchParams.get()` for query parameters

### Step 4: Update Frontend Component

Replace hardcoded constants with API fetch:

```typescript
// Before: hardcoded
const ITEMS = ['Option A', 'Option B', 'Option C'];

// After: API-driven
const [items, setItems] = useState([]);
useEffect(() => {
  fetch('/api/<resource>')
    .then(r => r.json())
    .then(setItems)
    .catch(console.error);
}, []);
```

### Step 5: Verify

```bash
# Must pass with 0 TypeScript errors
npm run build 2>&1 | tail -5

# Verify no old imports remain
grep -r "OLD_CONSTANT" gorasa-next/src/
```

### Step 6: Update MEMORY.md

Add the new table to the `Key Files` section and update session history.

## Reference: Tables Created in Phase 6

| Table | API Route | Frontend File | Purpose |
|-------|-----------|---------------|---------|
| City | `/api/cities` | flights/page.tsx, hotels/page.tsx | Search dropdowns |
| PackageCategory | `/api/categories` | page.tsx (homepage) | Carousel metadata |
| ValueProposition | `/api/value-propositions` | page.tsx (homepage) | Value props section |
| FaqCategory | `/api/faq/categories` | support/page.tsx | Quick replies |
| LeadStage | `/api/leads/stages` | admin/leads/page.tsx | Pipeline stages |
| SiteConfig | `/api/site-config` | Footer.tsx | Contact info |
| QuickTopUpAmount | `/api/topup-amounts` | admin/b2b/page.tsx | Wallet amounts |
| NavigationItem | `/api/navigation` | Navbar.tsx, admin layout | Nav items |
| FooterLink | `/api/footer-links` | Footer.tsx | Footer links |
| PreferenceOption | `/api/preferences/options` | profile/page.tsx | Dropdown options |
| Role | `/api/roles` | LoginModal.tsx | Role colors |

## Common Pitfalls

1. **Column casing mismatch** — Most common bug. SQL creates lowercase, API expects camelCase. Fix: quote columns in SQL or map in API.
2. **Wrong Supabase client** — Use `supabase-admin.ts` (service role) for server routes, `supabase.ts` (anon) for browser.
3. **Missing .catch() on fetch** — If any Promise.all fetch fails without catch, all state updates are skipped silently.
4. **RLS blocking queries** — Service role key bypasses RLS. Anon key requires explicit GRANT + policies.
