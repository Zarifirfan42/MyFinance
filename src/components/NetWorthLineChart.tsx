import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatRMUnsigned } from '@/lib/currency';
import type { NetWorthPoint } from '@/lib/netWorthHistory';

const LINE = '#378ADD';

interface Props {
  data: NetWorthPoint[];
}

export function NetWorthLineChart({ data }: Props) {
  const chartData = useMemo(
    () => data.map((d) => ({ ...d, label: d.date.slice(5) })),
    [data],
  );

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Net worth over time
        </h3>
        <p className="text-sm text-slate-500 py-8 text-center">
          Snapshots are saved when your portfolio updates. Edit a balance to start the trend.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Net worth over time
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Based on daily snapshots stored in this browser (up to ~1 year).
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `RM ${Number(v).toLocaleString('en-MY', { maximumFractionDigits: 0 })}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as NetWorthPoint & { label: string };
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-slate-700 dark:bg-slate-900">
                    <div className="text-xs text-slate-500">{p.date}</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatRMUnsigned(p.netWorth)}
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke={LINE}
              strokeWidth={2}
              dot={{ r: 3, fill: LINE }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
