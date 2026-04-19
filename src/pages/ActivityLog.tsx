import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/Toast';
import { usePortfolio } from '@/context/PortfolioContext';
import { fetchActivities, insertActivity } from '@/lib/activitiesService';
import { formatRM } from '@/lib/currency';
import { activitiesToCsv, downloadTextFile } from '@/lib/exportActivitiesCsv';
import { usePageTitle } from '@/lib/usePageTitle';
import { isSupabaseConfigured } from '@/lib/supabase.js';
import type { ActivityRow, ActivityType } from '@/types';

type Filter = 'today' | 'month' | 'year' | 'all';

const TYPE_STYLES: Record<ActivityType, string> = {
  income: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  expense: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  investment: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  savings: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
};

function labelType(t: ActivityType): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inFilter(row: ActivityRow, f: Filter): boolean {
  const d = new Date(row.date + 'T12:00:00');
  const now = new Date();
  if (f === 'all') return true;
  if (f === 'today') return startOfDay(d).getTime() === startOfDay(now).getTime();
  if (f === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (f === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export function ActivityLog() {
  usePageTitle('Activity');
  const { showToast } = useToast();
  const { banks, investments } = usePortfolio();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    type: 'expense' as ActivityType,
    account: '',
  });

  const accountOptions = useMemo(() => {
    const names = [
      ...banks.map((b) => b.name),
      ...investments.map((i) => i.name),
    ];
    return [...new Set(names)].sort();
  }, [banks, investments]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchActivities();
    setActivities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form.account && accountOptions.length) {
      setForm((f) => ({ ...f, account: accountOptions[0] }));
    }
  }, [accountOptions, form.account]);

  const filtered = useMemo(
    () => activities.filter((a) => inFilter(a, filter)),
    [activities, filter],
  );

  function exportFilteredCsv() {
    const csv = activitiesToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`myfinance-activities-${filter}-${stamp}.csv`, csv);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    const amt = parseFloat(form.amount);
    if (Number.isNaN(amt) || !form.description.trim() || !form.account) return;

    const result = await insertActivity({
      date: form.date,
      description: form.description.trim(),
      amount: amt,
      type: form.type,
      account: form.account,
    });

    if (result.ok) {
      setActivities((prev) => [result.row, ...prev]);
      setForm((f) => ({
        ...f,
        description: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
      }));
      showToast('Activity logged', 'success');
    } else if (isSupabaseConfigured) {
      showToast(result.message, 'error');
    }
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Activity log</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Backed by Supabase table <code className="text-xs">activities</code> via{' '}
          <code className="text-xs">src/lib/supabase.js</code>.
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to a{' '}
          <code className="font-mono">.env</code> file to enable the activity log.
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-4"
      >
        <h3 className="text-sm font-semibold">+ Add activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Date</span>
            <input
              type="date"
              required
              disabled={!isSupabaseConfigured}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Description</span>
            <input
              type="text"
              required
              disabled={!isSupabaseConfigured}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Amount (RM)</span>
            <input
              type="number"
              step="0.01"
              required
              disabled={!isSupabaseConfigured}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Type</span>
            <select
              disabled={!isSupabaseConfigured}
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as ActivityType }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {(['income', 'expense', 'investment', 'savings'] as ActivityType[]).map((t) => (
                <option key={t} value={t}>
                  {labelType(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-400">Account</span>
            <select
              disabled={!isSupabaseConfigured}
              value={form.account}
              onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {accountOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={!isSupabaseConfigured}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add activity
        </button>
      </form>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setFilter(x.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  filter === x.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportFilteredCsv}
            disabled={filtered.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Export CSV (current filter)
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Account</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-full max-w-xs animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No activities yet.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3">{row.description}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatRM(row.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[row.type]}`}
                      >
                        {labelType(row.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.account}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
