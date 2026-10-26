const db = require('../db/database');
const { resolveLocationCoordinates, calculateHaversineDistance } = require('./geoService');

// Keyword dictionaries for Category Mapping
const CATEGORY_MAP = {
  'home services': ['electrician', 'electrical', 'wire', 'wiring', 'switchboard', 'mcb', 'fan', 'plumber', 'plumbing', 'leak', 'drain', 'pipe', 'tap', 'geyser', 'carpenter', 'pest control', 'ac repair'],
  'electricians': ['electrician', 'electrical', 'wiring', 'switchboard', 'power cut', 'short circuit', 'fan repair', 'inverter'],
  'plumbers': ['plumber', 'plumbing', 'tap repair', 'pipe leak', 'drainage', 'geyser fitting', 'water leakage'],
  'restaurants & cafes': ['restaurant', 'cafe', 'food', 'eat', 'dinner', 'lunch', 'breakfast', 'dosa', 'biryani', 'pizza', 'coffee', 'bistro', 'meal', 'tiffin'],
  'healthcare & dental': ['dentist', 'dental', 'teeth', 'tooth', 'doctor', 'clinic', 'hospital', 'root canal', 'cleaning', 'consultation', 'physician', 'health'],
  'salons & beauty': ['salon', 'haircut', 'beauty', 'spa', 'facial', 'hair', 'grooming', 'beard', 'makeover', 'parlour'],
  'grocery stores': ['grocery', 'supermarket', 'organic', 'vegetable', 'fruit', 'milk', 'kirana', 'provisions', 'store', 'market'],
  'electronics & repairs': ['mobile repair', 'phone screen', 'laptop repair', 'battery replacement', 'electronics', 'screen', 'iphone', 'macbook', 'display', 'computer']
};

/**
 * Extracts structured intent and search parameters from user query
 */
function parseUserQuery(query, userLocation = null, conversationHistory = []) {
  const text = query.toLowerCase();
  const intent = {
    category: null,
    subcategory: null,
    area: userLocation ? userLocation.area : null,
    pincode: userLocation ? userLocation.pincode : null,
    lat: userLocation ? userLocation.lat : null,
    lng: userLocation ? userLocation.lng : null,
    maxBudget: null,
    minRating: null,
    verifiedOnly: false,
    openNow: false,
    needsLocationPrompt: false,
    isGreeting: false,
    isComparisonRequest: false,
    isDirectionsRequest: false,
    isHelpRequest: false
  };

  // 1. Detect greetings or help
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste)\b/i.test(text.trim())) {
    intent.isGreeting = true;
  }
  if (/help|what can you do|how does this work|features/i.test(text)) {
    intent.isHelpRequest = true;
  }
  if (/compare|comparison|versus|vs/i.test(text)) {
    intent.isComparisonRequest = true;
  }
  if (/direction|how to reach|route|map to/i.test(text)) {
    intent.isDirectionsRequest = true;
  }

  // 2. Detect category
  if (/electrician|electrical|wiring|mcb|short circuit/i.test(text)) {
    intent.category = 'Home Services';
    intent.subcategory = 'Electricians';
  } else if (/plumber|plumbing|tap|drain|pipe|leak/i.test(text)) {
    intent.category = 'Home Services';
    intent.subcategory = 'Plumbers';
  } else if (/restaurant|cafe|dining|food|eat|pizza|bistro|meal|dosa|biryani|coffee/i.test(text)) {
    intent.category = 'Restaurants & Cafes';
  } else if (/dentist|dental|teeth|tooth|doctor|clinic|root canal/i.test(text)) {
    intent.category = 'Healthcare & Dental';
    intent.subcategory = 'Dentists';
  } else if (/salon|haircut|facial|spa|beauty|grooming|beard|parlour/i.test(text)) {
    intent.category = 'Salons & Beauty';
  } else if (/grocery|supermarket|organic|kirana|provisions|veggies|vegetables/i.test(text)) {
    intent.category = 'Grocery Stores';
  } else if (/mobile|phone screen|laptop repair|electronics repair|battery replace/i.test(text)) {
    intent.category = 'Electronics & Repairs';
  }

  // 3. Extract Area or PIN code
  const pincodeMatch = text.match(/\b(560\d{3}|[1-9]\d{5})\b/);
  if (pincodeMatch) {
    intent.pincode = pincodeMatch[1];
    const resolved = resolveLocationCoordinates(intent.pincode);
    if (resolved) {
      intent.area = resolved.area || intent.pincode;
      intent.lat = resolved.lat;
      intent.lng = resolved.lng;
    }
  } else {
    // Check for common Bangalore areas
    const areas = ['indiranagar', 'koramangala', 'hsr layout', 'hsr', 'whitefield', 'jayanagar', 'malleshwaram', 'electronic city', 'mg road'];
    for (const a of areas) {
      if (text.includes(a)) {
        intent.area = a;
        const resolved = resolveLocationCoordinates(a);
        if (resolved) {
          intent.lat = resolved.lat;
          intent.lng = resolved.lng;
        }
        break;
      }
    }
  }

  // Check if user said "near me" or "nearby" but no location coordinates are set
  if ((text.includes('near me') || text.includes('nearby') || text.includes('in my area')) && !intent.area && !intent.lat) {
    intent.needsLocationPrompt = true;
  }

  // 4. Budget extraction (e.g. "under ₹500", "below 500", "under 1000")
  const budgetMatch = text.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (budgetMatch) {
    intent.maxBudget = parseInt(budgetMatch[1], 10);
  }

  // Affordable tag
  if (/affordable|cheap|budget friendly|low cost|economical/i.test(text)) {
    if (!intent.maxBudget) intent.maxBudget = 500;
  }

  // 5. Rating preferences (e.g. "best", "highest rating", "top rated", "above 4.5")
  if (/best|highest rating|top rated|good reviews|highest rated/i.test(text)) {
    intent.minRating = 4.5;
  }

  // 6. Availability & Verification
  if (/open today|open now|available right now|available today/i.test(text)) {
    intent.openNow = true;
  }
  if (/verified|certified|licensed|trusted/i.test(text)) {
    intent.verifiedOnly = true;
  }

  return intent;
}

