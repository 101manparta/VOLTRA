import { describe, it, expect } from 'vitest';
import { MOCK_STATIONS } from '../../src/services/mock/stationsData';

// Haversine distance formula replicating PostGIS ST_Distance(geography, geography)
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

describe('Geospatial & PostGIS Distance Verification (Sections 8, 11, 38)', () => {
  it('validates all Bali chargers possess accurate WGS84 real-world coordinates', () => {
    expect(MOCK_STATIONS.length).toBeGreaterThan(0);

    for (const station of MOCK_STATIONS) {
      // Bali latitude is strictly between -8.0 and -9.0
      expect(station.coordinates.lat).toBeLessThan(-8.0);
      expect(station.coordinates.lat).toBeGreaterThan(-9.0);

      // Bali longitude is strictly between 114.4 and 115.8
      expect(station.coordinates.lng).toBeGreaterThan(114.4);
      expect(station.coordinates.lng).toBeLessThan(115.8);

      // Connectors must not be empty
      expect(station.connectors.length).toBeGreaterThan(0);
      expect(station.pricingPerKwh).toBeGreaterThan(0);
    }
  });

  it('correctly calculates geographic distance between Sanur and Denpasar hubs', () => {
    const sanur = MOCK_STATIONS.find(s => s.name.includes('Sanur'))!;
    const denpasar = MOCK_STATIONS.find(s => s.name.includes('Denpasar'))!;

    const distKm = calculateHaversineDistanceKm(
      sanur.coordinates.lat,
      sanur.coordinates.lng,
      denpasar.coordinates.lat,
      denpasar.coordinates.lng
    );

    // Sanur to Denpasar center is geographically ~4-6 km
    expect(distKm).toBeGreaterThan(3.0);
    expect(distKm).toBeLessThan(8.0);
  });

  it('correctly filters stations within a 10 km radius', () => {
    const userLoc = { lat: -8.6920, lng: 115.2250 }; // Sanur / Renon corridor
    const nearby = MOCK_STATIONS.filter(s => {
      const dist = calculateHaversineDistanceKm(
        userLoc.lat,
        userLoc.lng,
        s.coordinates.lat,
        s.coordinates.lng
      );
      return dist <= 10.0;
    });

    expect(nearby.length).toBeGreaterThanOrEqual(2);
    // Nusa Dua is further south (~14 km) so it should not be in the immediate 10km radius
    const nusaDua = nearby.find(s => s.name.includes('Nusa Dua'));
    expect(nusaDua).toBeUndefined();
  });
});
