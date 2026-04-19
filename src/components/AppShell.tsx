import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/investments', label: 'Investments', icon: '◇' },
  { to: '/price-history', label: 'P&L', icon: '◈' },
  { to: '/activity', label: 'Activity', icon: '☰' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function AppShell() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
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
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-8">
          <div className="md:hidden font-semibold">MyFinance</div>
          <div className="hidden md:block" aria-hidden />
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400',
              ].join(' ')
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
