import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BarPnLItem } from '@/lib/calculations';
import { formatRM } from '@/lib/currency';

const PROFIT = '#639922';
const LOSS = '#E24B4A';

interface Row extends BarPnLItem {
  fill: string;
}

interface Props {
  data: BarPnLItem[];
}

export function PnLBarChart({ data }: Props) {
  const rows: Row[] = data.map((d) => ({
    ...d,
    fill: d.pnlRm >= 0 ? PROFIT : LOSS,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
        P&amp;L by asset (Medium &amp; High)
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center">No Medium/High positions.</p>
      ) : null}
      <div className={`h-72 w-full ${rows.length === 0 ? 'hidden' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, left: 8, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `RM ${Number(v).toLocaleString('en-MY')}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Row;
                const pctPart =
                  p.pct != null && !Number.isNaN(p.pct)
                    ? ` (${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(2)}%)`
                    : '';
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-slate-700 dark:bg-slate-900">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {formatRM(p.pnlRm)}
                      {pctPart}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="pnlRm" radius={[4, 4, 0, 0]}>
              {rows.map((entry, i) => (
                <Cell key={entry.name + i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
