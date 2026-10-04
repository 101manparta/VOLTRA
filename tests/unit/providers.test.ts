import { describe, it, expect } from 'vitest';
import { DevelopmentProvider } from '../../src/services/providers/developmentProvider';
import { OcpiProvider } from '../../src/services/providers/ocpiProvider';
import { providerRegistry } from '../../src/services/providers/providerRegistry';

describe('EV Charging Provider Architecture & Adapters (Phase 11)', () => {
  it('registers development provider with verified Bali seed locations', async () => {
    const devProvider = new DevelopmentProvider();
    expect(devProvider.isLiveOperational).toBe(false);
    expect(devProvider.protocol).toBe('INTERNAL_DEVELOPMENT');

    const chargers = await devProvider.getChargers();
    expect(chargers.length).toBe(8);
    expect(chargers.every(c => c.isDevelopmentData)).toBe(true);

    const testResult = await devProvider.testConnectivity();
    expect(testResult.connected).toBe(true);
  });

  it('marks unconfigured OCPI providers as not live operational', async () => {
    const unconfigured = new OcpiProvider({
      cpoId: 'PLN',
      countryCode: 'ID',
      name: 'PLN UID Bali',
      providerCode: 'PLN-TEST',
      versionsUrl: undefined,
      token: undefined
    });

    expect(unconfigured.isLiveOperational).toBe(false);

    const conn = await unconfigured.testConnectivity();
    expect(conn.connected).toBe(false);
    expect(conn.message).toContain('Kredensial OCPI 2.2.1 belum dikonfigurasi');
  });

  it('maintains provider registry with default providers', () => {
    const providers = providerRegistry.getAllProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);

    const dev = providerRegistry.getProvider('voltara-dev-bali');
    expect(dev).toBeDefined();
    expect(dev?.name).toContain('Bali Development Sandbox');
  });
});
