export interface RealtimeEnvelope<T> {
  topic: string;
  timestamp: string;
  payload: T;
}

export interface TelemetryDeltaPayload {
  stationId: string;
  connectorId: string;
  newPowerKw: number;
  newStatus: string;
  reportedAt: string;
}

export interface QueueDeltaPayload {
  stationId: string;
  queueLength: number;
  estimatedWaitMinutes: number;
}
