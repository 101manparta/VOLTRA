/**
 * VOLTARA EV Charging Provider Abstraction
 * 
 * Standardized interface for integrating CPOs and roaming networks:
 * - Development / Seed Providers
 * - OCPI (Open Charge Point Interface) 2.2.1 compatible networks
 * - Proprietary CPO REST / WebSocket APIs
 * 
 * NOTE: Production connectivity requires signed bilateral CPO agreements
 * and mutual TLS / token credentials.
 */

export interface NormalizedConnector {
  id: string;
  bayNumber: string;
  type: 'CCS2' | 'Type2' | 'CHAdeMO' | 'NACS';
  maxPowerKw: number;
  currentPowerKw: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE' | 'RESERVED';
}

export interface NormalizedProviderStation {
  externalId: string;
  providerCode: string;
  name: string;
  operator: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'FAULT' | 'UNKNOWN';
  pricingPerKwh: number;
  currency: string;
  connectors: NormalizedConnector[];
  lastTelemetryPing: string;
  isDevelopmentData: boolean;
}

export interface NormalizedProviderStatus {
  externalId: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'FAULT' | 'UNKNOWN';
  activeLoadKw: number;
  queueCount: number;
  timestamp: string;
}

export interface ConnectivityTestResult {
  connected: boolean;
  latencyMs?: number;
  message: string;
  configuredEndpoint?: string;
}

export interface EVChargingProvider {
  readonly id: string;
  readonly name: string;
  readonly providerCode: string;
  readonly protocol: 'INTERNAL_DEVELOPMENT' | 'OCPI_2_2_1' | 'OCPP_INGEST' | 'PROPRIETARY_REST';
  readonly isLiveOperational: boolean;

  getChargers(): Promise<NormalizedProviderStation[]>;
  getChargerStatus(externalId: string): Promise<NormalizedProviderStatus>;
  getConnectors(externalId: string): Promise<NormalizedConnector[]>;
  testConnectivity(): Promise<ConnectivityTestResult>;
}
