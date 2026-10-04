import { HistoricSession, LiveChargingSession } from '../../types/session';

export const INITIAL_LIVE_SESSION: LiveChargingSession = {
  sessionId: 'volt-sess-89412',
  stationId: 'spklu-sanur-hub',
  stationName: 'Sanur Charging Hub',
  connectorId: 'sn-01',
  connectorType: 'CCS2',
  startedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  elapsedSeconds: 1920, // 32 minutes
  state: 'CHARGING',
  currentSocPercent: 67,
  targetSocPercent: 80,
  instantaneousPowerKw: 48.2,
  energyDeliveredKwh: 24.8,
  estimatedMinutesToTarget: 18,
  estimatedCostTotal: 41200, // Rp 41.200
  currency: 'IDR',
  tariffPerKwh: 2466,
  powerHistory: [
    { timestamp: '10:00', powerKw: 51.8, socPercent: 32, voltageV: 412, currentA: 125 },
    { timestamp: '10:05', powerKw: 52.4, socPercent: 39, voltageV: 415, currentA: 126 },
    { timestamp: '10:10', powerKw: 52.1, socPercent: 46, voltageV: 418, currentA: 124 },
    { timestamp: '10:15', powerKw: 50.9, socPercent: 53, voltageV: 421, currentA: 121 },
    { timestamp: '10:20', powerKw: 49.6, socPercent: 60, voltageV: 424, currentA: 117 },
    { timestamp: '10:25', powerKw: 48.8, socPercent: 64, voltageV: 426, currentA: 114 },
    { timestamp: '10:30', powerKw: 48.2, socPercent: 67, voltageV: 428, currentA: 112 },
  ],
  hasDeratingAnomaly: false,
  anomalyMessage: undefined
};

export const MOCK_HISTORIC_SESSIONS: HistoricSession[] = [
  {
    id: 'hist-01',
    stationName: 'Sanur Charging Hub',
    operator: 'PLN Nusantara',
    date: 'Yesterday, 14:20',
    durationMinutes: 38,
    energyKwh: 31.4,
    totalCost: 77400,
    currency: 'IDR',
    averagePowerKw: 49.5,
    connectorType: 'CCS2',
    status: 'COMPLETED'
  },
  {
    id: 'hist-02',
    stationName: 'Denpasar Civic Supercharge',
    operator: 'PLN Nusantara',
    date: 'Sep 29, 2026',
    durationMinutes: 22,
    energyKwh: 42.1,
    totalCost: 103800,
    currency: 'IDR',
    averagePowerKw: 114.8,
    connectorType: 'CCS2',
    status: 'COMPLETED'
  },
  {
    id: 'hist-03',
    stationName: 'Jimbaran Gateway Hub',
    operator: 'Shell Recharge',
    date: 'Sep 25, 2026',
    durationMinutes: 45,
    energyKwh: 28.2,
    totalCost: 77550,
    currency: 'IDR',
    averagePowerKw: 37.6,
    connectorType: 'CCS2',
    status: 'DERATED'
  },
  {
    id: 'hist-04',
    stationName: 'Sanur Charging Hub',
    operator: 'PLN Nusantara',
    date: 'Sep 21, 2026',
    durationMinutes: 29,
    energyKwh: 24.0,
    totalCost: 59180,
    currency: 'IDR',
    averagePowerKw: 49.6,
    connectorType: 'CCS2',
    status: 'COMPLETED'
  }
];
