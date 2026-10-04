import { ChargingStation, StationRecommendation } from '../types/station';
import { MOCK_RECOMMENDATION, MOCK_STATIONS } from './mock/stationsData';

export interface StationFilterParams {
  searchQuery?: string;
  minPowerKw?: number;
  connectorType?: string;
  onlyHighConfidence?: boolean;
}

export const stationService = {
  async getStations(filters?: StationFilterParams): Promise<ChargingStation[]> {
    // Simulates network latency
    let results = [...MOCK_STATIONS];

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        s => s.name.toLowerCase().includes(q) || s.operator.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    if (filters?.minPowerKw) {
      results = results.filter(s => s.connectors.some(c => c.maxPowerKw >= filters.minPowerKw!));
    }

    if (filters?.connectorType && filters.connectorType !== 'ALL') {
      results = results.filter(s => s.connectors.some(c => c.type === filters.connectorType));
    }

    if (filters?.onlyHighConfidence) {
      results = results.filter(s => s.confidence.overallScore >= 90);
    }

    return results;
  },

  async getStationById(id: string): Promise<ChargingStation | null> {
    const station = MOCK_STATIONS.find(s => s.id === id);
    return station || null;
  },

  async getActiveRecommendation(): Promise<StationRecommendation> {
    return MOCK_RECOMMENDATION;
  }
};
