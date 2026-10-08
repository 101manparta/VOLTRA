import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase lokal (hasil `supabase start`) melayani API lewat http://127.0.0.1:54321,
// sehingga host lokal harus diizinkan di samping https untuk deployment.
const isLocalSupabaseHost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(
  supabaseUrl.trim().replace(/\/+$/, '')
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  (supabaseUrl.startsWith('https://') || isLocalSupabaseHost) &&
  !supabaseUrl.includes('your-project-id')
);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn('Supabase client initialization warning:', err);
  }
}

export const supabase: SupabaseClient | null = clientInstance;

/**
 * Returns the active Supabase client or null if unconfigured
 */
export function getSupabase(): SupabaseClient | null {
  return supabase;
}
