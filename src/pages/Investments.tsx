import { useCallback, useEffect, useMemo, useState } from 'react';
import { InvestmentLowCard, InvestmentMHCard } from '@/components/priceHistory/InvestmentMHCard';
import { PriceUpdateForm } from '@/components/priceHistory/PriceUpdateForm';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatRM } from '@/lib/currency';
import { groupPriceHistoryByAsset, resolveDisplayCurrent } from '@/lib/priceHistoryMath';
import { fetchAllPriceHistory } from '@/lib/priceHistoryService';
import type { PriceHistoryRow } from '@/types';
import type { Investment, RiskLevel } from '@/types';

type Tab = 'all' | RiskLevel;

export function Investments() {
  const { investments, updateInvestment } = usePortfolio();
  const [tab, setTab] = useState<Tab>('all');
  const [editing, setEditing] = useState<Investment | null>(null);
  const [draftCurrent, setDraftCurrent] = useState('');
  const [priceRows, setPriceRows] = useState<PriceHistoryRow[]>([]);
  const [phLoading, setPhLoading] = useState(true);

  const loadPh = useCallback(async () => {
    setPhLoading(true);
    const rows = await fetchAllPriceHistory();
    setPriceRows(rows);
    setPhLoading(false);
  }, []);

  useEffect(() => {
    loadPh();
  }, [loadPh]);

  const byName = useMemo(
    () => groupPriceHistoryByAsset(priceRows),
    [priceRows],
  );

  const filtered = useMemo(() => {
    if (tab === 'all') return investments;
    return investments.filter((i) => i.risk === tab);
  }, [investments, tab]);

  const totals = useMemo(() => {
    let totalCurrent = 0;
    let totalCost = 0;
    for (const i of investments) {
      totalCurrent += resolveDisplayCurrent(i.current, byName.get(i.name));
      totalCost += i.cost ?? 0;
    }
    const mh = investments.filter((i) => i.risk === 'Medium' || i.risk === 'High');
    const pnl = mh
      .filter((i) => i.cost != null)
      .reduce((acc, i) => {
        const eff = resolveDisplayCurrent(i.current, byName.get(i.name));
        return acc + eff - (i.cost as number);
      }, 0);
    return { totalCurrent, totalCost, pnl };
  }, [investments, byName]);

  function handlePriceSaved(assetName: string, valueRm: number) {
    const inv = investments.find((i) => i.name === assetName);
    if (inv) updateInvestment(inv.id, { current: valueRm });
    loadPh();
  }

  function openEdit(inv: Investment) {
    setEditing(inv);
    const s = byName.get(inv.name);
    const eff = resolveDisplayCurrent(inv.current, byName.get(inv.name));
    setDraftCurrent(String(eff));
  }

  function saveEdit() {
    if (!editing) return;
    const n = parseFloat(draftCurrent);
    if (Number.isNaN(n)) return;
    updateInvestment(editing.id, { current: n });
    setEditing(null);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'Low', label: 'Low Risk' },
    { id: 'Medium', label: 'Medium Risk' },
    { id: 'High', label: 'High Risk' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Investments</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sparklines and P&amp;L use <code className="text-xs">price_history</code> via{' '}
          <code className="text-xs">fetchAllPriceHistory</code> (same Supabase client as Activity).
        </p>
      </div>

      <PriceUpdateForm investments={investments} onSaved={handlePriceSaved} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total invested: </span>
          <span className="font-semibold">{formatRM(totals.totalCurrent)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total cost: </span>
          <span className="font-semibold">{formatRM(totals.totalCost)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total P&amp;L (M+H w/ cost): </span>
          <span
            className={`font-semibold ${
              totals.pnl >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {formatRM(totals.pnl)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((inv) => {
          const series = byName.get(inv.name) ?? [];
          if (inv.risk === 'Medium' || inv.risk === 'High') {
            return (
              <InvestmentMHCard
                key={inv.id}
                inv={inv}
                series={series}
                loading={phLoading}
                onEdit={() => openEdit(inv)}
              />
            );
          }
          return (
            <InvestmentLowCard
              key={inv.id}
              inv={inv}
              series={series}
              loading={phLoading}
              onEdit={() => openEdit(inv)}
            />
          );
        })}
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="font-semibold text-lg">Update current value</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{editing.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              Updates local portfolio (and summary). Add a price row for historical tracking.
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Current value (RM)
              <input
                type="number"
                step="0.01"
                value={draftCurrent}
                onChange={(e) => setDraftCurrent(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
