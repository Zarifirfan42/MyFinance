import type { BankAccount, Investment } from '@/types';
import { netWorth } from '@/lib/calculations';

const KEY = 'myfinance-networth-history-v1';

export interface NetWorthPoint {
  date: string;
  netWorth: number;
}

export function loadNetWorthHistory(): NetWorthPoint[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NetWorthPoint[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && typeof p.date === 'string' && typeof p.netWorth === 'number')
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

/** Upserts today’s point and keeps roughly the last year of daily samples. */
export function appendNetWorthSnapshot(value: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const list = loadNetWorthHistory();
  const idx = list.findIndex((p) => p.date === today);
  const point: NetWorthPoint = { date: today, netWorth: value };
  if (idx >= 0) list[idx] = point;
  else list.push(point);
  list.sort((a, b) => a.date.localeCompare(b.date));

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 365);
  const cutStr = cutoff.toISOString().slice(0, 10);
  const pruned = list.filter((p) => p.date >= cutStr);

  localStorage.setItem(KEY, JSON.stringify(pruned));
}

export function snapNetWorthFromPortfolio(
  banks: BankAccount[],
  investments: Investment[],
): void {
  appendNetWorthSnapshot(netWorth(banks, investments));
}
