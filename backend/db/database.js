const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { calculateHaversineDistance, isBusinessOpenNow, resolveLocationCoordinates } = require('../services/geoService');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initial seed data generator
function getInitialSeedData() {
  return {
    users: [
      {
        id: 'usr-admin-1',
        email: 'admin@localconnect.com',
        password_hash: '$2a$10$demoHashedPasswordAdmin',
        full_name: 'Sarah Jenkins (Admin)',
        role: 'admin',
        phone: '+91 98801 23456',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: 'usr-owner-1',
        email: 'owner@localconnect.com',
        password_hash: '$2a$10$demoHashedPasswordOwner',
        full_name: 'Rajesh Sharma (Owner)',
        role: 'owner',
        phone: '+91 98450 11223',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        created_at: '2024-02-15T11:30:00Z'
      },
      {
        id: 'usr-customer-1',
        email: 'customer@localconnect.com',
        password_hash: '$2a$10$demoHashedPasswordCustomer',
        full_name: 'Priya Narayanan',
        role: 'customer',
        phone: '+91 97400 99887',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        created_at: '2024-03-01T14:20:00Z'
      }
    ],
    categories: [
      { id: 'home-services', name: 'Home Services', icon: 'Wrench', description: 'Electricians, plumbers, carpentry & repairs' },
      { id: 'restaurants', name: 'Restaurants & Cafes', icon: 'UtensilsCrossed', description: 'Dining, cafes, street food & takeaways' },
      { id: 'healthcare', name: 'Healthcare & Dental', icon: 'Stethoscope', description: 'Dentists, clinics, pharmacies & diagnostic labs' },
      { id: 'salons', name: 'Salons & Beauty', icon: 'Scissors', description: 'Hair stylists, skin clinics, spas & barbers' },
      { id: 'grocery', name: 'Grocery Stores', icon: 'ShoppingCart', description: 'Supermarkets, organic stores & fresh produce' },
      { id: 'electronics', name: 'Electronics & Repairs', icon: 'Smartphone', description: 'Phone screens, laptops, home appliances & gadgets' }
    ],
    businesses: [
      // 1. Electrician - Verified
      {
        id: 'biz-elec-1',
        owner_id: 'usr-owner-1',
        name: 'PowerVolt Electrical & Home Automation',
        slug: 'powervolt-electrical-indiranagar',
        category: 'Home Services',
        subcategory: 'Electricians',
        description: 'Certified electrical contractors offering 24/7 emergency repair, wiring inspection, MCB installation, and smart home automation with 30-day warranty.',
        rating: 4.8,
        review_count: 142,
        price_tier: '₹₹',
        price_range_text: '₹250 - ₹1,200',
        is_verified: true,
        verification_date: '2024-05-18',
        verification_badge_text: 'Verified via Govt Electrical Contractor License #EL-KAR-2021-984 & GSTIN',
        phone: '+91 80 4123 9980',
        email: 'service@powervolt.in',
        website: 'https://powervolt.in',
        address: '42, 100ft Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        area: 'Indiranagar',
        pincode: '560038',
        latitude: 12.9784,
        longitude: 77.6408,
        opening_hours: {
          monday: { open: '08:00', close: '22:00', closed: false },
          tuesday: { open: '08:00', close: '22:00', closed: false },
          wednesday: { open: '08:00', close: '22:00', closed: false },
          thursday: { open: '08:00', close: '22:00', closed: false },
          friday: { open: '08:00', close: '22:00', closed: false },
          saturday: { open: '08:00', close: '22:00', closed: false },
          sunday: { open: '09:00', close: '20:00', closed: false }
        },
        services: [
          { id: 'srv-101', name: 'Home Visit & Diagnostics', price: 249, duration: '30 mins', is_popular: true, description: 'Inspection of tripping MCB, short circuit, or socket fault' },
          { id: 'srv-102', name: 'Ceiling Fan Installation / Repair', price: 299, duration: '45 mins', is_popular: true, description: 'Complete mounting, balancing, and speed regulator tuning' },
          { id: 'srv-103', name: 'Complete Switchboard Replacement', price: 499, duration: '60 mins', is_popular: false, description: 'Safe replacement of modular switches, indicators, and fuse' },
          { id: 'srv-104', name: 'Inverter & Battery Setup', price: 999, duration: '90 mins', is_popular: false, description: 'Heavy-duty wiring, earthing check, and load distribution' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['home visit', 'emergency service', '30-day warranty', 'verified licensed', 'open today'],
        created_at: '2024-01-20T10:00:00Z'
      },

      // 2. Plumber - Verified
      {
        id: 'biz-plumb-1',
        name: 'Apex Flow Plumbing & Water Solutions',
        slug: 'apex-flow-plumbing-koramangala',
        category: 'Home Services',
        subcategory: 'Plumbers',
        description: 'Rapid response plumbers for leak detection, tap repair, bathroom fittings, water heater installation, and blocked drain clearance.',
        rating: 4.7,
        review_count: 98,
        price_tier: '₹₹',
        price_range_text: '₹299 - ₹899',
        is_verified: true,
        verification_date: '2024-04-10',
        verification_badge_text: 'Verified via Bangalore Water Board (BWSSB) Certified Plumber ID #PL-8831',
        phone: '+91 80 2553 4412',
        email: 'contact@apexflow.co.in',
        website: 'https://apexflow.co.in',
        address: '18, 5th Block, 1st Cross, Koramangala',
        city: 'Bengaluru',
        area: 'Koramangala',
        pincode: '560034',
        latitude: 12.9352,
        longitude: 77.6245,
        opening_hours: {
          monday: { open: '08:30', close: '21:30', closed: false },
          tuesday: { open: '08:30', close: '21:30', closed: false },
          wednesday: { open: '08:30', close: '21:30', closed: false },
          thursday: { open: '08:30', close: '21:30', closed: false },
          friday: { open: '08:30', close: '21:30', closed: false },
          saturday: { open: '08:30', close: '21:30', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false }
        },
        services: [
          { id: 'srv-201', name: 'Tap & Faucet Repair/Replacement', price: 299, duration: '30 mins', is_popular: true, description: 'Fix dripping faucets, washers, and mixer valves' },
          { id: 'srv-202', name: 'Clogged Drain & Pipe Unblocking', price: 449, duration: '45 mins', is_popular: true, description: 'High-pressure clearance of kitchen sinks and bathroom traps' },
          { id: 'srv-203', name: 'Geyser / Water Heater Connection', price: 599, duration: '60 mins', is_popular: false, description: 'Pressure valve fitting and secure inlet/outlet plumbing' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['same-day', 'drain cleaning', 'tap repair', 'verified technician'],
        created_at: '2024-02-05T09:30:00Z'
      },

      // 3. Restaurant - Verified
      {
        id: 'biz-rest-1',
        name: 'The Spice Garden Bistro & Cafe',
        slug: 'the-spice-garden-bistro-indiranagar',
        category: 'Restaurants & Cafes',
        subcategory: 'Casual Dining',
        description: 'Vibrant indoor & rooftop garden bistro serving authentic wood-fired pizzas, coastal delicacies, craft coffees, and artisanal mocktails.',
        rating: 4.6,
        review_count: 310,
        price_tier: '₹₹',
        price_range_text: '₹350 - ₹700 for two',
        is_verified: true,
        verification_date: '2024-03-22',
        verification_badge_text: 'Verified via FSSAI License #11221334000189 & BBMP Food Safety Audit',
        phone: '+91 80 4965 2100',
        email: 'reservations@spicegarden.com',
        website: 'https://spicegarden.com',
        address: '777/A, 12th Main Road, Indiranagar',
        city: 'Bengaluru',
        area: 'Indiranagar',
        pincode: '560038',
        latitude: 12.9715,
        longitude: 77.6412,
        opening_hours: {
          monday: { open: '11:30', close: '23:30', closed: false },
          tuesday: { open: '11:30', close: '23:30', closed: false },
          wednesday: { open: '11:30', close: '23:30', closed: false },
          thursday: { open: '11:30', close: '23:30', closed: false },
          friday: { open: '11:30', close: '00:30', closed: false },
          saturday: { open: '11:30', close: '00:30', closed: false },
          sunday: { open: '11:30', close: '23:30', closed: false }
        },
        services: [
          { id: 'srv-301', name: 'Artisan Wood-Fired Margherita Pizza', price: 380, duration: '20 mins', is_popular: true, description: 'San Marzano tomatoes, fresh buffalo mozzarella, and basil' },
          { id: 'srv-302', name: 'Coastal Coconut Fish Curry with Rice', price: 440, duration: '25 mins', is_popular: true, description: 'Traditional Mangalorean spices with fresh catch of the day' },
          { id: 'srv-303', name: 'Cold Brew Hazelnut Latte', price: 190, duration: '10 mins', is_popular: false, description: '18-hour steeped single-origin Arabica with hazelnut notes' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['outdoor seating', 'wifi', 'fssai certified', 'pet friendly', 'live music'],
        created_at: '2024-01-15T08:00:00Z'
      },

      // 4. Restaurant - Affordable Budget Friendly - Unverified Demo Status
      {
        id: 'biz-rest-2',
        name: 'Annapurna Tiffin & Meals',
        slug: 'annapurna-tiffin-koramangala',
        category: 'Restaurants & Cafes',
        subcategory: 'South Indian & Thalis',
        description: 'Wholesome, budget-friendly South Indian tiffins, crispy ghee roast dosas, and unlimited mini executive meals.',
        rating: 4.4,
        review_count: 85,
        price_tier: '₹',
        price_range_text: '₹80 - ₹220 for two',
        is_verified: false,
        verification_date: null,
        verification_badge_text: 'Pending documentation review by LocalConnect safety team',
        phone: '+91 80 2552 1099',
        email: 'info@annapurnatiffins.in',
        website: null,
        address: '89, 7th Main, 4th Block, Koramangala',
        city: 'Bengaluru',
        area: 'Koramangala',
        pincode: '560034',
        latitude: 12.9320,
        longitude: 77.6280,
        opening_hours: {
          monday: { open: '07:00', close: '22:00', closed: false },
          tuesday: { open: '07:00', close: '22:00', closed: false },
          wednesday: { open: '07:00', close: '22:00', closed: false },
          thursday: { open: '07:00', close: '22:00', closed: false },
          friday: { open: '07:00', close: '22:00', closed: false },
          saturday: { open: '07:00', close: '22:00', closed: false },
          sunday: { open: '07:00', close: '22:00', closed: false }
        },
        services: [
          { id: 'srv-311', name: 'Special Ghee Masala Dosa', price: 95, duration: '10 mins', is_popular: true, description: 'Golden crisp fermented crepe served with 3 chutneys & sambar' },
          { id: 'srv-312', name: 'Executive South Indian Meal Combo', price: 150, duration: '15 mins', is_popular: true, description: 'Rice, sambar, rasam, kootu, poriyal, papad, curd and payasam' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['affordable', 'quick bite', 'vegetarian', 'pure veg'],
        created_at: '2024-03-05T12:00:00Z'
      },

      // 5. Healthcare & Dentist - Verified
      {
        id: 'biz-dent-1',
        name: 'SmileCare Multispeciality Dental Clinic',
        slug: 'smilecare-multispeciality-dental-indiranagar',
        category: 'Healthcare & Dental',
        subcategory: 'Dentists',
        description: 'State-of-the-art dental care offering painless root canals, invisible aligners, teeth whitening, pediatric dentistry, and digital X-rays.',
        rating: 4.9,
        review_count: 178,
        price_tier: '₹₹',
        price_range_text: '₹400 - ₹2,500',
        is_verified: true,
        verification_date: '2024-02-10',
        verification_badge_text: 'Verified via Dental Council of India (DCI) Reg #DCI-29910 & Clinical Establishment Act',
        phone: '+91 80 4115 8890',
        email: 'appointments@smilecaredental.in',
        website: 'https://smilecaredental.in',
        address: '540, CMH Road, Near Indiranagar Metro Station',
        city: 'Bengaluru',
        area: 'Indiranagar',
        pincode: '560038',
        latitude: 12.9789,
        longitude: 77.6440,
        opening_hours: {
          monday: { open: '09:00', close: '20:30', closed: false },
          tuesday: { open: '09:00', close: '20:30', closed: false },
          wednesday: { open: '09:00', close: '20:30', closed: false },
          thursday: { open: '09:00', close: '20:30', closed: false },
          friday: { open: '09:00', close: '20:30', closed: false },
          saturday: { open: '09:00', close: '20:30', closed: false },
          sunday: { open: '10:00', close: '14:00', closed: false }
        },
        services: [
          { id: 'srv-401', name: 'Comprehensive Dental Consultation & X-Ray', price: 400, duration: '30 mins', is_popular: true, description: 'Oral examination with intraoral camera and digital RVG scan' },
          { id: 'srv-402', name: 'Ultrasonic Teeth Cleaning & Polishing', price: 950, duration: '45 mins', is_popular: true, description: 'Stain and calculus removal with fluoride protective polish' },
          { id: 'srv-403', name: 'Single-Sitting Rotary Root Canal', price: 3499, duration: '60 mins', is_popular: false, description: 'Computerized rotary endodontics with dental crown planning' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['open today', 'dentist near metro', 'digital x-ray', 'verified doctor', 'wheelchair accessible'],
        created_at: '2024-01-08T09:00:00Z'
      },

      // 6. Salons & Beauty - Under ₹500 offerings - Verified
      {
        id: 'biz-salon-1',
        name: 'GlowStyle Unisex Salon & Spa',
        slug: 'glowstyle-unisex-salon-hsr',
        category: 'Salons & Beauty',
        subcategory: 'Hair & Skin Care',
        description: 'Modern styling studio offering haircut under ₹500, organic facials, beard grooming, bridal makeover, and relaxing head massages.',
        rating: 4.7,
        review_count: 164,
        price_tier: '₹₹',
        price_range_text: '₹199 - ₹1,500',
        is_verified: true,
        verification_date: '2024-06-01',
        verification_badge_text: 'Verified via Karnataka Shops & Commercial Establishment Certificate #EST-HSR-5412',
        phone: '+91 80 4370 2155',
        email: 'hello@glowstylesalon.com',
        website: 'https://glowstylesalon.com',
        address: '24, 27th Main Road, Sector 1, HSR Layout',
        city: 'Bengaluru',
        area: 'HSR Layout',
        pincode: '560102',
        latitude: 12.9121,
        longitude: 77.6446,
        opening_hours: {
          monday: { open: '09:30', close: '21:00', closed: false },
          tuesday: { open: '09:30', close: '21:00', closed: false },
          wednesday: { open: '09:30', close: '21:00', closed: false },
          thursday: { open: '09:30', close: '21:00', closed: false },
          friday: { open: '09:30', close: '21:00', closed: false },
          saturday: { open: '09:00', close: '21:30', closed: false },
          sunday: { open: '09:00', close: '21:30', closed: false }
        },
        services: [
          { id: 'srv-501', name: 'Precision Haircut & Wash (Men)', price: 299, duration: '30 mins', is_popular: true, description: 'Styling haircut with conditioning wash and blowdry' },
          { id: 'srv-502', name: 'Hair Trim & Styling (Women)', price: 499, duration: '40 mins', is_popular: true, description: 'Professional layers/feather trim with serum application' },
          { id: 'srv-503', name: 'Express Glow Fruit Facial', price: 450, duration: '35 mins', is_popular: true, description: 'Organic botanical cleanse, exfoliating scrub, and nourishing pack' },
          { id: 'srv-504', name: 'Beard Trim & Charcoal Detox', price: 249, duration: '25 mins', is_popular: false, description: 'Razor line finishing and hot towel beard conditioning' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['under 500', 'air conditioned', 'unisex', 'verified salon', 'appointment booking'],
        created_at: '2024-02-12T11:00:00Z'
      },

      // 7. Grocery Store - Highest Rating - Verified
      {
        id: 'biz-groc-1',
        name: 'NatureFresh Organic Supermarket',
        slug: 'naturefresh-organic-indiranagar',
        category: 'Grocery Stores',
        subcategory: 'Organic & Daily Essentials',
        description: 'Certified organic grocery offering farm-fresh fruits, unpolished grains, A2 desi cow dairy, gourmet ingredients, and same-day local delivery.',
        rating: 4.9,
        review_count: 220,
        price_tier: '₹₹',
        price_range_text: '₹50 - ₹1,800',
        is_verified: true,
        verification_date: '2024-01-30',
        verification_badge_text: 'Verified via Jaivik Bharat Organic Certification & FSSAI #11220331000911',
        phone: '+91 80 2521 8844',
        email: 'orders@naturefreshmarket.com',
        website: 'https://naturefreshmarket.com',
        address: '102, 6th Main Road, Defence Colony, Indiranagar',
        city: 'Bengaluru',
        area: 'Indiranagar',
        pincode: '560038',
        latitude: 12.9770,
        longitude: 77.6390,
        opening_hours: {
          monday: { open: '07:30', close: '22:00', closed: false },
          tuesday: { open: '07:30', close: '22:00', closed: false },
          wednesday: { open: '07:30', close: '22:00', closed: false },
          thursday: { open: '07:30', close: '22:00', closed: false },
          friday: { open: '07:30', close: '22:00', closed: false },
          saturday: { open: '07:30', close: '22:30', closed: false },
          sunday: { open: '07:30', close: '22:30', closed: false }
        },
        services: [
          { id: 'srv-601', name: 'Fresh Organic Farm Basket (5kg Assorted Veggies)', price: 349, duration: 'Instant pickup', is_popular: true, description: 'Chemical-free broccoli, greens, vine tomatoes, carrots and zucchini' },
          { id: 'srv-602', name: 'A2 Gir Cow Farm Fresh Milk (1L Glass Bottle)', price: 95, duration: 'Daily supply', is_popular: true, description: 'Raw whole milk cold-stored and delivered directly from certified farm' },
          { id: 'srv-603', name: 'Cold-Pressed Wood Ghani Groundnut Oil (1L)', price: 360, duration: 'Pantry item', is_popular: false, description: 'Traditional stone cold-pressed without chemical extraction' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['highest rating', 'organic certified', 'home delivery', 'fresh produce', 'open early'],
        created_at: '2024-01-18T07:30:00Z'
      },

      // 8. Electronics & Repairs - Screen & Laptop - Verified
      {
        id: 'biz-elecr-1',
        name: 'FixFast Mobile & Laptop Care Studio',
        slug: 'fixfast-mobile-laptop-repair-koramangala',
        category: 'Electronics & Repairs',
        subcategory: 'Mobile & Laptop Repair',
        description: 'Express repair lab for iPhone, Samsung, OnePlus screen replacements, MacBook logic board repair, battery replacement, and data recovery with 90-day warranty.',
        rating: 4.8,
        review_count: 195,
        price_tier: '₹₹',
        price_range_text: '₹499 - ₹4,500',
        is_verified: true,
        verification_date: '2024-03-14',
        verification_badge_text: 'Verified via ISO 9001:2015 Service Quality Standard & MSME Reg #UDYAM-KR-03-00918',
        phone: '+91 80 4152 7701',
        email: 'support@fixfastcare.in',
        website: 'https://fixfastcare.in',
        address: '22, Jyoti Nivas College Road, 5th Block, Koramangala',
        city: 'Bengaluru',
        area: 'Koramangala',
        pincode: '560034',
        latitude: 12.9348,
        longitude: 77.6190,
        opening_hours: {
          monday: { open: '10:00', close: '21:00', closed: false },
          tuesday: { open: '10:00', close: '21:00', closed: false },
          wednesday: { open: '10:00', close: '21:00', closed: false },
          thursday: { open: '10:00', close: '21:00', closed: false },
          friday: { open: '10:00', close: '21:00', closed: false },
          saturday: { open: '10:00', close: '21:00', closed: false },
          sunday: { open: '11:00', close: '19:00', closed: false }
        },
        services: [
          { id: 'srv-701', name: 'Smartphone Screen Replacement (OEM Grade)', price: 1899, duration: '45 mins', is_popular: true, description: 'Original high-brightness display glass replacement with 90-day touch warranty' },
          { id: 'srv-702', name: 'Battery Health Diagnosis & Replacement', price: 999, duration: '30 mins', is_popular: true, description: 'Certified lithium-ion high capacity battery with safety testing' },
          { id: 'srv-703', name: 'Laptop Deep Clean & Thermal Paste Service', price: 699, duration: '60 mins', is_popular: false, description: 'Cooling fan dust extraction and Arctic MX-4 thermal paste renewal' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['express repair', '90-day warranty', 'screen replacement', 'good reviews', 'verified workshop'],
        created_at: '2024-02-28T10:00:00Z'
      },

      // 9. Whitefield Electrician - for radius/location tests
      {
        id: 'biz-elec-2',
        name: 'ElectroPro Services Whitefield',
        slug: 'electropro-services-whitefield',
        category: 'Home Services',
        subcategory: 'Electricians',
        description: 'Resident electrical services for villas and tech park apartments in Whitefield, ITPL, and Hope Farm.',
        rating: 4.5,
        review_count: 53,
        price_tier: '₹₹',
        price_range_text: '₹300 - ₹1,500',
        is_verified: true,
        verification_date: '2024-05-02',
        verification_badge_text: 'Verified via Govt Electrical Contractor License #EL-KAR-2022-441',
        phone: '+91 80 2845 9110',
        email: 'info@electropro.co',
        website: 'https://electropro.co',
        address: '14, ITPL Main Road, Near Hope Farm, Whitefield',
        city: 'Bengaluru',
        area: 'Whitefield',
        pincode: '560066',
        latitude: 12.9698,
        longitude: 77.7500,
        opening_hours: {
          monday: { open: '08:00', close: '20:00', closed: false },
          tuesday: { open: '08:00', close: '20:00', closed: false },
          wednesday: { open: '08:00', close: '20:00', closed: false },
          thursday: { open: '08:00', close: '20:00', closed: false },
          friday: { open: '08:00', close: '20:00', closed: false },
          saturday: { open: '08:00', close: '20:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        services: [
          { id: 'srv-801', name: 'Apartment Wiring & DB Box Repair', price: 499, duration: '60 mins', is_popular: true, description: 'Phase balancing and short circuit tracking' }
        ],
        photos: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
        ],
        tags: ['home visit', 'whitefield specialist'],
        created_at: '2024-04-10T11:00:00Z'
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        business_id: 'biz-elec-1',
        user_id: 'usr-customer-1',
        user_name: 'Priya Narayanan',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        title: 'Prompt and highly professional service!',
        comment: 'Had a sudden sparking in our main distribution board on a Saturday evening. PowerVolt technician Rajesh arrived within 25 minutes, identified a burnt neutral wire, replaced it cleanly, and checked all switches. Transparent pricing with printed invoice.',
        is_verified_transaction: true,
        service_used: 'Home Visit & Diagnostics',
        owner_reply: {
          reply_text: 'Thank you Priya for your kind words! We take electrical safety very seriously and glad we could resolve the sparking quickly.',
          reply_date: '2024-06-12T14:30:00Z'
        },
        is_reported: false,
        report_reason: null,
        moderation_status: 'approved',
        created_at: '2024-06-11T19:40:00Z'
      },
      {
        id: 'rev-2',
        business_id: 'biz-elec-1',
        user_id: 'usr-cust-2',
        user_name: 'Arjun Mehta',
        user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        title: 'Installed 3 BLDC fans neatly',
        comment: 'Very polite team. Replaced our old fans with new energy saving BLDC fans without making any mess. Will definitely recommend them for electrical works in Indiranagar.',
        is_verified_transaction: true,
        service_used: 'Ceiling Fan Installation / Repair',
        owner_reply: null,
        is_reported: false,
        report_reason: null,
        moderation_status: 'approved',
        created_at: '2024-07-02T10:15:00Z'
      },
      {
        id: 'rev-3',
        business_id: 'biz-dent-1',
        user_id: 'usr-customer-1',
        user_name: 'Priya Narayanan',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        title: 'Truly painless dental visit',
        comment: 'Dr. Ananya explained the RVG scan in detail on the screen. The ultrasonic cleaning was gentle and took less than 40 minutes. The clinic is spotless and follows strict sterilization protocols.',
        is_verified_transaction: true,
        service_used: 'Ultrasonic Teeth Cleaning & Polishing',
        owner_reply: {
          reply_text: 'Thank you Priya! Maintaining patient comfort and world-class hygiene is our daily goal.',
          reply_date: '2024-08-01T12:00:00Z'
        },
        is_reported: false,
        report_reason: null,
        moderation_status: 'approved',
        created_at: '2024-07-31T16:00:00Z'
      },
      {
        id: 'rev-4',
        business_id: 'biz-salon-1',
        user_id: 'usr-cust-3',
        user_name: 'Rohit Verma',
        user_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        title: 'Best haircut in HSR under ₹500',
        comment: 'Stylist Karan really understood the hair texture and gave a great textured fade. Hair wash included at ₹299 is unbeatable value for the ambience.',
        is_verified_transaction: true,
        service_used: 'Precision Haircut & Wash (Men)',
        owner_reply: null,
        is_reported: false,
        report_reason: null,
        moderation_status: 'approved',
        created_at: '2024-08-15T18:20:00Z'
      },
      {
        id: 'rev-5',
        business_id: 'biz-elecr-1',
        user_id: 'usr-cust-4',
        user_name: 'Deepak Rao',
        user_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        title: 'Replaced broken iPhone 13 screen in 40 mins',
        comment: 'Screen cracked badly. Visited FixFast Koramangala. They tested touch, True Tone, and replaced the glass while I waited. Provided a 3-month written warranty card.',
        is_verified_transaction: true,
        service_used: 'Smartphone Screen Replacement (OEM Grade)',
        owner_reply: null,
        is_reported: false,
        report_reason: null,
        moderation_status: 'approved',
        created_at: '2024-09-02T13:45:00Z'
      }
    ],
    verification_requests: [
      {
        id: 'vreq-101',
        business_id: 'biz-rest-2',
        business_name: 'Annapurna Tiffin & Meals',
        owner_name: 'Ramesh Adiga',
        owner_email: 'info@annapurnatiffins.in',
        document_type: 'FSSAI License & Trade License',
        document_number: 'FSSAI-11224991000344',
        document_file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        notes: 'Submitted commercial trade license renewal and FSSAI certificate for Koramangala outlet.',
        submission_date: '2024-10-20T10:15:00Z',
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null
      },
      {
        id: 'vreq-100',
        business_id: 'biz-elec-1',
        business_name: 'PowerVolt Electrical & Home Automation',
        owner_name: 'Rajesh Sharma',
        owner_email: 'service@powervolt.in',
        document_type: 'Govt Electrical Contractor License',
        document_number: 'EL-KAR-2021-984',
        document_file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        notes: 'Verified against state registry and verified active GSTIN.',
        submission_date: '2024-05-15T09:00:00Z',
        reviewed_by: 'Sarah Jenkins (Admin)',
        reviewed_at: '2024-05-18T14:00:00Z',
        rejection_reason: null
      }
    ],
    inquiries: [
      {
        id: 'inq-1',
        business_id: 'biz-elec-1',
        customer_name: 'Priya Narayanan',
        customer_phone: '+91 97400 99887',
        service_requested: 'Home Visit & Diagnostics',
        message: 'Need urgent inspection for kitchen switchboard spark.',
        status: 'contacted',
        created_at: '2024-06-11T18:00:00Z'
      }
    ]
  };
}

class Database {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        const initialData = getInitialSeedData();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        this.data = initialData;
      } else {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial seed:', err);
      this.data = getInitialSeedData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  // --- BUSINESS OPERATIONS ---
  getBusinesses(filters = {}) {
    let list = [...this.data.businesses];

    // Reference coordinates for distance
    let userLat = filters.lat ? parseFloat(filters.lat) : null;
    let userLng = filters.lng ? parseFloat(filters.lng) : null;

    if (filters.area && (!userLat || !userLng)) {
      const resolved = resolveLocationCoordinates(filters.area);
      if (resolved) {
        userLat = resolved.lat;
        userLng = resolved.lng;
      }
    }

    // Attach computed dynamic properties (distance, open status)
    list = list.map(b => {
      const distance = (userLat && userLng)
        ? calculateHaversineDistance(userLat, userLng, b.latitude, b.longitude)
        : null;
      const hoursInfo = isBusinessOpenNow(b.opening_hours);
      return {
        ...b,
        distance_km: distance,
        is_open_now: hoursInfo.isOpen,
        hours_status: hoursInfo.statusText,
        closing_time: hoursInfo.closingTime || null
      };
    });

    // Query filter (search name, description, tags, services)
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.subcategory && b.subcategory.toLowerCase().includes(q)) ||
        b.description.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q)) ||
        b.services.some(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      list = list.filter(b => 
        b.category.toLowerCase() === cat ||
        (b.subcategory && b.subcategory.toLowerCase() === cat) ||
        b.category.toLowerCase().includes(cat)
      );
    }

    // Area or Pincode filter
    if (filters.area && filters.area.trim()) {
      const areaQ = filters.area.toLowerCase().trim();
      list = list.filter(b => 
        b.area.toLowerCase().includes(areaQ) ||
        b.city.toLowerCase().includes(areaQ) ||
        b.pincode.includes(areaQ) ||
        (b.distance_km !== null && b.distance_km <= (filters.radius ? parseFloat(filters.radius) : 10))
      );
    }

    // Max distance radius
    if (filters.radius && userLat && userLng) {
      const maxR = parseFloat(filters.radius);
      list = list.filter(b => b.distance_km !== null && b.distance_km <= maxR);
    }

    // Min rating
    if (filters.minRating) {
      const minR = parseFloat(filters.minRating);
      list = list.filter(b => b.rating >= minR);
    }

    // Price tier
    if (filters.priceTier && filters.priceTier !== 'all') {
      list = list.filter(b => b.price_tier === filters.priceTier);
    }

    // Max budget (checks services pricing)
    if (filters.maxBudget) {
      const maxB = parseFloat(filters.maxBudget);
      list = list.filter(b => b.services.some(s => s.price <= maxB));
    }

    // Verified only filter
    if (filters.verifiedOnly === true || filters.verifiedOnly === 'true') {
      list = list.filter(b => b.is_verified === true);
    }

    // Open now filter
    if (filters.openNow === true || filters.openNow === 'true') {
      list = list.filter(b => b.is_open_now === true);
    }

    // Sorting
    const sort = filters.sort || 'relevance';
    if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'distance' && userLat && userLng) {
      list.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    } else if (sort === 'reviews') {
      list.sort((a, b) => b.review_count - a.review_count);
    } else {
      // Relevance score: weighted combination of rating, verification boost, distance, review volume
      list.sort((a, b) => {
        const scoreA = (a.rating * 15) + (a.is_verified ? 25 : 0) + (a.distance_km != null ? Math.max(0, 30 - a.distance_km * 3) : 15);
        const scoreB = (b.rating * 15) + (b.is_verified ? 25 : 0) + (b.distance_km != null ? Math.max(0, 30 - b.distance_km * 3) : 15);
        return scoreB - scoreA;
      });
    }

    return list;
  }

  getBusinessById(id, userLat = null, userLng = null) {
    const b = this.data.businesses.find(item => item.id === id || item.slug === id);
    if (!b) return null;

    const distance = (userLat && userLng)
      ? calculateHaversineDistance(userLat, userLng, b.latitude, b.longitude)
      : null;
    const hoursInfo = isBusinessOpenNow(b.opening_hours);

    // Fetch reviews for this business
    const reviews = this.getReviews(b.id);

    return {
      ...b,
      distance_km: distance,
      is_open_now: hoursInfo.isOpen,
      hours_status: hoursInfo.statusText,
      closing_time: hoursInfo.closingTime || null,
      reviews_list: reviews
    };
  }

  createBusiness(businessData) {
    const id = `biz-${Date.now()}`;
    const slug = (businessData.name || 'business')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const newBusiness = {
      id,
      owner_id: businessData.owner_id || 'usr-owner-1',
      name: businessData.name,
      slug,
      category: businessData.category || 'Home Services',
      subcategory: businessData.subcategory || '',
      description: businessData.description || '',
      rating: 0.0,
      review_count: 0,
      price_tier: businessData.price_tier || '₹₹',
      price_range_text: businessData.price_range_text || 'Pricing upon inquiry',
      is_verified: false,
      verification_date: null,
      verification_badge_text: 'Pending verification documents submission',
      phone: businessData.phone,
      email: businessData.email,
      website: businessData.website || '',
      address: businessData.address,
      city: businessData.city || 'Bengaluru',
      area: businessData.area || 'Indiranagar',
      pincode: businessData.pincode || '560038',
      latitude: parseFloat(businessData.latitude) || 12.9784,
      longitude: parseFloat(businessData.longitude) || 77.6408,
      opening_hours: businessData.opening_hours || {
        monday: { open: '09:00', close: '20:00', closed: false },
        tuesday: { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday: { open: '09:00', close: '20:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: false }
      },
      services: businessData.services || [
        { id: `srv-${Date.now()}`, name: 'General Consultation', price: 199, duration: '30 mins', is_popular: true, description: 'Initial service inspection and estimate' }
      ],
      photos: businessData.photos && businessData.photos.length > 0 ? businessData.photos : [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
      ],
      tags: businessData.tags || ['local business', 'newly registered'],
      created_at: new Date().toISOString()
    };

    this.data.businesses.unshift(newBusiness);
    this.save();
    return newBusiness;
  }

  updateBusiness(id, updates) {
    const index = this.data.businesses.findIndex(b => b.id === id);
    if (index === -1) return null;

    this.data.businesses[index] = {
      ...this.data.businesses[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.businesses[index];
  }

  // --- REVIEWS OPERATIONS ---
  getReviews(businessId, sort = 'newest') {
    let reviews = this.data.reviews.filter(r => r.business_id === businessId && r.moderation_status !== 'removed');

    if (sort === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'lowest') {
      reviews.sort((a, b) => a.rating - b.rating);
    } else {
      reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return reviews;
  }

  createReview(reviewData) {
    const id = `rev-${Date.now()}`;
    const newReview = {
      id,
      business_id: reviewData.business_id,
      user_id: reviewData.user_id || 'usr-customer-1',
      user_name: reviewData.user_name || 'Anonymous Customer',
      user_avatar: reviewData.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: parseInt(reviewData.rating, 10) || 5,
      title: reviewData.title || '',
      comment: reviewData.comment,
      is_verified_transaction: !!reviewData.is_verified_transaction,
      service_used: reviewData.service_used || 'General Service',
      owner_reply: null,
      is_reported: false,
      report_reason: null,
      moderation_status: 'approved',
      created_at: new Date().toISOString()
    };

    this.data.reviews.unshift(newReview);

    // Recalculate business average rating & count
    this.recalculateBusinessRating(reviewData.business_id);
    this.save();
    return newReview;
  }

  recalculateBusinessRating(businessId) {
    const reviews = this.data.reviews.filter(r => r.business_id === businessId && r.moderation_status === 'approved');
    const biz = this.data.businesses.find(b => b.id === businessId);
    if (!biz) return;

    if (reviews.length === 0) {
      biz.rating = 0;
      biz.review_count = 0;
    } else {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      biz.rating = Math.round((sum / reviews.length) * 10) / 10;
      biz.review_count = reviews.length;
    }
  }

  replyToReview(reviewId, replyText) {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (!rev) return null;

    rev.owner_reply = {
      reply_text: replyText,
      reply_date: new Date().toISOString()
    };
    this.save();
    return rev;
  }

  reportReview(reviewId, reason) {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (!rev) return null;

    rev.is_reported = true;
    rev.report_reason = reason;
    rev.moderation_status = 'flagged';
    this.save();
    return rev;
  }

  // --- VERIFICATION WORKFLOW ---
  getVerificationRequests(status = null) {
    if (!status || status === 'all') {
      return this.data.verification_requests;
    }
    return this.data.verification_requests.filter(v => v.status === status);
  }

  createVerificationRequest(reqData) {
    const id = `vreq-${Date.now()}`;
    const newReq = {
      id,
      business_id: reqData.business_id,
      business_name: reqData.business_name,
      owner_name: reqData.owner_name,
      owner_email: reqData.owner_email,
      document_type: reqData.document_type || 'Trade License & GSTIN',
      document_number: reqData.document_number,
      document_file_url: reqData.document_file_url || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      notes: reqData.notes || '',
      submission_date: new Date().toISOString(),
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null
    };

    this.data.verification_requests.unshift(newReq);
    this.save();
    return newReq;
  }

  reviewVerificationRequest(requestId, status, reviewerName = 'Admin', reason = null) {
    const req = this.data.verification_requests.find(v => v.id === requestId);
    if (!req) return null;

    req.status = status; // 'approved' or 'rejected'
    req.reviewed_by = reviewerName;
    req.reviewed_at = new Date().toISOString();
    req.rejection_reason = reason;

    // If approved, update business verification flag
    const biz = this.data.businesses.find(b => b.id === req.business_id);
    if (biz) {
      if (status === 'approved') {
        biz.is_verified = true;
        biz.verification_date = new Date().toISOString().split('T')[0];
        biz.verification_badge_text = `Verified via ${req.document_type} #${req.document_number} by LocalConnect Trust & Safety`;
      } else if (status === 'rejected') {
        biz.is_verified = false;
        biz.verification_badge_text = `Verification Rejected: ${reason || 'Incomplete documentation'}`;
      }
    }

    this.save();
    return { request: req, business: biz };
  }

  // --- INQUIRIES ---
  createInquiry(inquiryData) {
    const id = `inq-${Date.now()}`;
    const newInquiry = {
      id,
      business_id: inquiryData.business_id,
      customer_name: inquiryData.customer_name,
      customer_phone: inquiryData.customer_phone,
      service_requested: inquiryData.service_requested || 'General Inquiry',
      message: inquiryData.message,
      status: 'new',
      created_at: new Date().toISOString()
    };
    this.data.inquiries.unshift(newInquiry);
    this.save();
    return newInquiry;
  }

  getInquiriesForBusiness(businessId) {
    return this.data.inquiries.filter(i => i.business_id === businessId);
  }

  // --- ADMIN STATS ---
  getAdminStats() {
    const totalBusinesses = this.data.businesses.length;
    const verifiedBusinesses = this.data.businesses.filter(b => b.is_verified).length;
    const pendingVerifications = this.data.verification_requests.filter(v => v.status === 'pending').length;
    const totalReviews = this.data.reviews.length;
    const flaggedReviews = this.data.reviews.filter(r => r.moderation_status === 'flagged').length;

    return {
      totalBusinesses,
      verifiedBusinesses,
      unverifiedBusinesses: totalBusinesses - verifiedBusinesses,
      verificationRate: Math.round((verifiedBusinesses / (totalBusinesses || 1)) * 100),
      pendingVerifications,
      totalReviews,
      flaggedReviews,
      totalUsers: this.data.users.length
    };
  }
}

// Singleton database instance
const db = new Database();

module.exports = db;
