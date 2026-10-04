/**
 * VOLTARA Geospatial Map Type Definitions
 * Supports real geographic coordinates, 3D marker rendering, and explainable confidence metrics.
 */

export type ChargerStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'STALE';
export type ChargerMarkerStatus = ChargerStatus;

export type ConnectorType = 'CCS2' | 'Type2' | 'CHAdeMO' | 'NACS';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Individual physical charger plug / bay inside a charging station
 */
export interface Charger {
  id: string;
  bayNumber: string;
  connectorType: ConnectorType;
  maxPowerKw: number;
  currentPowerKw: number;
  status: ChargerStatus;
  sessionRemainingMinutes?: number;
}

/**
 * Detailed 5-vector charging confidence metric model
 */
export interface ConfidenceMetrics {
  /** Overall computed confidence score (0 - 100) */
  overallScore: number;
  /** Historical slot uptime and occupancy predictability */
  availabilityScore: number;
  /** Auth & vehicle handshake success rate in the last 72h */
  handshakeSuccessRate: number;
  /** Real power stability vs nameplate hardware capacity */
  powerStabilityScore: number;
  /** Network ping freshness and telemetry reliability */
  networkLatencyScore: number;
  /** Payment gateway & POS terminal uptime */
  paymentGatewayUptime: number;
  /** Human-readable transparent explanation */
  assessmentSummary?: string;
}

/**
 * Comprehensive geographic Charging Station model
 */
export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  address: string;
  latitude: number;
  longitude: number;
  coordinates: GeoPoint;
  status: ChargerStatus;
  chargers: Charger[];
  totalBays: number;
  availableBays: number;
  maxPowerKw: number;
  averageObservedPowerKw: number;
  pricingPerKwh: number;
  currency: string;
  confidence: ConfidenceMetrics;
  queueLength: number;
  estimatedWaitMinutes: number;
  lastReportedAt: string; // ISO 8601 string
  isRecommended?: boolean;
}

/**
 * Optimized payload consumed by the geographic Map and ChargerMarker rendering pipeline
 */
export interface MapMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  coordinates: GeoPoint;
  status: ChargerStatus;
  confidenceScore: number;
  confidence?: ConfidenceMetrics;
  maxPowerKw: number;
  observedPowerKw?: number;
  availableBays?: number;
  totalBays?: number;
  operator?: string;
  queueLength?: number;
  estimatedWaitMinutes?: number;
  isRecommended?: boolean;
  lastReportedAt?: string;
  pixelPosition?: ScreenPosition;
}

// Backwards compatibility alias
export type ChargerMarkerData = MapMarkerData;
