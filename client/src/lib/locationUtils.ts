/**
 * Calculate distance between two points in meters using the Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if player is within trigger radius of a location
 */
export const isWithinTriggerRadius = (
  playerLat: number, 
  playerLng: number, 
  locationLat: number, 
  locationLng: number, 
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(playerLat, playerLng, locationLat, locationLng);
  return distance <= radiusMeters;
};

/**
 * Generate a point at specified distance and bearing from start point
 * Useful for creating test points around the player
 */
export const generatePointAtDistance = (
  startLat: number, 
  startLng: number, 
  distanceMeters: number, 
  bearingDegrees: number
): { lat: number, lng: number } => {
  const R = 6371e3; // Earth's radius in meters
  const d = distanceMeters / R; // Angular distance in radians
  const θ = bearingDegrees * Math.PI / 180; // Bearing in radians
  
  const φ1 = startLat * Math.PI / 180; // Convert to radians
  const λ1 = startLng * Math.PI / 180;
  
  const sinφ2 = Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * Math.sin(d) * Math.cos(φ1);
  const x = Math.cos(d) - Math.sin(φ1) * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);
  
  // Convert back to degrees
  const newLat = φ2 * 180 / Math.PI;
  const newLng = λ2 * 180 / Math.PI;
  
  return { lat: newLat, lng: newLng };
};
