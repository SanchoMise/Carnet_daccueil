/** 6 passage Rauch, 75011 Paris — geocoded once via Nominatim/OpenStreetMap. */
export const APARTMENT_COORDS = { lat: 48.8539952, lon: 2.3791617 };

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimates walking minutes from the apartment using straight-line distance,
 * an average walking speed (~4.8 km/h) and a detour factor (~1.3x) to
 * account for streets not being a straight line. No routing API needed.
 */
export function estimateWalkMinutesFromApartment(lat: number, lon: number): number {
  const distanceMeters = haversineMeters(APARTMENT_COORDS.lat, APARTMENT_COORDS.lon, lat, lon);
  const walkingSpeedMetersPerMin = 80; // 4.8 km/h
  const detourFactor = 1.3;
  const minutes = (distanceMeters * detourFactor) / walkingSpeedMetersPerMin;
  return Math.max(1, Math.round(minutes));
}
