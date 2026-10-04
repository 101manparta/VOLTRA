/**
 * VOLTARA Supabase Realtime Subscription Manager
 * 
 * Manages live WebSocket event channels for:
 * 1. `chargers`: Live status & queue updates across Bali
 * 2. `actionable_alerts`: Instant critical alerts for users and operators
 * 3. `charging_sessions`: Real-time session state progression
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';

export type ChargerChangeCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRecord: any;
  oldRecord: any;
}) => void;

export type AlertChangeCallback = (newAlert: any) => void;

export const realtimeManager = {
  /**
   * Subscribes to live changes on the `chargers` table
   */
  subscribeToChargers(onUpdate: ChargerChangeCallback): RealtimeChannel | null {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const channel = supabase
      .channel('voltara-public-chargers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chargers' },
        (payload: any) => {
          onUpdate({
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Channel active
        }
      });

    return channel;
  },

  /**
   * Subscribes to new actionable alerts for a user or organization
   */
  subscribeToAlerts(userId: string | undefined, onAlert: AlertChangeCallback): RealtimeChannel | null {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const channel = supabase
      .channel(`voltara-alerts-${userId || 'public'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'actionable_alerts' },
        (payload: any) => {
          onAlert(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Subscribes to active session progression
   */
  subscribeToSession(sessionId: string, onUpdate: (session: any) => void): RealtimeChannel | null {
    if (!isSupabaseConfigured || !supabase || !sessionId) {
      return null;
    }

    const channel = supabase
      .channel(`voltara-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'charging_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload: any) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Safely unsubscribe a channel
   */
  unsubscribe(channel: RealtimeChannel | null) {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  }
};
