/**
 * VOLTARA Station & Geospatial Data Access Service
 * 
 * Bridges the frontend to Supabase PostGIS and PostgreSQL:
 * - Queries chargers with connectors join and spatial distance
 * - Executes PostGIS RPC `get_nearby_chargers`
 * - Dynamically evaluates deterministic confidence scoring
 * - Generates explainable recommendations
 * - Supports Operator status updates
 */

import { ChargingStation, StationRecommendation } from '../types/station';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { computeChargingConfidence } from '../lib/confidenceEngine';
import { rankChargersForUser } from '../lib/recommendationEngine';
import { MOCK_RECOMMENDATION, MOCK_STATIONS } from './mock/stationsData';

export interface StationFilterParams {
  searchQuery?: string;
  minPowerKw?: number;
  connectorType?: string;
  onlyHighConfidence?: boolean;
  userLocation?: { lat: number; lng: number };
  radiusMeters?: number;
  organizationId?: string;
}

export const stationService = {
  /**
   * Retrieves all chargers or nearby chargers via PostGIS
   */
  async getStations(filters?: StationFilterParams): Promise<ChargingStation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // If user coordinates provided, use PostGIS spatial RPC
        if (filters?.userLocation) {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_chargers', {
            user_lat: filters.userLocation.lat,
            user_lng: filters.userLocation.lng,
            radius_meters: filters.radiusMeters || 30000,
            filter_connector: filters.connectorType || 'ALL',
            min_power: filters.minPowerKw || 0,
          });

          if (!rpcError && rpcData && Array.isArray(rpcData)) {
            return rpcData.map((row: any) => this.mapDbRowToStation(row));
          }
        }

        // Standard relational query with connectors
        let query = supabase
          .from('chargers')
          .select(`
            *,
            charger_connectors (*)
          `)
          .order('name');

        if (filters?.organizationId) {
          query = query.eq('organization_id', filters.organizationId);
        }

        const { data, error } = await query;
        if (!error && data) {
          let stations = data.map((row: any) => this.mapDbRowToStation(row));

          if (filters?.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            stations = stations.filter(
              s => s.name.toLowerCase().includes(q) || s.operator.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
            );
          }

          if (filters?.minPowerKw) {
            stations = stations.filter(s => s.connectors.some(c => c.maxPowerKw >= filters.minPowerKw!));
          }

          if (filters?.connectorType && filters.connectorType !== 'ALL') {
            stations = stations.filter(s => s.connectors.some(c => c.type === filters.connectorType));
          }

          if (filters?.onlyHighConfidence) {
            stations = stations.filter(s => s.confidence.overallScore >= 90);
          }

          return stations;
        }
      } catch (err) {
        console.warn('Supabase getStations encountered an error, falling back to seed data:', err);
      }
    }

    // Local Seed / Mock Fallback
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

    if (filters?.organizationId) {
      // Filter by mock organization if applicable
    }

    return results;
  },

  async getStationById(id: string): Promise<ChargingStation | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .select(`*, charger_connectors (*)`)
          .eq('id', id)
          .single();

        if (!error && data) {
          return this.mapDbRowToStation(data);
        }
      } catch (err) {
        console.warn('getStationById Supabase error:', err);
      }
    }

    const station = MOCK_STATIONS.find(s => s.id === id);
    return station || null;
  },

  /**
   * Deterministic recommendation calculation
   */
  async getActiveRecommendation(userLocation = { lat: -8.6920, lng: 115.2250 }): Promise<StationRecommendation> {
    const stations = await this.getStations();
    const ranked = rankChargersForUser(stations, userLocation);

    if (ranked.length >= 2) {
      const best = ranked[0];
      const alt = ranked[1];
      const timeSaved = Math.max(8, Math.round((alt.distanceKm - best.distanceKm) * 6 + (alt.station.queueLength - best.station.queueLength) * 14));

      return {
        recommendedStationId: best.station.id,
        alternativeStationId: alt.station.id,
        title: `Pilihan Optimal: ${best.station.name}`,
        headlineReason: best.reasons.slice(0, 2).join(' · '),
        reasons: best.reasons,
        netTimeSavedMinutes: timeSaved,
        confidenceDelta: best.station.confidence.overallScore - alt.station.confidence.overallScore
      };
    }

    return MOCK_RECOMMENDATION;
  },

  /**
   * Updates charger status (Operator/Admin operation)
   */
  async updateChargerStatus(chargerId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'FAULT'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('chargers')
        .update({ status: newStatus, last_reported_at: new Date().toISOString() })
        .eq('id', chargerId);
      return !error;
    }
    const target = MOCK_STATIONS.find(s => s.id === chargerId);
    if (target) {
      target.lastReportedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  /**
   * Mapper: Database row -> Domain ChargingStation
   */
  mapDbRowToStation(row: any): ChargingStation {
    const connectors = (row.charger_connectors || row.connectors || []).map((c: any) => ({
      id: c.id,
      bayNumber: c.bayNumber || c.bay_number || 'Bay 01',
      type: c.type || c.connector_type || 'CCS2',
      maxPowerKw: Number(c.maxPowerKw || c.max_power_kw || 150),
      currentPowerKw: Number(c.currentPowerKw || c.current_power_kw || 0),
      status: c.status || 'AVAILABLE',
      currentSessionRemainingMinutes: c.currentSessionRemainingMinutes || c.current_session_remaining_minutes
    }));

    const availableCount = connectors.filter((c: any) => c.status === 'AVAILABLE').length;

    // Dynamically evaluate confidence
    const computedConf = computeChargingConfidence({
      status: row.status,
      healthStatus: row.health_status,
      queueLength: row.queue_length || 0,
      availableConnectorsCount: availableCount,
      totalConnectorsCount: connectors.length,
      lastReportedAt: row.last_reported_at || row.lastReportedAt || new Date().toISOString(),
      recentFailures24h: 0,
      averageObservedPowerKw: connectors.length > 0 ? connectors[0].maxPowerKw * 0.9 : 120,
      maxAdvertisedPowerKw: connectors.length > 0 ? connectors[0].maxPowerKw : 150,
    });

    return {
      id: row.id,
      name: row.name,
      operator: row.operator_name || row.operator || 'VOLTARA Partner',
      address: row.address,
      status: row.status || 'AVAILABLE',
      coordinates: {
        lat: Number(row.latitude),
        lng: Number(row.longitude)
      },
      distanceKm: row.distance_meters ? Number((row.distance_meters / 1000).toFixed(1)) : 2.4,
      pricingPerKwh: Number(row.pricing_per_kwh || 2466),
      currency: row.currency || 'IDR',
      connectors,
      queueLength: row.queue_length ?? 0,
      estimatedWaitMinutes: row.estimated_wait_minutes ?? 0,
      confidence: {
        overallScore: computedConf.score,
        availabilityScore: computedConf.breakdown.availabilityScore,
        handshakeSuccessRate: computedConf.breakdown.handshakeSuccessRate,
        powerStabilityScore: computedConf.breakdown.powerStabilityScore,
        networkLatencyScore: computedConf.breakdown.networkLatencyScore,
        paymentGatewayUptime: computedConf.breakdown.paymentGatewayUptime,
        assessmentSummary: computedConf.summary
      },
      lastReportedAt: row.last_reported_at || row.lastReportedAt || new Date().toISOString(),
      recentFailures24h: 0,
      averageObservedPowerKw: 120
    };
  }
};
