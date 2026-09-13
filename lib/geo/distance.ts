import { AREAS } from "@/data/areas";
import { Area } from "@/types";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Finds the nearest known Karachi area to an arbitrary coordinate. */
export function findNearestArea(
  latitude: number,
  longitude: number,
  areas: Area[] = AREAS
): { area: Area; distanceKm: number } {
  let nearest = areas[0];
  let nearestDist = Infinity;
  for (const area of areas) {
    const d = haversineKm(latitude, longitude, area.latitude, area.longitude);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = area;
    }
  }
  return { area: nearest, distanceKm: nearestDist };
}
