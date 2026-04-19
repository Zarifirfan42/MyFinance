import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  valueClassName?: string;
  icon?: ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  valueClassName = '',
  icon,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
      </div>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${valueClassName}`}>{value}</p>
      {subtitle ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
