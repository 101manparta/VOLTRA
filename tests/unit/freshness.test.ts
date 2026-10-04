import { describe, it, expect } from 'vitest';
import { calculateFreshness } from '../../src/lib/freshnessCalculator';

describe('Freshness Calculation Engine (Section 14)', () => {
  it('classifies updates < 30 seconds as LIVE', () => {
    const twentySecAgo = new Date(Date.now() - 20 * 1000).toISOString();
    const result = calculateFreshness(twentySecAgo);

    expect(result.status).toBe('LIVE');
    expect(result.isStale).toBe(false);
    expect(result.formattedRelative).toContain('20 detik lalu');
  });

  it('classifies updates between 30s and 5m as RECENT', () => {
    const twoMinsAgo = new Date(Date.now() - 120 * 1000).toISOString();
    const result = calculateFreshness(twoMinsAgo);

    expect(result.status).toBe('RECENT');
    expect(result.isStale).toBe(false);
    expect(result.formattedRelative).toContain('2 menit lalu');
  });

  it('classifies updates between 5m and 20m as STALE', () => {
    const tenMinsAgo = new Date(Date.now() - 600 * 1000).toISOString();
    const result = calculateFreshness(tenMinsAgo);

    expect(result.status).toBe('STALE');
    expect(result.isStale).toBe(true);
    expect(result.formattedRelative).toContain('10 menit lalu');
  });

  it('classifies updates > 20m as VERY_STALE', () => {
    const thirtyMinsAgo = new Date(Date.now() - 1800 * 1000).toISOString();
    const result = calculateFreshness(thirtyMinsAgo);

    expect(result.status).toBe('VERY_STALE');
    expect(result.isStale).toBe(true);
    expect(result.formattedRelative).toContain('30 menit lalu');
  });

  it('handles null or undefined dates gracefully', () => {
    const result = calculateFreshness(null);
    expect(result.status).toBe('VERY_STALE');
    expect(result.isStale).toBe(true);
  });
});
