import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { todayISODateLocal } from '@/lib/dateDisplay';
import { upsertPriceEntry } from '@/lib/priceHistoryService';
import { isSupabaseConfigured } from '@/lib/supabase.js';
import type { Investment } from '@/types';

interface Props {
  investments: Investment[];
  onSaved: (assetName: string, valueRm: number) => void;
}

export function PriceUpdateForm({ investments, onSaved }: Props) {
  const { showToast } = useToast();
  const [assetName, setAssetName] = useState('');
  const [date, setDate] = useState(todayISODateLocal());
  const [valueRm, setValueRm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!assetName && investments.length) {
      setAssetName(investments[0].name);
    }
  }, [investments, assetName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || !assetName) return;
    const v = parseFloat(valueRm);
    if (Number.isNaN(v)) return;
    setSaving(true);
    const row = await upsertPriceEntry(assetName, date, v);
    setSaving(false);
    if (row) {
      onSaved(assetName, v);
      setValueRm('');
      showToast(`Price updated for ${assetName}`, 'success');
    } else if (isSupabaseConfigured) {
      showToast('Could not save price — check Supabase console or network', 'error');
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Update today&apos;s price
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Upserts <code className="text-[11px]">price_history</code> (one row per asset per day).
      </p>
      {!isSupabaseConfigured ? (
        <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">
          Configure Supabase in <code className="text-xs">.env</code> to sync prices.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Asset</span>
            <select
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {investments.map((i) => (
                <option key={i.id} value={i.name}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Value (RM)</span>
            <input
              type="number"
              step="0.01"
              required
              value={valueRm}
              onChange={(e) => setValueRm(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <button
            type="submit"
            disabled={saving || investments.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save price'}
          </button>
        </form>
      )}
    </div>
  );
}
