import { describe, it, expect } from 'vitest';
import { sessionService } from '../../src/services/sessionService';

describe('Charging Session Lifecycle & Receipts (Sections 17, 36)', () => {
  it('starts a new session with initial state and 0 delivered energy', async () => {
    const session = await sessionService.startSession(
      'c0000000-0000-0000-0000-000000000001',
      'SPKLU PLN Sanur Fast Hub',
      'd0000000-0000-0000-0000-000000000001',
      'CCS2'
    );

    expect(session.state).toBe('CHARGING');
    expect(session.stationName).toBe('SPKLU PLN Sanur Fast Hub');
    expect(session.connectorType).toBe('CCS2');
    expect(session.currentSocPercent).toBe(32);
    expect(session.targetSocPercent).toBe(80);
    expect(session.energyDeliveredKwh).toBeLessThanOrEqual(1.0);
  });

  it('completes an active session and generates a historical record', async () => {
    const active = await sessionService.getActiveSession();
    active.energyDeliveredKwh = 18.5;
    active.estimatedCostTotal = Math.round(18.5 * active.tariffPerKwh);
    active.elapsedSeconds = 1200; // 20 minutes

    const historicReceipt = await sessionService.stopSession(active);

    expect(historicReceipt.status).toBe('COMPLETED');
    expect(historicReceipt.energyKwh).toBe(18.5);
    expect(historicReceipt.totalCost).toBeGreaterThan(0);
    expect(historicReceipt.durationMinutes).toBe(20);

    const history = await sessionService.getSessionHistory();
    expect(history.some(h => h.id === historicReceipt.id)).toBe(true);
  });
});
