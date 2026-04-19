/** Reads/writes for `public.price_history` using the client from `src/lib/supabase.js`. */
import { supabase } from '@/lib/supabase.js';
import type { PriceHistoryRow } from '@/types';

function mapRow(row: Record<string, unknown>): PriceHistoryRow {
  return {
    id: String(row.id),
    created_at: String(row.created_at ?? ''),
    asset_name: String(row.asset_name),
    date: String(row.date),
    value_rm: Number(row.value_rm),
  };
}

export async function fetchAllPriceHistory(): Promise<PriceHistoryRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .order('date', { ascending: true })
    .order('asset_name', { ascending: true });

  if (error) {
    console.error('price_history fetch:', error.message);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function upsertPriceEntry(
  assetName: string,
  date: string,
  valueRm: number,
): Promise<PriceHistoryRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('price_history')
    .upsert(
      { asset_name: assetName, date, value_rm: valueRm },
      { onConflict: 'asset_name,date' },
    )
    .select()
    .single();

  if (error) {
    console.error('price_history upsert:', error.message);
    return null;
  }
  return mapRow(data as Record<string, unknown>);
}
