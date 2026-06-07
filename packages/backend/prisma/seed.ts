import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding GoRASA database...')

  await prisma.cancellationRequest.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.package.deleteMany()
  await prisma.pricingRule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp India Pvt Ltd',
        domain: 'techcorp.in',
        walletBalance: 500000,
        discountRate: 10,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Pinnacle Ventures Ltd',
        domain: 'pinnacle.in',
        walletBalance: 300000,
        discountRate: 8,
      },
    }),
  ])
  console.log(`  ✓ ${companies.length} companies created`)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'hmittal@gorasa.in',
        name: 'Harsh Mittal',
        role: 'SUPER_ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hmittal',
        walletBalance: 0,
        loyaltyPoints: 10000,
        loyaltyTier: 'Platinum',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@gorasa.in',
        name: 'Priya Sharma',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        walletBalance: 0,
        loyaltyPoints: 5000,
        loyaltyTier: 'Gold',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sales@gorasa.in',
        name: 'Rahul Verma',
        role: 'SALES',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
        walletBalance: 0,
        loyaltyPoints: 2000,
        loyaltyTier: 'Silver',
      },
    }),
    prisma.user.create({
      data: {
        email: 'neha@corp.in',
        name: 'Neha Gupta',
        role: 'CORPORATE_USER',
        companyId: companies[0].id,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
        walletBalance: 150000,
        loyaltyPoints: 3500,
        loyaltyTier: 'Gold',
      },
    }),
    prisma.user.create({
      data: {
        email: 'amit@example.com',
        name: 'Amit Patel',
        role: 'CUSTOMER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
        walletBalance: 50000,
        loyaltyPoints: 1200,
        loyaltyTier: 'Silver',
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya@example.com',
        name: 'Priya Singh',
        role: 'CUSTOMER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priyasingh',
        walletBalance: 25000,
        loyaltyPoints: 800,
        loyaltyTier: 'Silver',
      },
    }),
  ])

  const [harsh, admin, rahul, neha, amit, priyaS] = users
  console.log(`  ✓ ${users.length} users created`)

  const packagesData = [
    {
      title: 'Taj Exotica Resort & Spa Goa',
      duration: '3 Nights / 4 Days',
      price: 45500,
      originalPrice: 55000,
      rating: 4.9,
      provider: 'GoRASA Direct',
      images: JSON.stringify(['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Luxury Villa Stay', 'Airport Transfers', 'Complimentary Buffet Breakfast', 'Goan Spice Tour Guide']),
    },
    {
      title: 'Wildflower Hall, Shimla in the Himalayas',
      duration: '4 Nights / 5 Days',
      price: 62000,
      originalPrice: 75000,
      rating: 4.8,
      provider: 'GoRASA Direct',
      images: JSON.stringify(['https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Mountain View Room', 'Heated Indoor Pool Access', 'Gourmet High Tea', 'Guided Forest Sanctuary Walk']),
    },
    {
      title: 'The Leela Palace Udaipur Lake Retreat',
      duration: '3 Nights / 4 Days',
      price: 68000,
      originalPrice: 82000,
      rating: 4.9,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Grand Palace View Lake Cabin', 'Royal Welcome Ceremony', 'Private Lake Pichola Boat Cruise', 'Signature Massage Session']),
    },
    {
      title: 'Dubai Luxury Skyline & Desert Safari',
      duration: '4 Nights / 5 Days',
      price: 95000,
      originalPrice: 120000,
      rating: 4.8,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['5-Star Sheikh Zayed Rd Hotel', 'Burj Khalifa Sky Deck Tickets', 'Premium 4x4 Desert Safari & Dinner', 'Private VIP Airport Pickups']),
    },
    {
      title: 'Maldives Private Water Villa Escape',
      duration: '5 Nights / 6 Days',
      price: 185000,
      originalPrice: 240000,
      rating: 4.9,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Soneva Jani Luxury Overwater Slide Villa', 'Speedboat Airport Transfers', 'All-Day Wine & Dine Access', 'Coral Reef Guided Snorkeling']),
    },
    {
      title: 'Switzerland Alpine Wonders Scenic Tour',
      duration: '6 Nights / 7 Days',
      price: 145000,
      originalPrice: 190000,
      rating: 4.9,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Elite Chalet Stays in Zermatt & Interlaken', 'Swiss Travel Pass Premier Index', 'Mount Titlis Cable Car Climb', 'Private Lake Lucerne Gondola']),
    },
    {
      title: 'Kandima Maldives Playful All-Inclusive',
      duration: '4 Nights / 5 Days',
      price: 110000,
      originalPrice: 140000,
      rating: 4.8,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Sky Studio Beach Room', 'All Meals and Premium Spirits Pack', 'Water Sports Equipment Rental', 'Dynamic Beach Club Entry']),
    },
    {
      title: 'The Oberoi Beach Resort Luxury Mauritius',
      duration: '5 Nights / 6 Days',
      price: 152000,
      originalPrice: 195000,
      rating: 4.9,
      provider: 'GoRASA Partners',
      images: JSON.stringify(['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Independent Luxury Ocean Pavilion', 'Private Catamaran Sunset Cruise', 'Complimentary Glass Bottom Boat Safaris', 'World-Class All-Day Dining']),
    },
    {
      title: 'Umaid Bhawan Palace Jodhpur Royal Maharajah Life',
      duration: '3 Nights / 4 Days',
      price: 125000,
      originalPrice: 165500,
      rating: 4.9,
      provider: 'GoRASA Select',
      images: JSON.stringify(['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Historical Royal Suite Residency', 'Vintage Luxury Car Tour of Blue City', 'Palace Museum Exclusive Tour with Curator', 'Magnificent Royal Ballroom Ceremonial Feast']),
    },
    {
      title: 'Soneva Fushi Islands Luxury Eco Maldives Retreat',
      duration: '5 Nights / 6 Days',
      price: 220000,
      originalPrice: 285000,
      rating: 5.0,
      provider: 'GoRASA Select',
      images: JSON.stringify(['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Overwater Crusoe Beach Reserve Villa', 'Eco-Luxury Culinary Island Tour with Michelin Chef', 'Stargazing at Astronomical Observatory Lounge', 'Seaplane Private Luxury Lounge Transfers Included']),
    },
    {
      title: 'Alila Diwa South Goa Wellness Escape',
      duration: '2 Nights / 3 Days',
      price: 24500,
      originalPrice: 32000,
      rating: 4.7,
      provider: 'GoRASA Direct',
      images: JSON.stringify(['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Terrace Room Sanctuary', 'Yoga & Meditation Circle', 'Infinity Edge Pool Access', 'Artisanal Spirits Tasting']),
    },
    {
      title: 'Taj Fisherman\'s Cove Beach Front Villa Kovalam',
      duration: '3 Nights / 4 Days',
      price: 34900,
      originalPrice: 44000,
      rating: 4.8,
      provider: 'GoRASA Direct',
      images: JSON.stringify(['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80']),
      inclusions: JSON.stringify(['Beachfront Luxury Cottage Stay', 'Private Seafood Shore Deck Dinner', 'Complimentary Surfing Basics Lessons', 'Premium Ayurveda Body Spa']),
    },
  ]

  const packages = await Promise.all(
    packagesData.map((p) =>
      prisma.package.create({
        data: {
          ...p,
          status: 'PUBLISHED',
          overview: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: `Experience the luxury of ${p.title}. This handpicked package offers an unforgettable journey with premium accommodations, curated experiences, and personalized service.` }] },
            ],
          }),
          itinerary: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Day 1: Arrival & Welcome' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Arrive and transfer to your luxurious accommodation. Welcome drinks and orientation.' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Day 2: Exploration' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Full day of guided exploration with premium experiences.' }] },
            ],
          }),
          exclusions: JSON.stringify(['Airfare (unless specified)', 'Travel Insurance', 'Personal expenses', 'Tips & gratuities']),
          importantNotes: JSON.stringify({
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Check-in: 2:00 PM | Check-out: 11:00 AM' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Cancellation: Free cancellation up to 7 days before check-in.' }] },
            ],
          }),
        },
      })
    )
  )
  console.log(`  ✓ ${packages.length} packages created`)

  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        destination: 'Goa, India',
        travelerName: 'Vikram Mehta',
        travelerEmail: 'vikram@example.com',
        travelerPhone: '+91-9876543210',
        numberOfDays: 5,
        inclusions: JSON.stringify(['Hotel', 'Flights', 'Transfers', 'Sightseeing']),
        specificDemands: 'Beachfront villa with private pool, vegetarian meal options',
        notes: 'Traveling with family of 4 (2 adults, 2 kids)',
        stage: 'NEW',
        assignedTo: rahul.id,
      },
    }),
    prisma.lead.create({
      data: {
        destination: 'Kerala, India',
        travelerName: 'Ananya Reddy',
        travelerEmail: 'ananya@example.com',
        numberOfDays: 7,
        inclusions: JSON.stringify(['Houseboat', 'Ayurveda', 'Hotel']),
        specificDemands: 'Premium Ayurveda wellness package, houseboat for 2 nights',
        stage: 'QUALIFIED',
        assignedTo: rahul.id,
      },
    }),
    prisma.lead.create({
      data: {
        destination: 'Bali, Indonesia',
        travelerName: 'Ravi Kumar',
        travelerEmail: 'ravi@example.com',
        travelerPhone: '+91-9988776655',
        numberOfDays: 6,
        inclusions: JSON.stringify(['Hotel', 'Flights', 'Activities']),
        specificDemands: 'Honeymoon package with candlelight dinner',
        notes: 'Honeymoon trip, looking for romantic experiences',
        stage: 'NEGOTIATION',
        assignedTo: rahul.id,
      },
    }),
    prisma.lead.create({
      data: {
        destination: 'Manali, India',
        travelerName: 'Sneha Joshi',
        travelerEmail: 'sneha@example.com',
        numberOfDays: 4,
        inclusions: JSON.stringify(['Hotel', 'Transfers', 'Sightseeing', 'Meals']),
        stage: 'NEW',
      },
    }),
    prisma.lead.create({
      data: {
        destination: 'Dubai, UAE',
        travelerName: 'Arjun Nair',
        travelerEmail: 'arjun@corp.in',
        numberOfDays: 3,
        inclusions: JSON.stringify(['Hotel', 'Flights', 'Visa', 'Desert Safari']),
        specificDemands: 'Business class flights, 5-star hotel near business district',
        notes: 'Corporate incentive trip for 10 employees',
        stage: 'MEETING',
        assignedTo: rahul.id,
      },
    }),
  ])
  console.log(`  ✓ ${leads.length} leads created`)

  await Promise.all([
    prisma.activity.create({
      data: { leadId: leads[0].id, type: 'NOTE', description: 'Initial inquiry received via WhatsApp', createdBy: rahul.id },
    }),
    prisma.activity.create({
      data: { leadId: leads[1].id, type: 'CALL', description: 'Called to discuss Kerala package options', createdBy: rahul.id },
    }),
    prisma.activity.create({
      data: { leadId: leads[2].id, type: 'EMAIL', description: 'Sent honeymoon package proposal', createdBy: rahul.id },
    }),
  ])
  console.log('  ✓ 3 activities created')

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: amit.id,
        type: 'Holiday Package',
        itemName: 'Alila Diwa South Goa Wellness Escape',
        price: 24500,
        originalPrice: 32000,
        discountApplied: 7500,
        couponCodeUsed: 'WELCOME500',
        status: 'CONFIRMED',
        pnr: 'GR' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        paxCount: 2,
        travelDates: JSON.stringify({ from: '2026-08-15', to: '2026-08-17' }),
      },
    }),
    prisma.booking.create({
      data: {
        userId: amit.id,
        type: 'Hotel',
        itemName: 'Taj Exotica Resort & Spa Goa',
        price: 45500,
        originalPrice: 55000,
        discountApplied: 9500,
        status: 'CONFIRMED',
        pnr: 'GR' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        paxCount: 2,
        travelDates: JSON.stringify({ from: '2026-09-10', to: '2026-09-13' }),
      },
    }),
    prisma.booking.create({
      data: {
        userId: neha.id,
        type: 'Flight',
        itemName: 'Mumbai to Dubai (EK 503)',
        providerOrAirline: 'Emirates',
        price: 42000,
        originalPrice: 45000,
        discountApplied: 3000,
        couponCodeUsed: 'CORP10',
        status: 'CONFIRMED',
        pnr: 'GR' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        seatOrRoom: '12A',
        paxCount: 1,
        travelDates: JSON.stringify({ from: '2026-07-20', to: '2026-07-20' }),
      },
    }),
    prisma.booking.create({
      data: {
        userId: priyaS.id,
        type: 'Holiday Package',
        itemName: 'The Machan Treehouse Lonavala',
        price: 18900,
        originalPrice: 24000,
        discountApplied: 5100,
        status: 'CONFIRMED',
        pnr: 'GR' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        paxCount: 2,
        travelDates: JSON.stringify({ from: '2026-06-28', to: '2026-06-30' }),
      },
    }),
    prisma.booking.create({
      data: {
        userId: priyaS.id,
        type: 'Flight',
        itemName: 'Delhi to Goa (6E 217)',
        providerOrAirline: 'IndiGo',
        price: 8500,
        status: 'CONFIRMED',
        pnr: 'GR' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        seatOrRoom: '14C',
        paxCount: 1,
        travelDates: JSON.stringify({ from: '2026-07-05', to: '2026-07-05' }),
      },
    }),
  ])
  console.log(`  ✓ ${bookings.length} bookings created`)

  await Promise.all([
    prisma.pricingRule.create({
      data: { type: 'HOTEL_MARKUP', destination: 'Goa', markupPercent: 22 },
    }),
    prisma.pricingRule.create({
      data: { type: 'HOTEL_MARKUP', destination: 'Kerala', markupPercent: 20 },
    }),
    prisma.pricingRule.create({
      data: { type: 'HOTEL_MARKUP', destination: 'Rajasthan', markupPercent: 25 },
    }),
    prisma.pricingRule.create({
      data: { type: 'HOTEL_MARKUP', destination: 'Maldives', markupPercent: 18 },
    }),
    prisma.pricingRule.create({
      data: { type: 'FLIGHT_TDS', markupPercent: 2 },
    }),
  ])
  console.log('  ✓ 5 pricing rules created')

  console.log('')
  console.log('✅ GoRASA database seeded successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   SUPER_ADMIN: hmittal@gorasa.in')
  console.log('   ADMIN:       admin@gorasa.in')
  console.log('   SALES:       sales@gorasa.in')
  console.log('   CORPORATE:   neha@corp.in')
  console.log('   CUSTOMER:    amit@example.com')
  console.log('   CUSTOMER:    priya@example.com')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
