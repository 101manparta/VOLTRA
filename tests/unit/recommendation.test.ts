import { describe, it, expect } from 'vitest';
import { rankChargersForUser } from '../../src/lib/recommendationEngine';
import { ChargingStation } from '../../src/types/station';

describe('Deterministic Recommendation Engine (Section 16)', () => {
  const mockStations: ChargingStation[] = [
    {
      id: 'st-01',
      name: 'Far High-Power Hub',
      operator: 'PLN',
      address: 'Sanur',
      status: 'AVAILABLE',
      coordinates: { lat: -8.6920, lng: 115.2580 },
      distanceKm: 2.1,
      pricingPerKwh: 2466,
      currency: 'IDR',
      connectors: [
        { id: 'c1', bayNumber: '01', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 0, status: 'AVAILABLE' }
      ],
      queueLength: 0,
      estimatedWaitMinutes: 0,
      confidence: {
        overallScore: 96,
        availabilityScore: 95,
        handshakeSuccessRate: 98,
        powerStabilityScore: 95,
        networkLatencyScore: 99,
        paymentGatewayUptime: 99,
        assessmentSummary: 'Optimal'
      },
      lastReportedAt: new Date().toISOString(),
      recentFailures24h: 0,
      averageObservedPowerKw: 140
    },
    {
      id: 'st-02',
      name: 'Nearby Broken Hub',
      operator: 'Starvo',
      address: 'Kuta',
      status: 'FAULT',
      coordinates: { lat: -8.7285, lng: 115.1685 },
      distanceKm: 0.8,
      pricingPerKwh: 2466,
      currency: 'IDR',
      connectors: [
        { id: 'c2', bayNumber: '01', type: 'CCS2', maxPowerKw: 50, currentPowerKw: 0, status: 'OUT_OF_SERVICE' }
      ],
      queueLength: 3,
      estimatedWaitMinutes: 45,
      confidence: {
        overallScore: 42,
        availabilityScore: 20,
        handshakeSuccessRate: 40,
        powerStabilityScore: 50,
        networkLatencyScore: 60,
        paymentGatewayUptime: 90,
        assessmentSummary: 'Fault'
      },
      lastReportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      recentFailures24h: 3,
      averageObservedPowerKw: 20
    }
  ];

  it('ranks high-confidence, high-power station higher despite slightly greater distance', () => {
    const ranked = rankChargersForUser(mockStations, { lat: -8.7000, lng: 115.2000 });

    expect(ranked[0].station.id).toBe('st-01');
    expect(ranked[0].recommendationScore).toBeGreaterThan(ranked[1].recommendationScore);
    expect(ranked[0].reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Nol antrean'),
        expect.stringContaining('Indeks Kepercayaan Tinggi')
      ])
    );
  });
});
