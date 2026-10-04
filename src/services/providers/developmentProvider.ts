/**
 * Development & Sandbox EV Charging Provider
 * 
 * Provides verified baseline geographic data for Bali corridor testing.
 * Explicitly labeled as development data — NEVER represented as live third-party API.
 */

import { MOCK_STATIONS } from '../mock/stationsData';
import {
  ConnectivityTestResult,
  EVChargingProvider,
  NormalizedConnector,
  NormalizedProviderStation,
  NormalizedProviderStatus
} from './types';

export class DevelopmentProvider implements EVChargingProvider {
  readonly id = 'voltara-dev-bali';
  readonly name = 'VOLTARA Bali Development Sandbox';
  readonly providerCode = 'VOLTARA-DEV';
  readonly protocol = 'INTERNAL_DEVELOPMENT' as const;
  readonly isLiveOperational = false;

  async getChargers(): Promise<NormalizedProviderStation[]> {
    return MOCK_STATIONS.map((s) => ({
      externalId: s.id,
      providerCode: this.providerCode,
      name: s.name,
      operator: s.operator,
      address: s.address,
      coordinates: s.coordinates,
      status: s.status,
      pricingPerKwh: s.pricingPerKwh,
      currency: s.currency,
      connectors: s.connectors.map((c) => ({
        id: c.id,
        bayNumber: c.bayNumber,
        type: c.type,
        maxPowerKw: c.maxPowerKw,
        currentPowerKw: c.currentPowerKw,
        status: c.status
      })),
      lastTelemetryPing: s.lastReportedAt,
      isDevelopmentData: true
    }));
  }

  async getChargerStatus(externalId: string): Promise<NormalizedProviderStatus> {
    const station = MOCK_STATIONS.find((s) => s.id === externalId);
    if (!station) {
      return {
        externalId,
        status: 'UNKNOWN',
        activeLoadKw: 0,
        queueCount: 0,
        timestamp: new Date().toISOString()
      };
    }

    const activeLoad = station.connectors.reduce((acc, c) => acc + c.currentPowerKw, 0);

    return {
      externalId: station.id,
      status: station.status,
      activeLoadKw: activeLoad,
      queueCount: station.queueLength,
      timestamp: station.lastReportedAt
    };
  }

  async getConnectors(externalId: string): Promise<NormalizedConnector[]> {
    const station = MOCK_STATIONS.find((s) => s.id === externalId);
    if (!station) return [];
    return station.connectors.map((c) => ({
      id: c.id,
      bayNumber: c.bayNumber,
      type: c.type,
      maxPowerKw: c.maxPowerKw,
      currentPowerKw: c.currentPowerKw,
      status: c.status
    }));
  }

  async testConnectivity(): Promise<ConnectivityTestResult> {
    return {
      connected: true,
      latencyMs: 1,
      message: 'VOLTARA Bali development sandbox active with 8 verified WGS84 locations.',
      configuredEndpoint: 'internal://sandbox.voltara.local'
    };
  }
}