/**
 * Builds dynamic conversational reasoning for why each business is recommended
 */
function buildRecommendationExplanation(businesses, intent) {
  if (businesses.length === 0) {
    let reason = "I couldn't find any businesses strictly matching all criteria";
    if (intent.category) reason += ` in ${intent.category}`;
    if (intent.area) reason += ` around ${intent.area}`;
    if (intent.maxBudget) reason += ` under ₹${intent.maxBudget}`;
    reason += ". Try expanding the search radius, choosing another category, or removing budget filters.";
    return reason;
  }

  const top = businesses[0];
  const count = businesses.length;
  const areaLabel = intent.area ? `in/near ${intent.area}` : 'near your selected location';

  let explanation = `I found ${count} great ${intent.category || 'local'} option${count > 1 ? 's' : ''} ${areaLabel}. \n\n`;

  // Highlight top match
  explanation += `**Top Recommendation:** **${top.name}** (${top.rating} ★, ${top.review_count} reviews) `;
  
  if (top.is_verified) {
    explanation += `is **fully verified** via verified license, `;
  } else {
    explanation += `is a recognized local provider, `;
  }

  if (top.distance_km !== null) {
    explanation += `located just **${top.distance_km} km away**. `;
  }

  if (intent.maxBudget && top.services) {
    const matchingService = top.services.find(s => s.price <= intent.maxBudget);
    if (matchingService) {
      explanation += `They offer *${matchingService.name}* starting at only **₹${matchingService.price}** (within your ₹${intent.maxBudget} budget). `;
    }
  }

  if (top.is_open_now) {
    explanation += `They are **open right now** (${top.hours_status}).`;
  } else {
    explanation += `${top.hours_status}.`;
  }

  if (count > 1) {
    const second = businesses[1];
    explanation += `\n\nAnother reliable alternative is **${second.name}** with a ${second.rating} ★ rating and ${second.price_range_text}.`;
  }

  return explanation;
}

/**
 * Generates interactive follow-up chips based on intent and results
 */
function generateFollowUps(intent, results) {
  const followUps = [];

  if (results.length > 0) {
    if (results.length >= 2) {
      followUps.push({
        label: `Compare top ${Math.min(results.length, 3)} businesses`,
        action: 'compare',
        payload: { businessIds: results.slice(0, 3).map(b => b.id) }
      });
    }

    followUps.push({
      label: '🗺️ View on Map',
      action: 'view_map',
      payload: { lat: results[0].latitude, lng: results[0].longitude }
    });

    if (!intent.verifiedOnly && results.some(b => !b.is_verified)) {
      followUps.push({
        label: '🛡️ Only Show Verified',
        action: 'filter_verified'
      });
    }

    if (!intent.openNow) {
      followUps.push({
        label: '🕒 Only Open Now',
        action: 'filter_open_now'
      });
    }
  }

  // Category pivots
  followUps.push({ label: '⚡ Electricians', action: 'query', text: 'Find electricians near me' });
  followUps.push({ label: '🔧 Plumbers', action: 'query', text: 'Find reliable plumbers nearby' });
  followUps.push({ label: '🍽️ Restaurants', action: 'query', text: 'Suggest affordable restaurants' });
  followUps.push({ label: '🏥 Healthcare', action: 'query', text: 'Find dentist open today' });

  return followUps.slice(0, 5);
}

