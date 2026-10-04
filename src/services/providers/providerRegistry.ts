/**
 * VOLTARA Provider Registry & Adapter Hub
 * 
 * Manages registered CPO network adapters and roaming providers.
 */

import { DevelopmentProvider } from './developmentProvider';
import { OcpiProvider } from './ocpiProvider';
import { EVChargingProvider } from './types';

class ProviderRegistry {
  private providers: Map<string, EVChargingProvider> = new Map();

  constructor() {
    // 1. Always register default development sandbox
    const devProvider = new DevelopmentProvider();
    this.registerProvider(devProvider);

    // 2. Pre-configure OCPI stubs for Indonesian CPO networks (explicitly marked offline until real keys are provided)
    this.registerProvider(
      new OcpiProvider({
        cpoId: 'PLN',
        countryCode: 'ID',
        name: 'PLN UID Bali (Icon+)',
        providerCode: 'PLN-BALI-OCPP',
        versionsUrl: undefined,
        token: undefined
      })
    );

    this.registerProvider(
      new OcpiProvider({
        cpoId: 'VLT',
        countryCode: 'ID',
        name: 'Voltron Indonesia Network',
        providerCode: 'VOLTRON-ID-API',
        versionsUrl: undefined,
        token: undefined
      })
    );

    this.registerProvider(
      new OcpiProvider({
        cpoId: 'STR',
        countryCode: 'ID',
        name: 'Starvo Ultra Fast Network',
        providerCode: 'STARVO-BALI-INGEST',
        versionsUrl: undefined,
        token: undefined
      })
    );
  }

  registerProvider(provider: EVChargingProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): EVChargingProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): EVChargingProvider[] {
    return Array.from(this.providers.values());
  }

  getLiveProviders(): EVChargingProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isLiveOperational);
  }
}

export const providerRegistry = new ProviderRegistry();
