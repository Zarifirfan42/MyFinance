import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { formatRM } from '@/lib/currency';
import {
  lastNPoints,
  resolveDisplayCurrent,
  todayVsYesterdayPct,
  type PricePoint,
} from '@/lib/priceHistoryMath';
import { formatPlPct } from '@/lib/plFormat';
import { PL_NEG, PL_POS } from '@/lib/plStyles';
import { todayISODateLocal } from '@/lib/dateDisplay';
import type { Investment } from '@/types';

interface Props {
  inv: Investment;
  series: PricePoint[];
  /** When true and no series yet, show skeleton */
  loading?: boolean;
  onEdit: () => void;
}

export function InvestmentMHCard({ inv, series, loading, onEdit }: Props) {
  const todayStr = todayISODateLocal();
  const effective = resolveDisplayCurrent(inv.current, series);
  const spark = lastNPoints(series, 7).map((p) => ({
    label: p.date.slice(5),
    v: p.value_rm,
  }));
  const cost = inv.cost;
  const totalPct =
    cost != null && cost !== 0 ? ((effective - cost) / cost) * 100 : null;
  const todayPct = todayVsYesterdayPct(series, todayStr);
  const lineColor = cost != null && effective >= cost ? PL_POS.text : PL_NEG.text;
  const hasCost = cost != null && cost > 0;
  const costBarFill =
    hasCost && effective >= (cost as number) ? '#639922' : hasCost ? '#E24B4A' : '#94a3b8';
  const costBarWidthPct = hasCost
    ? (Math.min((effective / (cost as number)) * 100, 150) / 150) * 100
    : 0;
  const costLabelPct =
    hasCost && (cost as number) !== 0
      ? ((effective - (cost as number)) / (cost as number)) * 100
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {loading && series.length === 0 ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">{inv.name}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {inv.risk}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Current</span>
              <p className="font-semibold">{formatRM(effective)}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Cost basis</span>
              <p className="font-semibold">
                {cost != null ? formatRM(cost) : '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total P&amp;L</span>
              <p
                className="font-semibold"
                style={{
                  color:
                    totalPct == null
                      ? undefined
                      : totalPct >= 0
                        ? PL_POS.text
                        : PL_NEG.text,
                }}
              >
                {totalPct == null ? '—' : formatPlPct(totalPct)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Today P&amp;L</span>
              <p
                className="font-semibold"
                style={{
                  color:
                    todayPct == null
                      ? undefined
                      : todayPct >= 0
                        ? PL_POS.text
                        : PL_NEG.text,
                }}
              >
                {todayPct == null ? (
                  <span className="text-slate-400 font-normal">No data</span>
                ) : (
                  formatPlPct(todayPct)
                )}
              </p>
            </div>
          </div>

          {hasCost ? (
            <div className="mt-4 space-y-1.5">
              <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-[3px] transition-[width]"
                  style={{
                    width: `${costBarWidthPct}%`,
                    backgroundColor: costBarFill,
                  }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {formatRM(effective)} / {formatRM(cost as number)}
                {costLabelPct != null ? (
                  <span className="ml-1 font-medium" style={{ color: costBarFill }}>
                    ({formatPlPct(costLabelPct)})
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          <div className="mt-4 h-28 w-full">
            {spark.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No price history yet — add an entry above.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(val: number) =>
                      val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  {cost != null ? (
                    <ReferenceLine
                      y={cost}
                      stroke="#A32D2D"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  ) : null}
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="mt-4 w-full sm:w-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit value (local)
          </button>
        </>
      )}
    </div>
  );
}

export function InvestmentLowCard({
  inv,
  series,
  loading,
  onEdit,
}: {
  inv: Investment;
  series: PricePoint[];
  loading?: boolean;
  onEdit: () => void;
}) {
  const effective = resolveDisplayCurrent(inv.current, series);
  const totalPct =
    inv.cost != null && inv.cost !== 0
      ? ((effective - inv.cost) / inv.cost) * 100
      : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {loading && series.length === 0 ? (
        <div className="animate-pulse flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">{inv.name}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {inv.risk}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <span>
              Current:{' '}
              <strong className="text-slate-900 dark:text-slate-100">{formatRM(effective)}</strong>
            </span>
            <span>
              Cost:{' '}
              {inv.cost != null ? (
                <strong className="text-slate-900 dark:text-slate-100">
                  {formatRM(inv.cost)}
                </strong>
              ) : (
                '—'
              )}
            </span>
            {totalPct != null ? (
              <span style={{ color: totalPct >= 0 ? PL_POS.text : PL_NEG.text }} className="font-semibold">
                {formatPlPct(totalPct)}
              </span>
            ) : null}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Edit value
      </button>
    </div>
  );
}
