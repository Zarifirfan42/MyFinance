import { usePortfolio } from '@/context/PortfolioContext';
import { formatRM } from '@/lib/currency';

export function Settings() {
  const { banks, investments, updateBank, updateInvestment } = usePortfolio();

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
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Bank accounts
        </h3>
        <div className="space-y-4">
          {banks.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{b.type}</p>
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
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Investments
        </h3>
        <div className="space-y-4">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="font-medium">{inv.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Risk: {inv.risk}</p>
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
