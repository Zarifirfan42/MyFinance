import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PriceChartEmpty } from '@/components/PriceChartEmpty';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatDisplayDate, todayISODateLocal } from '@/lib/dateDisplay';
import { formatRMUnsigned } from '@/lib/currency';
import { downloadTextFile, exportPriceHistoryCsv } from '@/lib/exportActivitiesCsv';
import {
  buildPlLogEntries,
  chartRangeStart,
  filterPlEntries,
  filterPricePointsByRange,
  groupPriceHistoryByAsset,
  plTodayWeekMonthYear,
  todayGainLossSplit,
  type TableFilter,
} from '@/lib/priceHistoryMath';
import { formatPlPct, formatPlRm, plCardStyle, plRmStyle } from '@/lib/plFormat';
import { fetchAllPriceHistory } from '@/lib/priceHistoryService';
import { usePageTitle } from '@/lib/usePageTitle';
import { isSupabaseConfigured } from '@/lib/supabase.js';
import type { PriceHistoryRow } from '@/types';

const TABLE_FILTERS: { id: TableFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

const RANGE_PRESETS = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;

export function PriceHistoryPl() {
  usePageTitle('P&L');
  const { investments } = usePortfolio();
  const [rows, setRows] = useState<PriceHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tableFilter, setTableFilter] = useState<TableFilter>('all');
  const [chartAsset, setChartAsset] = useState('');
  const [chartRange, setChartRange] = useState<(typeof RANGE_PRESETS)[number]>('3M');

  const today = todayISODateLocal();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllPriceHistory();
    setRows(data);
    setLoading(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const assetNames = useMemo(() => {
    const fromDb = [...new Set(rows.map((r) => r.asset_name))];
    const fromInv = investments.map((i) => i.name);
    return [...new Set([...fromDb, ...fromInv])].sort();
  }, [rows, investments]);

  useEffect(() => {
    if (!chartAsset && assetNames.length) setChartAsset(assetNames[0]);
  }, [assetNames, chartAsset]);

  const byAsset = useMemo(() => groupPriceHistoryByAsset(rows), [rows]);

  const plEntries = useMemo(() => buildPlLogEntries(rows), [rows]);

  const filteredTable = useMemo(
    () => filterPlEntries(plEntries, tableFilter, today),
    [plEntries, tableFilter, today],
  );

  const periods = useMemo(() => plTodayWeekMonthYear(byAsset, today), [byAsset, today]);

  const todaySplit = useMemo(() => todayGainLossSplit(byAsset, today), [byAsset, today]);

  const selectedInv = investments.find((i) => i.name === chartAsset);
  const costBasis = selectedInv?.cost ?? null;
  const chartFrom = chartRangeStart(today, chartRange);

  const chartPoints = useMemo(() => {
    const chartSeries = byAsset.get(chartAsset) ?? [];
    const sorted = [...chartSeries].sort((a, b) => a.date.localeCompare(b.date));
    const sliced = chartFrom
      ? filterPricePointsByRange(sorted, chartFrom, today)
      : filterPricePointsByRange(sorted, null, today);
    return sliced.map((p) => ({
      ...p,
      label: formatDisplayDate(p.date),
    }));
  }, [byAsset, chartAsset, chartFrom, today]);

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : null;

  function handleExportCsv() {
    const csv = exportPriceHistoryCsv(filteredTable);
    downloadTextFile(`myfinance-pnl-${tableFilter}-${today}.csv`, csv);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Price history / P&amp;L log</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Day-over-day changes from Supabase <code className="text-xs">price_history</code>.
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          Add Supabase credentials in <code className="text-xs">.env</code> to load price data.
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's P&L (RM)", v: periods.today },
            { label: "This Week's P&L (RM)", v: periods.week },
            { label: "This Month's P&L (RM)", v: periods.month },
            { label: "This Year's P&L (RM)", v: periods.year },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800"
              style={plCardStyle(card.v)}
            >
              <p className="text-xs font-medium opacity-90">{card.label}</p>
              <p className="mt-1 text-lg font-semibold">{formatPlRm(card.v)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Price chart</p>
            {lastUpdatedStr ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: {lastUpdatedStr}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="block text-sm font-medium">
            Asset
            <select
              value={chartAsset}
              onChange={(e) => setChartAsset(e.target.value)}
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {assetNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {RANGE_PRESETS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  chartRange === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          {chartPoints.length === 0 ? (
            <PriceChartEmpty />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => formatDisplayDate(String(d))}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `RM ${Number(v).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { date: string; value_rm: number };
                    const vsCost =
                      costBasis != null && costBasis !== 0
                        ? ((p.value_rm - costBasis) / costBasis) * 100
                        : null;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow dark:border-slate-700 dark:bg-slate-900">
                        <div className="text-xs text-slate-500">{formatDisplayDate(p.date)}</div>
                        <div className="font-semibold">{formatRMUnsigned(p.value_rm)}</div>
                        {vsCost != null ? (
                          <div style={{ color: vsCost >= 0 ? '#3B6D11' : '#A32D2D' }}>
                            vs cost: {formatPlPct(vsCost)}
                          </div>
                        ) : null}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value_rm"
                  stroke="#378ADD"
                  strokeWidth={2}
                  dot={false}
                  name="Value"
                />
                {costBasis != null ? (
                  <ReferenceLine
                    y={costBasis}
                    stroke="#A32D2D"
                    strokeDasharray="5 5"
                    label={{ value: 'Cost', fill: '#A32D2D', fontSize: 11 }}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Daily P&amp;L history
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {TABLE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTableFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                tableFilter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredTable.length === 0 || loading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Asset</th>
                <th className="px-4 py-3 font-semibold text-right">Previous (RM)</th>
                <th className="px-4 py-3 font-semibold text-right">Current (RM)</th>
                <th className="px-4 py-3 font-semibold text-right">Change (RM)</th>
                <th className="px-4 py-3 font-semibold text-right">Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No price data yet — add your first entry on Investments.
                  </td>
                </tr>
              ) : (
                filteredTable.map((row, idx) => (
                  <tr
                    key={`${row.asset}-${row.date}-${idx}`}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(row.date)}</td>
                    <td className="px-4 py-3">{row.asset}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatRMUnsigned(row.previousValue)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatRMUnsigned(row.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums" style={plRmStyle(row.changeRm)}>
                      {formatPlRm(row.changeRm)}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-medium tabular-nums"
                      style={{
                        color:
                          row.changePct > 0
                            ? '#3B6D11'
                            : row.changePct < 0
                              ? '#A32D2D'
                              : undefined,
                      }}
                    >
                      {formatPlPct(row.changePct)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && rows.length > 0 ? (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                  <td colSpan={4} className="px-4 py-3 font-semibold">
                    Today (portfolio)
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span className="text-[#3B6D11]">Total gain today</span>
                    <div>{formatPlRm(todaySplit.gain)}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span className="text-[#A32D2D]">Total loss today</span>
                    <div>{formatPlRm(todaySplit.loss)}</div>
                  </td>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  <td colSpan={4} className="px-4 py-3 font-semibold">
                    Net P&amp;L today
                  </td>
                  <td colSpan={2} className="px-4 py-3 text-right font-bold" style={plRmStyle(todaySplit.net)}>
                    {formatPlRm(todaySplit.net)}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  );
}
