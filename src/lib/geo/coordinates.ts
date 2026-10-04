import { GeoPoint, ScreenPosition } from '../../types/map';

/**
 * Standard Web Mercator (EPSG:3857) projection math
 * Converts geographic WGS84 Latitude and Longitude to normalized coordinates [0, 1]
 */
export function latLngToNormalizedMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng + 180) / 360;
  const sinLatitude = Math.sin((lat * Math.PI) / 180);
  // Clamp latitude to standard Web Mercator range [-85.05112878, 85.05112878]
  const clampedSin = Math.min(Math.max(sinLatitude, -0.9999), 0.9999);
  const y = 0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI);
  return { x, y };
}

/**
 * Converts geographic coordinates to pixel coordinates on a viewport
 * given map center, zoom level, and container dimensions.
 */
export function geoToScreenPixel(
  point: GeoPoint,
  center: GeoPoint,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number
): ScreenPosition {
  const scale = 256 * Math.pow(2, zoom);
  const pointMercator = latLngToNormalizedMercator(point.lat, point.lng);
  const centerMercator = latLngToNormalizedMercator(center.lat, center.lng);

  const x = (pointMercator.x - centerMercator.x) * scale + viewportWidth / 2;
  const y = (pointMercator.y - centerMercator.y) * scale + viewportHeight / 2;

  return { x, y };
}

/**
 * Haversine formula to compute great-circle distance in kilometers
 */
export function calculateDistanceKm(coord1: GeoPoint, coord2: GeoPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Real Bali Geographic Boundary and Key Waypoints
 */
export const BALI_BOUNDS = {
  minLat: -8.9056,
  maxLat: -8.0521,
  minLng: 114.4312,
  maxLng: 115.7534,
  center: { lat: -8.6850, lng: 115.2200 }, // Central South Bali Corridor
  defaultZoom: 11.5
};
