import { FleetOptimizationMetrics, FleetVehicle } from '../../types/fleet';

export const MOCK_FLEET_METRICS: FleetOptimizationMetrics = {
  totalVehicles: 100,
  readyCount: 84,
  chargingCount: 11,
  attentionCount: 5,
  todayChargingCost: 4280000,      // Rp 4.28M
  estimatedOptimizedCost: 3710000, // Rp 3.71M
  potentialSavings: 570000,        // Rp 570K
  currency: 'IDR',
  averageFleetSoc: 78.4,
  activeAiAlertsCount: 3
};

export const MOCK_FLEET_VEHICLES: FleetVehicle[] = [
  { id: 'v-01', plateNumber: 'DK 1084 EV', model: 'Hyundai Ioniq 5 Long Range', batteryPercent: 92, status: 'READY', depotLocation: 'Denpasar Hub Bay 01' },
  { id: 'v-02', plateNumber: 'DK 1422 EV', model: 'BYD Atto 3 Extended', batteryPercent: 88, status: 'READY', depotLocation: 'Denpasar Hub Bay 04' },
  { id: 'v-03', plateNumber: 'DK 8821 EV', model: 'Wuling Binguo EV Premium', batteryPercent: 44, status: 'CHARGING', depotLocation: 'Sanur Depot Bay 02', estimatedFullChargeTime: '14:35' },
  { id: 'v-04', plateNumber: 'DK 3910 EV', model: 'Hyundai Ioniq 6 AWD', batteryPercent: 21, status: 'REQUIRES_ATTENTION', depotLocation: 'Kuta Depot Bay 03', issueDescription: 'Cabinet derating to 11 kW, missed scheduled dispatch' },
  { id: 'v-05', plateNumber: 'DK 7741 EV', model: 'MG 4 EV Ignite', batteryPercent: 62, status: 'CHARGING', depotLocation: 'Denpasar Hub Bay 07', estimatedFullChargeTime: '15:10' },
  { id: 'v-06', plateNumber: 'DK 5129 EV', model: 'Toyota bZ4X Panoramic', batteryPercent: 18, status: 'REQUIRES_ATTENTION', depotLocation: 'Sanur Hub Bay 04', issueDescription: 'Handshake timeout on CCS2 port' },
  { id: 'v-07', plateNumber: 'DK 6632 EV', model: 'BYD Seal Performance', batteryPercent: 95, status: 'READY', depotLocation: 'Nusa Dua Depot Bay 01' },
  { id: 'v-08', plateNumber: 'DK 2218 EV', model: 'Chery Omoda E5', batteryPercent: 81, status: 'READY', depotLocation: 'Denpasar Hub Bay 09' }
];
