import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllocationDonut } from '@/components/AllocationDonut';
import { DailyCashflowTable } from '@/components/DailyCashflowTable';
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
import { addCalendarDays, todayISODateLocal } from '@/lib/dateDisplay';
import { formatPlPct } from '@/lib/plFormat';
import { groupPriceHistoryByAsset } from '@/lib/priceHistoryMath';
import { fetchAllPriceHistory } from '@/lib/priceHistoryService';
import { usePageTitle } from '@/lib/usePageTitle';

type MetricVariant = 'default' | 'pnl-positive' | 'pnl-negative';

const METRIC_VARIANT_CLASSES: Record<
  MetricVariant,
  { card: string; title: string; value: string; subtitle: string; iconWrap: string }
> = {
  default: {
    card: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    title: 'text-slate-500 dark:text-slate-400',
    value: 'text-slate-900 dark:text-slate-50',
    subtitle: 'text-slate-500 dark:text-slate-400',
    iconWrap: 'bg-slate-100 dark:bg-slate-800',
  },
  'pnl-positive': {
    card:
      'border-emerald-200/90 bg-[#EAF3DE] dark:border-emerald-800 dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-900/60',
    title: 'text-emerald-800/90 dark:text-emerald-400/95',
    value: 'text-[#3B6D11] dark:text-emerald-200',
    subtitle: 'text-emerald-800/75 dark:text-emerald-400/85',
    iconWrap: 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200',
  },
  'pnl-negative': {
    card:
      'border-red-200/90 bg-[#FCEBEB] dark:border-red-900 dark:bg-red-950 dark:ring-1 dark:ring-red-900/50',
    title: 'text-red-900/85 dark:text-red-400/95',
    value: 'text-[#A32D2D] dark:text-red-200',
    subtitle: 'text-red-900/75 dark:text-red-400/85',
    iconWrap: 'bg-red-100/90 text-red-900 dark:bg-red-900/60 dark:text-red-200',
  },
};

function DashboardMetricCard(props: {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  variant?: MetricVariant;
}) {
  const { icon, title, value, subtitle, variant = 'default' } = props;
  const c = METRIC_VARIANT_CLASSES[variant];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${c.card}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className={`text-[10px] font-medium uppercase tracking-wide sm:text-xs ${c.title}`}>
            {title}
          </p>
          <p
            className={`mt-1.5 break-words text-sm font-bold tabular-nums leading-snug sm:text-base md:text-lg ${c.value}`}
          >
            {value}
          </p>
          {subtitle ? (
            <p className={`mt-1 text-[11px] leading-snug sm:text-xs ${c.subtitle}`}>{subtitle}</p>
          ) : null}
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg ${c.iconWrap}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  usePageTitle('Dashboard');
  const { banks, investments, netWorthHistory } = usePortfolio();
  const todayStr = todayISODateLocal();

  const [priceRowsLoading, setPriceRowsLoading] = useState(true);
  const [priceRows, setPriceRows] = useState<Awaited<ReturnType<typeof fetchAllPriceHistory>>>([]);

  const loadPrices = useCallback(async () => {
    setPriceRowsLoading(true);
    const rows = await fetchAllPriceHistory();
    setPriceRows(rows);
    setPriceRowsLoading(false);
  }, []);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const byAsset = useMemo(() => groupPriceHistoryByAsset(priceRows), [priceRows]);

  const cash = totalCash(banks);
  const invested = totalInvestedCurrent(investments);
  const nw = netWorth(banks, investments);
  const overallPnL = overallMediumHighPnL(investments);
  const donutData = allocationSlices(banks, investments);
  const barData = mediumHighPnLBars(investments);

  const yesterdayStr = addCalendarDays(todayStr, -1);
  const nwYesterday = netWorthHistory.find((p) => p.date === yesterdayStr)?.netWorth;

  const nwSubtitle =
    nwYesterday != null && nwYesterday !== 0
      ? `${formatPlPct(((nw - nwYesterday) / nwYesterday) * 100)} vs yesterday`
      : undefined;

  const pnlPositive = overallPnL >= 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of cash, investments, and allocation (MYR).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard icon="🏦" title="Total Cash" value={formatRM(cash)} />
        <DashboardMetricCard icon="📈" title="Total Invested" value={formatRM(invested)} />
        <DashboardMetricCard
          icon="💎"
          title="Net Worth"
          value={formatRM(nw)}
          subtitle={nwSubtitle}
        />
        <DashboardMetricCard
          icon="%"
          title="Overall invest P&L"
          value={formatRM(overallPnL)}
          subtitle="Medium & High risk only"
          variant={pnlPositive ? 'pnl-positive' : 'pnl-negative'}
        />
      </div>

      <section aria-labelledby="cashflow-heading">
        <h3
          id="cashflow-heading"
          className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          Today vs yesterday
        </h3>
        {priceRowsLoading ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          <DailyCashflowTable investments={investments} byAsset={byAsset} todayStr={todayStr} />
        )}
      </section>

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
