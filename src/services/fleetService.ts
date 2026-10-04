import { FleetOptimizationMetrics, FleetVehicle } from '../types/fleet';
import { MOCK_FLEET_METRICS, MOCK_FLEET_VEHICLES } from './mock/fleetData';

export const fleetService = {
  async getMetrics(): Promise<FleetOptimizationMetrics> {
    return { ...MOCK_FLEET_METRICS };
  },

  async getVehicles(): Promise<FleetVehicle[]> {
    return [...MOCK_FLEET_VEHICLES];
  }
};
