/**
 * VOLTARA Charging Session Lifecycle Service
 * 
 * Supports:
 * - Active charging session state & telemetry stream
 * - Session initiation, pause, resume, and completion
 * - Historic transaction logging to Supabase `charging_sessions`
 */

import { HistoricSession, LiveChargingSession, TelemetryPoint } from '../types/session';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { INITIAL_LIVE_SESSION, MOCK_HISTORIC_SESSIONS } from './mock/sessionData';

let localActiveSession: LiveChargingSession = { ...INITIAL_LIVE_SESSION };
let localHistory: HistoricSession[] = [...MOCK_HISTORIC_SESSIONS];

export const sessionService = {
  async getActiveSession(): Promise<LiveChargingSession> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('charging_sessions')
            .select(`
              *,
              chargers (name),
              charger_connectors (connector_type)
            `)
            .eq('user_id', user.id)
            .eq('state', 'CHARGING')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            return {
              sessionId: data.id,
              stationId: data.charger_id,
              stationName: (data.chargers as any)?.name || 'VOLTARA Hub',
              connectorId: data.connector_id,
              connectorType: (data.charger_connectors as any)?.connector_type || 'CCS2',
              startedAt: data.started_at,
              elapsedSeconds: Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000),
              state: data.state,
              currentSocPercent: data.current_soc_percent,
              targetSocPercent: data.target_soc_percent,
              instantaneousPowerKw: Number(data.instantaneous_power_kw),
              energyDeliveredKwh: Number(data.energy_delivered_kwh),
              estimatedMinutesToTarget: Math.max(5, Math.round((data.target_soc_percent - data.current_soc_percent) * 1.2)),
              estimatedCostTotal: Number(data.total_cost),
              currency: data.currency || 'IDR',
              tariffPerKwh: Number(data.tariff_per_kwh),
              powerHistory: localActiveSession.powerHistory,
              hasDeratingAnomaly: data.has_derating_anomaly,
              anomalyMessage: data.anomaly_message
            };
          }
        }
      } catch (err) {
        console.warn('getActiveSession error:', err);
      }
    }

    return localActiveSession;
  },

  async startSession(stationId: string, stationName: string, connectorId: string, connectorType: any): Promise<LiveChargingSession> {
    const startedAt = new Date().toISOString();
    const newSession: LiveChargingSession = {
      sessionId: `ses-${Date.now().toString(36)}`,
      stationId,
      stationName,
      connectorId,
      connectorType,
      startedAt,
      elapsedSeconds: 0,
      state: 'CHARGING',
      currentSocPercent: 32,
      targetSocPercent: 80,
      instantaneousPowerKw: 110.0,
      energyDeliveredKwh: 0.1,
      estimatedMinutesToTarget: 22,
      estimatedCostTotal: 250,
      currency: 'IDR',
      tariffPerKwh: 2466,
      powerHistory: [{
        timestamp: startedAt,
        powerKw: 110.0,
        socPercent: 32,
        voltageV: 400,
        currentA: 275
      }],
      hasDeratingAnomaly: false
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('charging_sessions')
            .insert({
              user_id: user.id,
              charger_id: stationId,
              connector_id: connectorId,
              state: 'CHARGING',
              start_soc_percent: 32,
              current_soc_percent: 32,
              target_soc_percent: 80,
              instantaneous_power_kw: 110.0,
              energy_delivered_kwh: 0.1,
              tariff_per_kwh: 2466,
              currency: 'IDR'
            })
            .select()
            .single();

          if (!error && data) {
            newSession.sessionId = data.id;
          }
        }
      } catch (err) {
        console.warn('startSession Supabase insert error:', err);
      }
    }

    localActiveSession = newSession;
    return localActiveSession;
  },

  async stopSession(session: LiveChargingSession): Promise<HistoricSession> {
    const endedAt = new Date().toISOString();
    const durationMinutes = Math.max(1, Math.round(session.elapsedSeconds / 60));
    
    const historicRecord: HistoricSession = {
      id: session.sessionId,
      stationName: session.stationName,
      operator: 'VOLTARA Partner Network',
      date: endedAt,
      durationMinutes,
      energyKwh: Number(session.energyDeliveredKwh.toFixed(1)),
      totalCost: session.estimatedCostTotal,
      currency: session.currency,
      averagePowerKw: Number((session.instantaneousPowerKw * 0.9).toFixed(1)),
      connectorType: session.connectorType,
      status: session.hasDeratingAnomaly ? 'DERATED' : 'COMPLETED'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('charging_sessions')
          .update({
            state: 'COMPLETED',
            ended_at: endedAt,
            current_soc_percent: session.currentSocPercent,
            energy_delivered_kwh: session.energyDeliveredKwh,
            total_cost: session.estimatedCostTotal,
            has_derating_anomaly: session.hasDeratingAnomaly,
            anomaly_message: session.anomalyMessage
          })
          .eq('id', session.sessionId);
      } catch (err) {
        console.warn('stopSession Supabase update error:', err);
      }
    }

    localActiveSession = {
      ...session,
      state: 'COMPLETED',
      instantaneousPowerKw: 0
    };
    localHistory = [historicRecord, ...localHistory];
    return historicRecord;
  },

  async getSessionHistory(): Promise<HistoricSession[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('charging_sessions')
            .select(`
              *,
              chargers (name, operator_name),
              charger_connectors (connector_type)
            `)
            .eq('user_id', user.id)
            .order('started_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
              id: d.id,
              stationName: (d.chargers as any)?.name || 'SPKLU Bali Hub',
              operator: (d.chargers as any)?.operator_name || 'PLN UID Bali',
              date: d.started_at,
              durationMinutes: d.ended_at 
                ? Math.round((new Date(d.ended_at).getTime() - new Date(d.started_at).getTime()) / 60000)
                : 28,
              energyKwh: Number(d.energy_delivered_kwh || 22.4),
              totalCost: Number(d.total_cost || 55200),
              currency: d.currency || 'IDR',
              averagePowerKw: Number(d.instantaneous_power_kw || 48),
              connectorType: (d.charger_connectors as any)?.connector_type || 'CCS2',
              status: d.has_derating_anomaly ? 'DERATED' : 'COMPLETED'
            }));
          }
        }
      } catch (err) {
        console.warn('getSessionHistory Supabase error:', err);
      }
    }

    return localHistory;
  }
};
