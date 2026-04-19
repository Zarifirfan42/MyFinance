interface Props {
  pct: number | null;
  className?: string;
}

export function PnLBadge({ pct, className = '' }: Props) {
  if (pct == null || Number.isNaN(pct)) {
    return (
      <span
        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${className}`}
      >
        —
      </span>
    );
  }
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
        positive
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      } ${className}`}
    >
      {positive ? '+' : ''}
      {pct.toFixed(2)}%
    </span>
  );
}
