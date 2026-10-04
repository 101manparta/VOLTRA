import { describe, it, expect } from 'vitest';
import { computeChargingConfidence } from '../../src/lib/confidenceEngine';

describe('Charging Confidence Scoring Engine (Section 15)', () => {
  it('awards high score (>= 90%) to nominal, live, unqueued stations', () => {
    const result = computeChargingConfidence({
      status: 'AVAILABLE',
      queueLength: 0,
      availableConnectorsCount: 2,
      totalConnectorsCount: 3,
      lastReportedAt: new Date().toISOString(),
      recentFailures24h: 0,
      averageObservedPowerKw: 140,
      maxAdvertisedPowerKw: 150
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('perangkat keras normal'),
        expect.stringContaining('Tidak ada antrean'),
        expect.stringContaining('telemetri langsung')
      ])
    );
  });

  it('severely penalizes stations with FAULT or THERMAL_DERATE', () => {
    const result = computeChargingConfidence({
      status: 'FAULT',
      healthStatus: 'THERMAL_DERATE',
      queueLength: 2,
      availableConnectorsCount: 0,
      totalConnectorsCount: 2,
      lastReportedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      recentFailures24h: 4
    });

    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('anomali suhu'),
        expect.stringContaining('kegagalan sesi')
      ])
    );
  });

  it('penalizes stale telemetry and active queue', () => {
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const result = computeChargingConfidence({
      status: 'AVAILABLE',
      queueLength: 3,
      availableConnectorsCount: 0,
      totalConnectorsCount: 2,
      lastReportedAt: twentyMinsAgo,
    });

    expect(result.score).toBeLessThan(75);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Antrean 3 kendaraan'),
        expect.stringContaining('kedaluwarsa')
      ])
    );
  });
});
