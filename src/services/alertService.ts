/**
 * VOLTARA Actionable Alerts Service
 * 
 * Interacts with Supabase `actionable_alerts` table:
 * - Scoped to user or organization
 * - Filtered by unread state
 * - Supports marking alerts as read/dismissed
 */

import { ActionableAlert } from '../types/alert';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { MOCK_ALERTS } from './mock/alertsData';

let localAlerts: ActionableAlert[] = [...MOCK_ALERTS];

export const alertService = {
  async getAlerts(userId?: string, organizationId?: string): Promise<ActionableAlert[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('actionable_alerts')
          .select(`
            *,
            chargers (name)
          `)
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.or(`user_id.eq.${userId},organization_id.is.null`);
        } else if (organizationId) {
          query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((a: any) => ({
            id: a.id,
            timestamp: a.created_at,
            severity: a.severity,
            title: a.title,
            description: a.description,
            stationName: (a.chargers as any)?.name,
            actionLabel: a.action_label,
            actionType: a.action_type,
            targetId: a.target_id || a.charger_id,
            isRead: a.is_read
          }));
        }
      } catch (err) {
        console.warn('getAlerts Supabase query error:', err);
      }
    }

    return [...localAlerts];
  },

  async markAsRead(alertId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('actionable_alerts')
          .update({ is_read: true })
          .eq('id', alertId);
        return !error;
      } catch (err) {
        console.warn('markAsRead Supabase error:', err);
      }
    }

    const alert = localAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      return true;
    }
    return false;
  },

  async addAlert(alert: Omit<ActionableAlert, 'id' | 'timestamp'>): Promise<ActionableAlert> {
    const newAlert: ActionableAlert = {
      ...alert,
      id: `alt-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('actionable_alerts').insert({
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          action_label: alert.actionLabel,
          action_type: alert.actionType,
          target_id: alert.targetId,
          is_read: false
        });
      } catch (err) {
        console.warn('addAlert error:', err);
      }
    }

    localAlerts = [newAlert, ...localAlerts];
    return newAlert;
  }
};
