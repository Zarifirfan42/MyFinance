import { useNavigate } from 'react-router-dom';

export function PriceChartEmpty() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-900/50">
      <svg
        className="mb-4 h-16 w-24 text-slate-400 dark:text-slate-500"
        viewBox="0 0 96 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M4 36 L24 12 L44 28 L64 8 L84 24 L92 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="12" r="3" fill="currentColor" />
        <circle cx="44" cy="28" r="3" fill="currentColor" />
        <circle cx="64" cy="8" r="3" fill="currentColor" />
      </svg>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        No price data yet
      </h4>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Go to Investments tab → Update today&apos;s price to start tracking
      </p>
      <button
        type="button"
        onClick={() => navigate('/investments')}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Open Investments
      </button>
    </div>
  );
}
