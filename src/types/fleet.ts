export type VehicleStatus = 'READY' | 'CHARGING' | 'REQUIRES_ATTENTION';

export interface FleetVehicle {
  id: string;
  plateNumber: string;
  model: string;
  batteryPercent: number;
  status: VehicleStatus;
  depotLocation: string;
  estimatedFullChargeTime?: string;
  issueDescription?: string;
  assignedDriver?: string;
}

export interface FleetOptimizationMetrics {
  totalVehicles: number;
  readyCount: number;
  chargingCount: number;
  attentionCount: number;
  todayChargingCost: number;        // e.g. 4280000 IDR (Rp 4.28M)
  estimatedOptimizedCost: number;   // e.g. 3710000 IDR (Rp 3.71M)
  potentialSavings: number;         // e.g. 570000 IDR (Rp 570K)
  currency: string;
  averageFleetSoc: number;
  activeAiAlertsCount: number;
}
