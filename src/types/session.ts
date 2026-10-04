import { ConnectorType } from './station';

export type SessionState = 'CHARGING' | 'COMPLETED' | 'PAUSED' | 'ABORTED';

export interface TelemetryPoint {
  timestamp: string; // ISO 8601
  powerKw: number;
  socPercent: number;
  voltageV: number;
  currentA: number;
}

export interface LiveChargingSession {
  sessionId: string;
  stationId: string;
  stationName: string;
  connectorId: string;
  connectorType: ConnectorType;
  startedAt: string;
  elapsedSeconds: number;
  state: SessionState;
  currentSocPercent: number;    // e.g. 67%
  targetSocPercent: number;     // e.g. 80%
  instantaneousPowerKw: number; // e.g. 48.2 kW
  energyDeliveredKwh: number;   // e.g. 24.8 kWh
  estimatedMinutesToTarget: number; // e.g. 18 min
  estimatedCostTotal: number;   // e.g. 41200 IDR
  currency: string;             // "IDR"
  tariffPerKwh: number;
  powerHistory: TelemetryPoint[];
  hasDeratingAnomaly: boolean;
  anomalyMessage?: string;
}

export interface HistoricSession {
  id: string;
  stationName: string;
  operator: string;
  date: string;
  durationMinutes: number;
  energyKwh: number;
  totalCost: number;
  currency: string;
  averagePowerKw: number;
  connectorType: ConnectorType;
  status: 'COMPLETED' | 'MANUAL_STOP' | 'DERATED';
}
