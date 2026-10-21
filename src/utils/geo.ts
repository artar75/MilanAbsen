/**
 * Geolocation and Haversine distance calculation utilities for Factory Geofencing
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance between two GPS coordinates using the Haversine formula (returns meters)
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Checks if a given coordinate is within a factory geofence radius
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  factoryLat: number,
  factoryLng: number,
  radiusMeters: number
): { isInside: boolean; distanceMeters: number } {
  const distanceMeters = calculateHaversineDistanceMeters(
    userLat,
    userLng,
    factoryLat,
    factoryLng
  );
  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

/**
 * Formats distance in readable meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Standard factory locations for Milan Keramik
 */
export const DEFAULT_FACTORY_ZONES = [
  {
    id: 'zone-gresik',
    departmentId: 'dept-prod',
    name: 'Pabrik Milan Keramik Gresik (Kiln & Produksi)',
    latitude: -7.15664,
    longitude: 112.65551,
    radiusMeters: 300,
    address: 'Kawasan Industri Gresik, Jawa Timur',
  },
  {
    id: 'zone-karawang',
    departmentId: 'dept-qc',
    name: 'Pabrik Milan Keramik Karawang (Glazing & QC)',
    latitude: -6.30561,
    longitude: 107.30124,
    radiusMeters: 250,
    address: 'Kawasan Industri KIIC, Karawang Barat',
  },
  {
    id: 'zone-gudang',
    departmentId: 'dept-log',
    name: 'Pusat Distribusi & Gudang Keramik',
    latitude: -7.25752,
    longitude: 112.75211,
    radiusMeters: 350,
    address: 'Kompleks Pergudangan Margomulyo, Surabaya',
  },
  {
    id: 'zone-jkt',
    departmentId: 'dept-hr',
    name: 'Kantor Pusat Milan Keramik Jakarta',
    latitude: -6.17511,
    longitude: 106.82718,
    radiusMeters: 150,
    address: 'Graha Milan Keramik, Jakarta Pusat',
  },
];
