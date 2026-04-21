import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

let _admin: SupabaseClient<Database> | null = null;

/**
 * Server / bot only. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY');
  }
  _admin = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
