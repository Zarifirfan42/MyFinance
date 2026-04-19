import type { PriceHistoryRow } from '@/types';

export interface PricePoint {
  date: string;
  value_rm: number;
}

export interface PlLogEntry {
  date: string;
  asset: string;
  previousValue: number;
  currentValue: number;
  changeRm: number;
  changePct: number;
}

export function groupPriceHistoryByAsset(rows: PriceHistoryRow[]): Map<string, PricePoint[]> {
  const m = new Map<string, PricePoint[]>();
  for (const r of rows) {
    const list = m.get(r.asset_name) ?? [];
    list.push({ date: r.date, value_rm: Number(r.value_rm) });
    m.set(r.asset_name, list);
  }
  for (const [k, list] of m) {
    list.sort((a, b) => a.date.localeCompare(b.date));
    m.set(k, list);
  }
  return m;
}

export function valueOnDate(series: PricePoint[], dateStr: string): number | undefined {
  return series.find((x) => x.date === dateStr)?.value_rm;
}

export function latestPoint(series: PricePoint[]): PricePoint | undefined {
  if (series.length === 0) return undefined;
  return series[series.length - 1];
}

/** Prefer latest price_history point; fallback to portfolio `current`. */
export function resolveDisplayCurrent(
  portfolioCurrent: number,
  series: PricePoint[] | undefined,
): number {
  const lp = latestPoint(series ?? []);
  return lp?.value_rm ?? portfolioCurrent;
}

/** Last `n` dated points, sorted ascending by date. */
export function lastNPoints(series: PricePoint[], n: number): PricePoint[] {
  if (n <= 0) return [];
  const s = [...series].sort((a, b) => a.date.localeCompare(b.date));
  return s.slice(-n);
}

/**
 * Today vs calendar-yesterday values. Returns null if either side is missing.
 */
export function todayVsYesterdayPct(series: PricePoint[], todayStr: string): number | null {
  const y = addDaysLocal(todayStr, -1);
  const vT = valueOnDate(series, todayStr);
  const vY = valueOnDate(series, y);
  if (vT == null || vY == null || vY === 0) return null;
  return ((vT - vY) / vY) * 100;
}

function addDaysLocal(isoDate: string, delta: number): string {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** One row per (asset, date) where a previous dated point exists in history. */
export function buildPlLogEntries(rows: PriceHistoryRow[]): PlLogEntry[] {
  return fixBuildPlLog(groupPriceHistoryByAsset(rows));
}

function fixBuildPlLog(byAsset: Map<string, PricePoint[]>): PlLogEntry[] {
  const out: PlLogEntry[] = [];
  for (const [asset, series] of byAsset) {
    const s = [...series].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < s.length; i++) {
      const prev = s[i - 1];
      const cur = s[i];
      const changeRm = cur.value_rm - prev.value_rm;
      const changePct = prev.value_rm !== 0 ? (changeRm / prev.value_rm) * 100 : 0;
      out.push({
        date: cur.date,
        asset,
        previousValue: prev.value_rm,
        currentValue: cur.value_rm,
        changeRm,
        changePct,
      });
    }
  }
  out.sort((a, b) => {
    const c = b.date.localeCompare(a.date);
    if (c !== 0) return c;
    return a.asset.localeCompare(b.asset);
  });
  return out;
}

export type TableFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export function filterPlEntries(
  entries: PlLogEntry[],
  filter: TableFilter,
  referenceDate: string,
): PlLogEntry[] {
  if (filter === 'all') return entries;
  if (filter === 'today') return entries.filter((e) => e.date === referenceDate);
  if (filter === 'week') {
    const start = startOfWeekMonday(referenceDate);
    return entries.filter((e) => e.date >= start && e.date <= referenceDate);
  }
  if (filter === 'month') {
    const prefix = referenceDate.slice(0, 7);
    return entries.filter((e) => e.date.startsWith(prefix));
  }
  if (filter === 'year') {
    const y = referenceDate.slice(0, 4);
    return entries.filter((e) => e.date.startsWith(y));
  }
  return entries;
}

export function chartRangeStart(todayStr: string, preset: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'): string | null {
  if (preset === 'ALL') return null;
  const days =
    preset === '1W'
      ? 7
      : preset === '1M'
        ? 30
        : preset === '3M'
          ? 90
          : preset === '6M'
            ? 180
            : 365;
  return addDaysLocal(todayStr, -days);
}

function startOfWeekMonday(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

/** Calendar day-over-day: each asset vs previous calendar day (if both exist). */
export function portfolioDodRmForDate(
  byAsset: Map<string, PricePoint[]>,
  dateStr: string,
): number {
  const prevCal = addDaysLocal(dateStr, -1);
  let sum = 0;
  for (const series of byAsset.values()) {
    const vToday = valueOnDate(series, dateStr);
    const vPrev = valueOnDate(series, prevCal);
    if (vToday == null || vPrev == null) continue;
    sum += vToday - vPrev;
  }
  return sum;
}

/** Sum portfolio DOD for each day in [fromStr, toStr] inclusive. */
export function sumPortfolioDodOverRange(
  byAsset: Map<string, PricePoint[]>,
  fromStr: string,
  toStr: string,
): number {
  let total = 0;
  const d = new Date(fromStr + 'T12:00:00');
  const end = new Date(toStr + 'T12:00:00');
  while (d <= end) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const ds = `${y}-${m}-${day}`;
    total += portfolioDodRmForDate(byAsset, ds);
    d.setDate(d.getDate() + 1);
  }
  return total;
}

/** Calendar today vs yesterday per asset; gain = sum(positive deltas), loss = sum(negative). */
export function todayGainLossSplit(
  byAsset: Map<string, PricePoint[]>,
  todayStr: string,
): { gain: number; loss: number; net: number } {
  const prevCal = addDaysLocal(todayStr, -1);
  let gain = 0;
  let loss = 0;
  for (const series of byAsset.values()) {
    const vT = valueOnDate(series, todayStr);
    const vP = valueOnDate(series, prevCal);
    if (vT == null || vP == null) continue;
    const d = vT - vP;
    if (d > 0) gain += d;
    else if (d < 0) loss += d;
  }
  return { gain, loss, net: gain + loss };
}

export function filterPricePointsByRange(
  series: PricePoint[],
  fromStr: string | null,
  toStr: string | null,
): PricePoint[] {
  return series.filter((p) => {
    if (fromStr && p.date < fromStr) return false;
    if (toStr && p.date > toStr) return false;
    return true;
  });
}

export function plTodayWeekMonthYear(
  byAsset: Map<string, PricePoint[]>,
  ref: string,
): { today: number; week: number; month: number; year: number } {
  const w0 = startOfWeekMonday(ref);
  const m0 = ref.slice(0, 7) + '-01';
  const y0 = ref.slice(0, 4) + '-01-01';
  return {
    today: portfolioDodRmForDate(byAsset, ref),
    week: sumPortfolioDodOverRange(byAsset, w0, ref),
    month: sumPortfolioDodOverRange(byAsset, m0, ref),
    year: sumPortfolioDodOverRange(byAsset, y0, ref),
  };
}
