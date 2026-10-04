/**
 * VOLTARA Authentication & Role Service
 * 
 * Supports Supabase Auth (email/password, session tokens) with RBAC roles:
 * - USER
 * - OPERATOR
 * - FLEET_MANAGER
 * - ADMIN
 * - SUPER_ADMIN
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export type UserRole = 'USER' | 'OPERATOR' | 'FLEET_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
  organizationName?: string;
  organizationType?: 'OPERATOR' | 'FLEET' | 'PLATFORM';
}

// Development default mock personas for testing
export const DEMO_PERSONAS: Record<UserRole, UserProfile> = {
  USER: {
    id: 'usr-001',
    email: 'driver.bali@voltara.io',
    fullName: 'I Wayan Arya (EV Driver)',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  OPERATOR: {
    id: 'op-001',
    email: 'ops.pln@voltara.io',
    fullName: 'Made Suardana (CPO Manager)',
    role: 'OPERATOR',
    organizationId: 'a0000000-0000-0000-0000-000000000001',
    organizationName: 'PLN UID Bali (Icon+)',
    organizationType: 'OPERATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  FLEET_MANAGER: {
    id: 'flt-001',
    email: 'fleet.logistics@balieco.com',
    fullName: 'Ketut Astawa (Fleet Logistics)',
    role: 'FLEET_MANAGER',
    organizationId: 'b0000000-0000-0000-0000-000000000001',
    organizationName: 'Bali Eco Trans Logistics',
    organizationType: 'FLEET',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  ADMIN: {
    id: 'adm-001',
    email: 'platform.admin@voltara.io',
    fullName: 'Nyoman Dewi (Platform Architect)',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  SUPER_ADMIN: {
    id: 'root-001',
    email: 'security.root@voltara.io',
    fullName: 'Chief Security Officer (Super Admin)',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
  },
};

let currentActiveProfile: UserProfile = DEMO_PERSONAS.USER;

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async getCurrentProfile(): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            // Check organization membership
            const { data: membership } = await supabase
              .from('organization_members')
              .select('organization_id, organizations(name, type)')
              .eq('user_id', user.id)
              .maybeSingle();

            return {
              id: user.id,
              email: user.email || '',
              fullName: profile.full_name || 'VOLTARA User',
              role: (profile.role as UserRole) || 'USER',
              avatarUrl: profile.avatar_url,
              organizationId: membership?.organization_id,
              organizationName: (membership?.organizations as any)?.name,
              organizationType: (membership?.organizations as any)?.type,
            };
          }
        }
      } catch (err) {
        console.warn('Failed to load profile from Supabase, using local fallback:', err);
      }
    }

    return currentActiveProfile;
  },

  async switchDemoPersona(role: UserRole): Promise<UserProfile> {
    currentActiveProfile = DEMO_PERSONAS[role];
    return currentActiveProfile;
  },

  async signIn(email: string, password: string):Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const profile = await this.getCurrentProfile();
        return { success: true, profile };
      }
    }

    // Demo fallback for testing without credentials
    const matching = Object.values(DEMO_PERSONAS).find(p => p.email === email);
    if (matching) {
      currentActiveProfile = matching;
      return { success: true, profile: matching };
    }
    
    currentActiveProfile = {
      ...DEMO_PERSONAS.USER,
      email,
      fullName: email.split('@')[0],
    };
    return { success: true, profile: currentActiveProfile };
  },

  async signUp(email: string, password: string, fullName: string, role: UserRole = 'USER'): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    return { success: true };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    currentActiveProfile = DEMO_PERSONAS.USER;
  }
};
