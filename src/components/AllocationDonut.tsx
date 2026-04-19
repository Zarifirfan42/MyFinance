import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatRMUnsigned } from '@/lib/currency';

export interface Slice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
}

export function AllocationDonut({ data }: Props) {
  const chartData = data.map((d) => ({ ...d, key: d.name }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Portfolio allocation
      </h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center">No data to chart.</p>
      ) : null}
      <div className={`h-64 w-full ${chartData.length === 0 ? 'hidden' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatRMUnsigned(Number(value))}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid rgb(226 232 240)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
