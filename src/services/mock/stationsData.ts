import { ChargingStation, StationRecommendation } from '../../types/station';

export const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 'spklu-sanur-hub',
    name: 'Sanur Charging Hub',
    operator: 'PLN Nusantara / StarCharge',
    address: 'Jl. Bypass Ngurah Rai No. 88, Sanur, Denpasar Selatan',
    coordinates: { lat: -8.6912, lng: 115.2635 },
    distanceKm: 4.2,
    pricingPerKwh: 2466,
    currency: 'IDR',
    connectors: [
      { id: 'sn-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 52.4, status: 'OCCUPIED', currentSessionRemainingMinutes: 12 },
      { id: 'sn-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'sn-03', bayNumber: 'Bay 03', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'sn-04', bayNumber: 'Bay 04', type: 'CHAdeMO', maxPowerKw: 50, currentPowerKw: 42.1, status: 'OCCUPIED', currentSessionRemainingMinutes: 24 },
    ],
    queueLength: 1,
    estimatedWaitMinutes: 8,
    confidence: {
      overallScore: 96,
      availabilityScore: 99,
      handshakeSuccessRate: 98,
      powerStabilityScore: 92,
      networkLatencyScore: 94,
      paymentGatewayUptime: 99,
      assessmentSummary: 'High Reliability · Active hardware telemetry verified · Stable power line'
    },
    lastReportedAt: new Date(Date.now() - 14 * 1000).toISOString(), // 14 seconds ago (LIVE)
    recentFailures24h: 0,
    averageObservedPowerKw: 52.4,
    isRecommended: true
  },
  {
    id: 'spklu-kuta-fast',
    name: 'Kuta Central Fast Bay',
    operator: 'Voltron EV Network',
    address: 'Jl. Raya Kuta No. 120, Badung',
    coordinates: { lat: -8.7215, lng: 115.1762 },
    distanceKm: 3.1,
    pricingPerKwh: 2600,
    currency: 'IDR',
    connectors: [
      { id: 'kt-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 60, currentPowerKw: 31.0, status: 'OCCUPIED', currentSessionRemainingMinutes: 35 },
      { id: 'kt-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 60, currentPowerKw: 0, status: 'OUT_OF_SERVICE' },
      { id: 'kt-03', bayNumber: 'Bay 03', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'OUT_OF_SERVICE' },
      { id: 'kt-04', bayNumber: 'Bay 04', type: 'CCS2', maxPowerKw: 60, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 3,
    estimatedWaitMinutes: 28,
    confidence: {
      overallScore: 58,
      availabilityScore: 61,
      handshakeSuccessRate: 64,
      powerStabilityScore: 48,
      networkLatencyScore: 59,
      paymentGatewayUptime: 72,
      assessmentSummary: 'High Risk · 4 session aborts logged today · Heavy thermal derating'
    },
    lastReportedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago (RECENT)
    recentFailures24h: 4,
    averageObservedPowerKw: 31.0,
    isRecommended: false
  },
  {
    id: 'spklu-denpasar-super',
    name: 'Denpasar Civic Supercharge',
    operator: 'PLN Nusantara',
    address: 'Jl. Teuku Umar No. 240, Dauh Puri Kauh',
    coordinates: { lat: -8.6738, lng: 115.2081 },
    distanceKm: 6.8,
    pricingPerKwh: 2466,
    currency: 'IDR',
    connectors: [
      { id: 'dp-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 200, currentPowerKw: 142.0, status: 'OCCUPIED', currentSessionRemainingMinutes: 16 },
      { id: 'dp-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 200, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'dp-03', bayNumber: 'Bay 03', type: 'CCS2', maxPowerKw: 200, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'dp-04', bayNumber: 'Bay 04', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 0,
    estimatedWaitMinutes: 0,
    confidence: {
      overallScore: 94,
      availabilityScore: 96,
      handshakeSuccessRate: 98,
      powerStabilityScore: 95,
      networkLatencyScore: 92,
      paymentGatewayUptime: 99,
      assessmentSummary: 'Ultra Fast Nominal · Zero queue · 200 kW cabinet operating normally'
    },
    lastReportedAt: new Date(Date.now() - 32 * 1000).toISOString(), // 32 seconds ago (LIVE)
    recentFailures24h: 0,
    averageObservedPowerKw: 142.0,
    isRecommended: false
  },
  {
    id: 'spklu-jimbaran-hub',
    name: 'Jimbaran Gateway Hub',
    operator: 'Shell Recharge',
    address: 'Jl. Bypass Ngurah Rai KM 22, Jimbaran',
    coordinates: { lat: -8.7842, lng: 115.1712 },
    distanceKm: 8.5,
    pricingPerKwh: 2750,
    currency: 'IDR',
    connectors: [
      { id: 'jb-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 120, currentPowerKw: 88.5, status: 'OCCUPIED' },
      { id: 'jb-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 120, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'jb-03', bayNumber: 'Bay 03', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 0,
    estimatedWaitMinutes: 0,
    confidence: {
      overallScore: 92,
      availabilityScore: 94,
      handshakeSuccessRate: 96,
      powerStabilityScore: 91,
      networkLatencyScore: 89,
      paymentGatewayUptime: 95,
      assessmentSummary: 'Nominal Service · Canopy covered · Security guard on premise'
    },
    lastReportedAt: new Date(Date.now() - 110 * 1000).toISOString(), // 1.8 mins ago (RECENT)
    recentFailures24h: 0,
    averageObservedPowerKw: 88.5,
    isRecommended: false
  },
  {
    id: 'spklu-ubud-valley',
    name: 'Ubud Valley Eco Point',
    operator: 'Utama Green Energy',
    address: 'Jl. Raya Pengosekan, Ubud, Gianyar',
    coordinates: { lat: -8.5198, lng: 115.2631 },
    distanceKm: 19.4,
    pricingPerKwh: 2300,
    currency: 'IDR',
    connectors: [
      { id: 'ub-01', bayNumber: 'Bay 01', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'ub-02', bayNumber: 'Bay 02', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 0,
    estimatedWaitMinutes: 0,
    confidence: {
      overallScore: 74,
      availabilityScore: 82,
      handshakeSuccessRate: 85,
      powerStabilityScore: 78,
      networkLatencyScore: 42,
      paymentGatewayUptime: 80,
      assessmentSummary: 'Stale Telemetry Notice · Cellular signal intermittent in valley'
    },
    lastReportedAt: new Date(Date.now() - 21 * 60 * 1000).toISOString(), // 21 mins ago (STALE)
    recentFailures24h: 1,
    averageObservedPowerKw: 22.0,
    isRecommended: false
  },
  {
    id: 'spklu-nusa-dua-itdc',
    name: 'Nusa Dua ITDC Superhub',
    operator: 'PLN Nusantara / ITDC',
    address: 'Kawasan ITDC Lot NW-1, Benoa, Badung',
    coordinates: { lat: -8.7990, lng: 115.2280 },
    distanceKm: 11.2,
    pricingPerKwh: 2466,
    currency: 'IDR',
    connectors: [
      { id: 'nd-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 118.0, status: 'OCCUPIED', currentSessionRemainingMinutes: 8 },
      { id: 'nd-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'nd-03', bayNumber: 'Bay 03', type: 'CCS2', maxPowerKw: 150, currentPowerKw: 0, status: 'AVAILABLE' },
      { id: 'nd-04', bayNumber: 'Bay 04', type: 'Type2', maxPowerKw: 22, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 0,
    estimatedWaitMinutes: 0,
    confidence: {
      overallScore: 97,
      availabilityScore: 98,
      handshakeSuccessRate: 99,
      powerStabilityScore: 97,
      networkLatencyScore: 96,
      paymentGatewayUptime: 99,
      assessmentSummary: 'Ultra High Reliability · Dedicated ITDC substation line · 24/7 security'
    },
    lastReportedAt: new Date(Date.now() - 8 * 1000).toISOString(),
    recentFailures24h: 0,
    averageObservedPowerKw: 118.0,
    isRecommended: false
  },
  {
    id: 'spklu-canggu-depot',
    name: 'Canggu Coastal Depot',
    operator: 'Voltron EV Network',
    address: 'Jl. Pantai Batu Bolong No. 45, Canggu',
    coordinates: { lat: -8.6521, lng: 115.1380 },
    distanceKm: 9.8,
    pricingPerKwh: 2600,
    currency: 'IDR',
    connectors: [
      { id: 'cg-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 60, currentPowerKw: 42.5, status: 'OCCUPIED', currentSessionRemainingMinutes: 18 },
      { id: 'cg-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 60, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 1,
    estimatedWaitMinutes: 6,
    confidence: {
      overallScore: 84,
      availabilityScore: 85,
      handshakeSuccessRate: 88,
      powerStabilityScore: 82,
      networkLatencyScore: 86,
      paymentGatewayUptime: 90,
      assessmentSummary: 'Active Hub · High daytime usage · Solar assisted canopy'
    },
    lastReportedAt: new Date(Date.now() - 45 * 1000).toISOString(),
    recentFailures24h: 0,
    averageObservedPowerKw: 42.5,
    isRecommended: false
  },
  {
    id: 'spklu-seminyak-sunset',
    name: 'Seminyak Sunset Road Fast Point',
    operator: 'StarCharge Indonesia',
    address: 'Jl. Sunset Road KM 8, Seminyak, Kuta',
    coordinates: { lat: -8.6892, lng: 115.1685 },
    distanceKm: 5.4,
    pricingPerKwh: 2550,
    currency: 'IDR',
    connectors: [
      { id: 'sy-01', bayNumber: 'Bay 01', type: 'CCS2', maxPowerKw: 100, currentPowerKw: 76.0, status: 'OCCUPIED', currentSessionRemainingMinutes: 14 },
      { id: 'sy-02', bayNumber: 'Bay 02', type: 'CCS2', maxPowerKw: 100, currentPowerKw: 0, status: 'AVAILABLE' }
    ],
    queueLength: 0,
    estimatedWaitMinutes: 0,
    confidence: {
      overallScore: 91,
      availabilityScore: 92,
      handshakeSuccessRate: 94,
      powerStabilityScore: 90,
      networkLatencyScore: 93,
      paymentGatewayUptime: 95,
      assessmentSummary: 'Express Corridor Node · Dual 100 kW cabinet operating normally'
    },
    lastReportedAt: new Date(Date.now() - 25 * 1000).toISOString(),
    recentFailures24h: 0,
    averageObservedPowerKw: 76.0,
    isRecommended: false
  }
];

export const MOCK_RECOMMENDATION: StationRecommendation = {
  recommendedStationId: 'spklu-sanur-hub',
  alternativeStationId: 'spklu-kuta-fast',
  title: 'VOLTARA Recommends Sanur Charging Hub',
  headlineReason: 'Estimated 17 minutes faster total trip than closer Kuta station',
  reasons: [
    '96% recent session success (vs. 58% at Kuta with 4 recent faults)',
    'Zero physical queue with Bay 02 vacant right now',
    '52.4 kW sustained average output (no cabinet thermal derating)',
    'Only 4.2 km away via direct bypass corridor'
  ],
  netTimeSavedMinutes: 17,
  confidenceDelta: 38
};
