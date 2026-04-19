/** Reads/writes for `public.price_history` using the client from `src/lib/supabase.js`. */
import { addCalendarDays, todayISODateLocal } from '@/lib/dateDisplay';
import { isSupabaseConfigured, supabase } from '@/lib/supabase.js';
import type { Investment, PriceHistoryRow } from '@/types';

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

function dailyJitter(assetName: string, isoDate: string): number {
  const s = `${assetName}|${isoDate}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 4294967296;
  return -0.02 + u * 0.04;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * If `price_history` is empty and Supabase is configured, inserts ~30 days of
 * synthetic points per Medium/High asset (deterministic jitter), anchoring today at `investment.current`.
 */
export async function seedDemoHistoryIfEmpty(investments: Investment[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const existing = await fetchAllPriceHistory();
  if (existing.length > 0) return false;

  const todayStr = todayISODateLocal();
  const mh = investments.filter((i) => i.risk === 'Medium' || i.risk === 'High');

  const batch: { asset_name: string; date: string; value_rm: number }[] = [];
  for (const inv of mh) {
    let v = inv.current;
    for (let i = 0; i < 30; i++) {
      const date = addCalendarDays(todayStr, -i);
      batch.push({ asset_name: inv.name, date, value_rm: round2(v) });
      if (i < 29) {
        const older = addCalendarDays(todayStr, -i - 1);
        const delta = dailyJitter(inv.name, older);
        v = v / (1 + delta);
      }
    }
  }

  const { error } = await supabase.from('price_history').upsert(batch, {
    onConflict: 'asset_name,date',
  });

  if (error) {
    console.error('seedDemoHistoryIfEmpty:', error.message);
    return false;
  }
  return true;
}
