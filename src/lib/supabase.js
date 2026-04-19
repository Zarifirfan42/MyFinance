import { createClient } from '@supabase/supabase-js';

/**
 * Single Supabase client for the app (`activities`, `price_history`, etc.).
 * `VITE_SUPABASE_ANON_KEY` may be the legacy `anon` JWT or the newer
 * publishable key (`sb_publishable_...`) — both work with createClient(url, key).
 */
const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(url && key);

/** Null when URL or anon key is missing from `.env`. */
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
