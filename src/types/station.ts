export type ConnectorType = 'CCS2' | 'Type2' | 'CHAdeMO' | 'NACS';

export type ConnectorStatus = 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE' | 'RESERVED';

export type FreshnessState = 'LIVE' | 'RECENT' | 'STALE' | 'UNKNOWN';

export interface Connector {
  id: string;
  bayNumber: string;
  type: ConnectorType;
  maxPowerKw: number;
  currentPowerKw: number;
  status: ConnectorStatus;
  currentSessionRemainingMinutes?: number;
}

export interface ConfidenceBreakdown {
  overallScore: number;         // 0 - 100
  availabilityScore: number;    // Slot availability consistency
  handshakeSuccessRate: number; // Successful handshake % in last 72h
  powerStabilityScore: number;  // Rolling power output vs advertised
  networkLatencyScore: number;  // Telemetry ping freshness & stability
  paymentGatewayUptime: number; // POS / RFID payment terminal uptime
  assessmentSummary: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  pricingPerKwh: number;        // IDR per kWh
  currency: string;
  connectors: Connector[];
  queueLength: number;
  estimatedWaitMinutes: number;
  confidence: ConfidenceBreakdown;
  lastReportedAt: string;        // ISO 8601
  recentFailures24h: number;
  averageObservedPowerKw: number;
  isRecommended?: boolean;
}

export interface StationRecommendation {
  recommendedStationId: string;
  alternativeStationId: string;
  title: string;
  headlineReason: string;
  reasons: string[];
  netTimeSavedMinutes: number;
  confidenceDelta: number;
}
