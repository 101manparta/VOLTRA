/**
 * VOLTARA Deterministic Charger Recommendation Engine
 * 
 * Balances:
 * - Distance from user/route (30%)
 * - Charging confidence score (25%)
 * - Power rating & max speed (20%)
 * - Queue conditions & bay availability (15%)
 * - Telemetry data freshness (10%)
 */

import { ChargingStation } from '../types/station';
import { calculateFreshness } from './freshnessCalculator';

export interface RecommendationCandidate {
  station: ChargingStation;
  distanceKm: number;
  recommendationScore: number;
  reasons: string[];
}

export function rankChargersForUser(
  stations: ChargingStation[],
  userLocation: { lat: number; lng: number },
  userMaxPowerKw: number = 150
): RecommendationCandidate[] {
  return stations
    .map((station) => {
      const reasons: string[] = [];
      let score = 100;

      // 1. Distance penalty: -3 points per km beyond 1 km
      const dist = station.distanceKm;
      const distPenalty = Math.max(0, (dist - 1.0) * 3.5);
      score -= Math.min(45, distPenalty);
      if (dist <= 3.0) {
        reasons.push(`Sangat dekat (${dist.toFixed(1)} km)`);
      } else {
        reasons.push(`Jarak ${dist.toFixed(1)} km`);
      }

      // 2. Confidence score weight
      const conf = station.confidence.overallScore;
      score -= (100 - conf) * 0.35;
      if (conf >= 90) {
        reasons.push(`${conf}% Indeks Kepercayaan Tinggi`);
      } else if (conf < 70) {
        score -= 20; // Extra penalty for untrusted/faulty stations
      }

      // 3. Queue & Availability
      if (station.queueLength === 0) {
        score += 5;
        reasons.push('Nol antrean kendaraan');
      } else {
        score -= station.queueLength * 10;
        reasons.push(`Terdapat antrean ${station.queueLength} mobil (${station.estimatedWaitMinutes} mnt)`);
      }

      const availableBays = station.connectors.filter(c => c.status === 'AVAILABLE').length;
      if (availableBays > 0) {
        reasons.push(`${availableBays} bay tersedia langsung`);
      } else {
        score -= 15;
      }

      // 4. Power capability
      const maxKw = Math.max(...station.connectors.map(c => c.maxPowerKw), 22);
      if (maxKw >= 150) {
        score += 8;
        reasons.push(`Daya Ultra-Fast ${maxKw} kW`);
      } else if (maxKw >= 60) {
        reasons.push(`Daya Cepat ${maxKw} kW`);
      }

      // 5. Freshness
      const freshness = calculateFreshness(station.lastReportedAt);
      if (freshness.isStale) {
        score -= 15;
      }

      // Overall clamp
      const finalScore = Math.max(0, Math.min(100, Math.round(score)));

      return {
        station,
        distanceKm: dist,
        recommendationScore: finalScore,
        reasons
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}
