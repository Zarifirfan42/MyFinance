import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/components/Toast';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ActivityLog } from '@/pages/ActivityLog';
import { Dashboard } from '@/pages/Dashboard';
import { Investments } from '@/pages/Investments';
import { PriceHistoryPl } from '@/pages/PriceHistoryPl';
import { Settings } from '@/pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="investments" element={<Investments />} />
                <Route path="price-history" element={<PriceHistoryPl />} />
                <Route path="activity" element={<ActivityLog />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PortfolioProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
