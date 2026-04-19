/** Reads/writes for `public.activities` using the client from `src/lib/supabase.js`. */
import { supabase } from '@/lib/supabase.js';
import type { ActivityRow, ActivityType } from '@/types';

function mapRow(row: Record<string, unknown>): ActivityRow {
  return {
    id: String(row.id),
    created_at: String(row.created_at ?? ''),
    date: String(row.date),
    description: String(row.description ?? ''),
    amount: Number(row.amount),
    type: row.type as ActivityType,
    account: String(row.account ?? ''),
  };
}

export async function fetchActivities(): Promise<ActivityRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('activities fetch:', error.message);
    return [];
  }

  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function insertActivity(
  row: Omit<ActivityRow, 'id' | 'created_at'>,
): Promise<ActivityRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('activities')
    .insert({
      date: row.date,
      description: row.description,
      amount: row.amount,
      type: row.type,
      account: row.account,
    })
    .select()
    .single();

  if (error) {
    console.error('activities insert:', error.message);
    return null;
  }

  return mapRow(data as Record<string, unknown>);
}
