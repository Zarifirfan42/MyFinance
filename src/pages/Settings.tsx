import { type FormEvent, useState } from 'react';
import { useToast } from '@/components/Toast';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatRM } from '@/lib/currency';
import { usePageTitle } from '@/lib/usePageTitle';
import type { RiskLevel } from '@/types';

const BANK_TYPES = [
  'General Bank',
  'e-Wallet',
  'Savings App',
  'Investment Bank',
] as const;

export function Settings() {
  usePageTitle('Settings');
  const {
    banks,
    investments,
    updateBank,
    updateInvestment,
    addBank,
    deleteBank,
    addInvestment,
    deleteInvestment,
  } = usePortfolio();
  const { showToast } = useToast();

  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDraft, setBankDraft] = useState({
    name: '',
    type: BANK_TYPES[0],
    balance: '',
  });

  const [showInvForm, setShowInvForm] = useState(false);
  const [invDraft, setInvDraft] = useState({
    name: '',
    risk: 'Medium' as RiskLevel,
    current: '',
    cost: '',
  });

  const [confirmBankId, setConfirmBankId] = useState<string | null>(null);
  const [confirmInvId, setConfirmInvId] = useState<string | null>(null);

  function submitBank(e: FormEvent) {
    e.preventDefault();
    const bal = parseFloat(bankDraft.balance);
    if (!bankDraft.name.trim() || Number.isNaN(bal)) return;
    addBank({
      name: bankDraft.name.trim(),
      type: bankDraft.type,
      balance: bal,
    });
    showToast(`${bankDraft.name.trim()} added`, 'success');
    setBankDraft({ name: '', type: BANK_TYPES[0], balance: '' });
    setShowBankForm(false);
  }

  function submitInvestment(e: FormEvent) {
    e.preventDefault();
    const cur = parseFloat(invDraft.current);
    if (!invDraft.name.trim() || Number.isNaN(cur)) return;
    const rawCost = invDraft.cost.trim();
    let cost: number | null = null;
    if (rawCost !== '') {
      const c = parseFloat(rawCost);
      if (!Number.isNaN(c)) cost = c;
    }
    addInvestment({
      name: invDraft.name.trim(),
      risk: invDraft.risk,
      current: cur,
      cost,
    });
    showToast(`${invDraft.name.trim()} added`, 'success');
    setInvDraft({ name: '', risk: 'Medium', current: '', cost: '' });
    setShowInvForm(false);
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Currency is fixed to <strong>MYR (RM)</strong>. Edits persist in this browser
          (localStorage).
        </p>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Bank accounts
          </h3>
          <button
            type="button"
            onClick={() => setShowBankForm((v) => !v)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 sm:text-sm"
          >
            + Add Bank
          </button>
        </div>

        {showBankForm ? (
          <form
            onSubmit={submitBank}
            className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                Name
                <input
                  required
                  value={bankDraft.name}
                  onChange={(e) => setBankDraft((d) => ({ ...d, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <label className="block text-sm">
                Type
                <select
                  value={bankDraft.type}
                  onChange={(e) =>
                    setBankDraft((d) => ({ ...d, type: e.target.value as (typeof BANK_TYPES)[number] }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                >
                  {BANK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                Balance (RM)
                <input
                  required
                  type="number"
                  step="0.01"
                  value={bankDraft.balance}
                  onChange={(e) => setBankDraft((d) => ({ ...d, balance: e.target.value }))}
                  className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save bank
              </button>
              <button
                type="button"
                onClick={() => setShowBankForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="space-y-4">
          {banks.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{b.type}</p>
                </div>
                {confirmBankId === b.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400">Are you sure?</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteBank(b.id);
                        showToast(`${b.name} removed`, 'success');
                        setConfirmBankId(null);
                      }}
                      className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmBankId(null)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmBankId(b.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                  >
                    Delete
                  </button>
                )}
              </div>
              <label className="mt-3 block text-sm">
                Balance (RM)
                <input
                  type="number"
                  step="0.01"
                  defaultValue={b.balance}
                  key={b.id + String(b.balance)}
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) updateBank(b.id, { balance: v });
                  }}
                  className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">Display: {formatRM(b.balance)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Investments
          </h3>
          <button
            type="button"
            onClick={() => setShowInvForm((v) => !v)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 sm:text-sm"
          >
            + Add Investment
          </button>
        </div>

        {showInvForm ? (
          <form
            onSubmit={submitInvestment}
            className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                Name
                <input
                  required
                  value={invDraft.name}
                  onChange={(e) => setInvDraft((d) => ({ ...d, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <label className="block text-sm">
                Risk
                <select
                  value={invDraft.risk}
                  onChange={(e) => setInvDraft((d) => ({ ...d, risk: e.target.value as RiskLevel }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                >
                  {(['Low', 'Medium', 'High'] as RiskLevel[]).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Current Value RM
                <input
                  required
                  type="number"
                  step="0.01"
                  value={invDraft.current}
                  onChange={(e) => setInvDraft((d) => ({ ...d, current: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                Cost Basis RM (optional)
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty if none"
                  value={invDraft.cost}
                  onChange={(e) => setInvDraft((d) => ({ ...d, cost: e.target.value }))}
                  className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save investment
              </button>
              <button
                type="button"
                onClick={() => setShowInvForm(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="space-y-4">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{inv.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Risk: {inv.risk}</p>
                </div>
                {confirmInvId === inv.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400">Are you sure?</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteInvestment(inv.id);
                        showToast(`${inv.name} removed`, 'success');
                        setConfirmInvId(null);
                      }}
                      className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmInvId(null)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmInvId(inv.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm">
                  Current value (RM)
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={inv.current}
                    key={inv.id + 'c' + inv.current}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) updateInvestment(inv.id, { current: v });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
                <label className="block text-sm">
                  Cost basis (RM, optional)
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty if none"
                    defaultValue={inv.cost ?? ''}
                    key={inv.id + 'k' + String(inv.cost)}
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      if (raw === '') {
                        updateInvestment(inv.id, { cost: null });
                        return;
                      }
                      const v = parseFloat(raw);
                      if (!Number.isNaN(v)) updateInvestment(inv.id, { cost: v });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
