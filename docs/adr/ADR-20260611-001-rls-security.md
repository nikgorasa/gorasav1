# ADR-20260611-001: RLS Security Fix on Supabase

## Status
Accepted

## Context
Supabase security alert detected: **27 tables had Row-Level Security (RLS) disabled** (`rls_disabled_in_public`). This meant anyone with the project URL and anon key could read, edit, and delete ALL data in these tables.

**Affected Tables:**
- `public.User` (6 rows)
- `public.Company` (2 rows)
- `public.Lead` (10 rows)
- `public.Activity` (3 rows)
- `public.Package` (24 rows)
- `public.PricingRule` (5 rows)
- `public.Booking` (17 rows)
- `public.Payment` (0 rows)
- `public.Invoice` (0 rows)
- `public.CancellationRequest` (0 rows)
- `public.PromoCode` (4 rows)
- `public.LoyaltyReward` (6 rows)
- `public.Redemption` (0 rows)
- `public.Flight` (11 rows)
- `public.Testimonial` (3 rows)
- `public.Faq` (7 rows)
- `public.City` (35 rows)
- `public.PackageCategory` (6 rows)
- `public.ValueProposition` (4 rows)
- `public.FaqCategory` (6 rows)
- `public.LeadStage` (7 rows)
- `public.SiteConfig` (5 rows)
- `public.QuickTopUpAmount` (4 rows)
- `public.NavigationItem` (14 rows)
- `public.FooterLink` (8 rows)
- `public.PreferenceOption` (15 rows)
- `public.Role` (5 rows)

## Decision
Enable RLS on all 27 tables with 5 policy groups:

### Policy Group 1: Public Read (15 tables)
```sql
CREATE POLICY "Public read" ON public."Package" FOR SELECT USING (true);
-- Applied to: Package, City, Testimonial, Faq, NavigationItem, FooterLink, 
-- PackageCategory, ValueProposition, FaqCategory, LeadStage, Flight, 
-- PromoCode, LoyaltyReward, QuickTopUpAmount, Role
```

### Policy Group 2: User Profile (2 tables)
```sql
CREATE POLICY "Own profile read" ON public."User" FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Own profile update" ON public."User" FOR UPDATE USING (id = auth.uid()::text);
CREATE POLICY "Company members read" ON public."Company" 
  FOR SELECT USING (id IN (SELECT "companyId" FROM public."User" WHERE id = auth.uid()::text));
```

### Policy Group 3: User-Owned Data (5 tables)
```sql
CREATE POLICY "Own bookings" ON public."Booking" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "Own payments" ON public."Payment" FOR ALL USING ("bookingId" IN (SELECT id FROM public."Booking" WHERE "userId" = auth.uid()::text));
CREATE POLICY "Own invoices" ON public."Invoice" FOR ALL USING ("bookingId" IN (SELECT id FROM public."Booking" WHERE "userId" = auth.uid()::text));
CREATE POLICY "Own cancellations" ON public."CancellationRequest" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "Own redemptions" ON public."Redemption" FOR ALL USING ("userId" = auth.uid()::text);
```

### Policy Group 4: Admin/Service Role Only (4 tables)
```sql
CREATE POLICY "Service role full access" ON public."Lead" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public."Activity" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public."PricingRule" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON public."SiteConfig" FOR ALL USING (auth.role() = 'service_role');
```

## Consequences
- ✅ Anon key can no longer write/read sensitive data
- ✅ Authenticated users scoped to own data only
- ✅ Service role retains full access for backend operations
- ⚠️ Existing client code using service role key continues to work
- ⚠️ Frontend public content (packages, cities, testimonials) still accessible via anon key

## Verification
- All 27 tables show `rls_enabled: true` in Supabase dashboard
- Public APIs (`/api/packages`, `/api/cities`, etc.) still return data
- Authenticated user APIs scoped correctly

## Author
Agent (Architect/DevOps Guardian) — 2026-06-11