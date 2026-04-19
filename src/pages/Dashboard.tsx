import { AllocationDonut } from '@/components/AllocationDonut';
import { MetricCard } from '@/components/MetricCard';
import { NetWorthLineChart } from '@/components/NetWorthLineChart';
import { PnLBarChart } from '@/components/PnLBarChart';
import { usePortfolio } from '@/context/PortfolioContext';
import {
  allocationSlices,
  mediumHighPnLBars,
  netWorth,
  overallMediumHighPnL,
  totalCash,
  totalInvestedCurrent,
} from '@/lib/calculations';
import { formatRM } from '@/lib/currency';

export function Dashboard() {
  const { banks, investments, netWorthHistory } = usePortfolio();

  const cash = totalCash(banks);
  const invested = totalInvestedCurrent(investments);
  const nw = netWorth(banks, investments);
  const overallPnL = overallMediumHighPnL(investments);
  const donutData = allocationSlices(banks, investments);
  const barData = mediumHighPnLBars(investments);

  const pnlClass =
    overallPnL >= 0
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-red-700 dark:text-red-400';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of cash, investments, and allocation (MYR).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Cash" value={formatRM(cash)} />
        <MetricCard title="Total Invested" value={formatRM(invested)} />
        <MetricCard title="Net Worth" value={formatRM(nw)} />
        <MetricCard
          title="Overall invest P&amp;L"
          value={formatRM(overallPnL)}
          valueClassName={pnlClass}
          subtitle="Medium &amp; High risk only"
        />
      </div>

      <NetWorthLineChart data={netWorthHistory} />

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Bank accounts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {banks.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-900 dark:text-slate-100">{b.name}</p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {b.type}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold">{formatRM(b.balance)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationDonut data={donutData} />
        <PnLBarChart data={barData} />
      </div>
    </div>
  );
}
