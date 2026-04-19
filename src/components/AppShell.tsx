import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { isSupabaseConfigured } from '@/lib/supabase.js';

const nav = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/investments', label: 'Investments', icon: '◇' },
  { to: '/price-history', label: 'P&L', icon: '◈' },
  { to: '/activity', label: 'Activity', icon: '☰' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function AppShell() {
  const { theme, toggle } = useTheme();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = clock.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateStr = clock.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-56 md:flex-shrink-0 md:flex-col md:border-r md:border-slate-200 md:dark:border-slate-800 md:bg-white md:dark:bg-slate-900 md:min-h-screen">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h1 className="font-semibold text-lg tracking-tight">MyFinance</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">MYR</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')
              }
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-semibold">MyFinance</span>
            </div>
            <div className="hidden md:block shrink-0" aria-hidden />

            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-start">
              <time
                className="tabular-nums text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl"
                dateTime={clock.toISOString()}
              >
                {timeStr}
              </time>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {dateStr}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: isSupabaseConfigured ? '#22c55e' : '#f59e0b',
                  }}
                  aria-hidden
                />
                {isSupabaseConfigured ? 'Supabase connected' : 'Local only'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium min-w-0',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400',
              ].join(' ')
            }
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
