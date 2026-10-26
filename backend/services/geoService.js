// Geolocation and Business Hours Utility Service

// Preset reference coordinates for areas & PIN codes
const AREA_COORDINATES = {
  // Bangalore (default hub)
  'indiranagar': { lat: 12.9784, lng: 77.6408, pincode: '560038', city: 'Bengaluru' },
  'koramangala': { lat: 12.9352, lng: 77.6245, pincode: '560034', city: 'Bengaluru' },
  'hsr layout': { lat: 12.9121, lng: 77.6446, pincode: '560102', city: 'Bengaluru' },
  'hsr': { lat: 12.9121, lng: 77.6446, pincode: '560102', city: 'Bengaluru' },
  'whitefield': { lat: 12.9698, lng: 77.7500, pincode: '560066', city: 'Bengaluru' },
  'jayanagar': { lat: 12.9308, lng: 77.5838, pincode: '560041', city: 'Bengaluru' },
  'malleshwaram': { lat: 13.0031, lng: 77.5643, pincode: '560003', city: 'Bengaluru' },
  'electronic city': { lat: 12.8399, lng: 77.6770, pincode: '560100', city: 'Bengaluru' },
  'mg road': { lat: 12.9756, lng: 77.6066, pincode: '560001', city: 'Bengaluru' },
  // PIN code lookups
  '560038': { lat: 12.9784, lng: 77.6408, area: 'Indiranagar', city: 'Bengaluru' },
  '560034': { lat: 12.9352, lng: 77.6245, area: 'Koramangala', city: 'Bengaluru' },
  '560102': { lat: 12.9121, lng: 77.6446, area: 'HSR Layout', city: 'Bengaluru' },
  '560066': { lat: 12.9698, lng: 77.7500, area: 'Whitefield', city: 'Bengaluru' },
  '560041': { lat: 12.9308, lng: 77.5838, area: 'Jayanagar', city: 'Bengaluru' },
  '560001': { lat: 12.9756, lng: 77.6066, area: 'MG Road', city: 'Bengaluru' }
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Resolves location string (area name or PIN code) to coordinates
 */
function resolveLocationCoordinates(queryStr) {
  if (!queryStr) return null;
  const normalized = queryStr.trim().toLowerCase();

  // Direct lookup
  if (AREA_COORDINATES[normalized]) {
    return AREA_COORDINATES[normalized];
  }

  // Substring match
  for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Default fallback center (Indiranagar / Bangalore)
  return { lat: 12.9784, lng: 77.6408, area: queryStr, city: 'Bengaluru' };
}

/**
 * Determines whether a business is currently open based on operating_hours
 * opening_hours format: { "monday": { "open": "09:00", "close": "21:00", "closed": false }, ... }
 */
function isBusinessOpenNow(openingHours) {
  if (!openingHours || typeof openingHours !== 'object') {
    return { isOpen: true, statusText: 'Hours not specified', isAvailable: true };
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const daySchedule = openingHours[currentDay];

  if (!daySchedule || daySchedule.closed) {
    return {
      isOpen: false,
      statusText: 'Closed Today',
      isAvailable: false,
      nextOpen: 'Tomorrow'
    };
  }

  if (daySchedule.is24Hours) {
    return {
      isOpen: true,
      statusText: 'Open 24 Hours',
      isAvailable: true
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (daySchedule.open || '09:00').split(':').map(Number);
  const [closeH, closeM] = (daySchedule.close || '21:00').split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const closesInMinutes = closeMinutes - currentMinutes;
    const formatTime = (h, m) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const standardH = h % 12 || 12;
      return `${standardH}:${m < 10 ? '0' + m : m} ${suffix}`;
    };

    if (closesInMinutes <= 60) {
      return {
        isOpen: true,
        statusText: `Closes soon (${formatTime(closeH, closeM)})`,
        isAvailable: true,
        closingTime: formatTime(closeH, closeM)
      };
    }

    return {
      isOpen: true,
      statusText: `Open Now • Closes ${formatTime(closeH, closeM)}`,
      isAvailable: true,
      closingTime: formatTime(closeH, closeM)
    };
  } else {
    const formatTime = (h, m) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const standardH = h % 12 || 12;
      return `${standardH}:${m < 10 ? '0' + m : m} ${suffix}`;
    };

    if (currentMinutes < openMinutes) {
      return {
        isOpen: false,
        statusText: `Closed • Opens at ${formatTime(openH, openM)}`,
        isAvailable: false
      };
    } else {
      return {
        isOpen: false,
        statusText: `Closed for today • Opens tomorrow`,
        isAvailable: false
      };
    }
  }
}

module.exports = {
  AREA_COORDINATES,
  calculateHaversineDistance,
  resolveLocationCoordinates,
  isBusinessOpenNow
};
