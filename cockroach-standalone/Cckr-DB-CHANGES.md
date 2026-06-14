# GoRASA CockroachDB Standalone — DB Changes

> **Purpose:** Track all database schema and data changes on CockroachDB.

---

## Baseline (2026-06-15)

**Cluster:** `aqua-pony-27730.j77.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb`

### Tables (31)

| Table | Rows | Notes |
|-------|------|-------|
| Activity | 3 | Tour activities |
| Booking | 17 | Flight/hotel/package bookings |
| CancellationRequest | — | Cancellation tracking |
| Category | — | Package categories |
| City | 35 | Flight/hotel city dropdowns |
| Company | 2 | Corporate accounts |
| FaqCategory | 6 | Support FAQ categories |
| FaqItem | — | FAQ items |
| FooterLink | 8 | Footer navigation |
| Lead | 10 | Sales leads |
| LeadStage | 7 | Pipeline stages |
| LoyaltyPointsHistory | — | Points tracking |
| NavigationItem | 14 | Navbar items |
| Package | 12 | Travel packages |
| PackageCategory | 6 | Carousel categories |
| Payment | — | Payment records |
| PreferenceOption | 15 | Profile preferences |
| PricingRule | 5 | Pricing rules |
| Profile | — | User profiles |
| PromoCode | 3 | Promo codes |
| QuickTopUpAmount | 4 | B2B wallet amounts |
| Reward | 6 | Loyalty rewards |
| Role | 5 | User roles |
| SiteConfig | 5 | Site configuration |
| Ticket | 3 | Support tickets |
| TicketActivity | — | Ticket activity log |
| TicketNote | — | Ticket notes |
| TopUpHistory | — | Wallet top-ups |
| User | 6 | Application users |
| ValueProposition | 4 | Homepage value props |
| Wishlist | — | Saved destinations |

### Foreign Key Constraints (14)

All 14 FK constraints re-added after migration:
- User → Role
- Lead → User (assignedTo), Lead → Company, Lead → LeadStage
- Booking → User, Booking → Package
- Payment → Booking
- Ticket → User (createdBy), Ticket → User (assignedTo)
- TicketNote → Ticket, TicketNote → User
- TicketActivity → Ticket, TicketActivity → User (createdBy)
- LoyaltyPointsHistory → User, LoyaltyPointsHistory → Reward
- TopUpHistory → Company

---

### Pending Changes

(No pending DB changes at baseline)