/**
 * Main AI Chatbot Handler
 */
async function processChatMessage({ message, userLocation, conversationHistory = [] }) {
  const parsedIntent = parseUserQuery(message, userLocation, conversationHistory);

  // If user says "hi" or general greeting without a specific query
  if (parsedIntent.isGreeting && !parsedIntent.category) {
    return {
      message: "Hi! 👋 Welcome to **LocalConnect**. I'm your local discovery assistant.\n\nI can help you find verified shops, service providers, restaurants, and specialists near you with authentic reviews and transparent pricing.\n\nWhat are you looking for today?",
      businessCards: [],
      suggestedFollowUps: [
        { label: '⚡ Best Electricians', action: 'query', text: 'Find the best electrician near me' },
        { label: '🍽️ Affordable Food', action: 'query', text: 'Suggest affordable restaurants nearby' },
        { label: '🦷 Dentists Open Today', action: 'query', text: 'Find a dentist who is open today' },
        { label: '💇 Salons under ₹500', action: 'query', text: 'Find a salon offering services under ₹500' },
        { label: '📱 Phone Screen Repair', action: 'query', text: 'Show me mobile repair shops with good reviews' }
      ],
      intent: parsedIntent
    };
  }

  // If user says "near me" or asks for service without location
  if (parsedIntent.needsLocationPrompt && !parsedIntent.area && !userLocation) {
    return {
      message: `I'd love to find the best ${parsedIntent.subcategory || parsedIntent.category || 'services'} for you! 📍\n\nCould you please share your **area name** (e.g. *Indiranagar, Koramangala, HSR Layout*) or **6-digit PIN code**? Or tap **"Use My Location"** on top to enable automatic GPS discovery.`,
      businessCards: [],
      suggestedFollowUps: [
        { label: '📍 Indiranagar (560038)', action: 'set_area', area: 'Indiranagar' },
        { label: '📍 Koramangala (560034)', action: 'set_area', area: 'Koramangala' },
        { label: '📍 HSR Layout (560102)', action: 'set_area', area: 'HSR Layout' },
        { label: '📍 Whitefield (560066)', action: 'set_area', area: 'Whitefield' }
      ],
      intent: parsedIntent
    };
  }

  // Query database with parsed filters
  const filters = {
    query: parsedIntent.category ? null : message,
    category: parsedIntent.category,
    area: parsedIntent.area,
    lat: parsedIntent.lat,
    lng: parsedIntent.lng,
    radius: 12, // default 12 km
    minRating: parsedIntent.minRating,
    maxBudget: parsedIntent.maxBudget,
    verifiedOnly: parsedIntent.verifiedOnly,
    openNow: parsedIntent.openNow,
    sort: 'relevance'
  };

  let matchingBusinesses = db.getBusinesses(filters);

  // If subcategory was detected (e.g., Electricians vs Plumbers in Home Services), refine further
  if (parsedIntent.subcategory) {
    const subFiltered = matchingBusinesses.filter(b => 
      b.subcategory && b.subcategory.toLowerCase().includes(parsedIntent.subcategory.toLowerCase())
    );
    if (subFiltered.length > 0) {
      matchingBusinesses = subFiltered;
    }
  }

  // If strict area filtering returned empty, fallback to citywide with note
  let fallbackNote = '';
  if (matchingBusinesses.length === 0 && (parsedIntent.area || parsedIntent.maxBudget)) {
    const relaxed = db.getBusinesses({
      category: parsedIntent.category,
      sort: 'rating'
    });
    if (relaxed.length > 0) {
      matchingBusinesses = relaxed;
      fallbackNote = `*(Note: No exact matches found in "${parsedIntent.area || ''}" with your current filters. Showing top verified options across Bengaluru)*\n\n`;
    }
  }

  // Build natural language reasoning and explanation
  const explanation = fallbackNote + buildRecommendationExplanation(matchingBusinesses, parsedIntent);

  // Suggested follow-ups
  const followUps = generateFollowUps(parsedIntent, matchingBusinesses);

  return {
    message: explanation,
    businessCards: matchingBusinesses.slice(0, 4), // Top 4 recommendations
    totalMatches: matchingBusinesses.length,
    suggestedFollowUps: followUps,
    intent: parsedIntent
  };
}

module.exports = {
  parseUserQuery,
  processChatMessage,
  buildRecommendationExplanation
};
