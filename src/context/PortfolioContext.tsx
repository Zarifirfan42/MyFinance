import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadNetWorthHistory,
  snapNetWorthFromPortfolio,
  type NetWorthPoint,
} from '@/lib/netWorthHistory';
import { loadPortfolio, savePortfolio, type PortfolioState } from '@/lib/portfolioStorage';
import type { BankAccount, Investment } from '@/types';

interface PortfolioCtx extends PortfolioState {
  netWorthHistory: NetWorthPoint[];
  setBanks: (banks: BankAccount[]) => void;
  setInvestments: (inv: Investment[]) => void;
  updateBank: (id: string, patch: Partial<Pick<BankAccount, 'balance' | 'name' | 'type'>>) => void;
  updateInvestment: (
    id: string,
    patch: Partial<Pick<Investment, 'current' | 'cost' | 'name' | 'risk'>>,
  ) => void;
}

const Ctx = createContext<PortfolioCtx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(() => loadPortfolio());
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthPoint[]>(() =>
    loadNetWorthHistory(),
  );

  useEffect(() => {
    snapNetWorthFromPortfolio(state.banks, state.investments);
    setNetWorthHistory(loadNetWorthHistory());
  }, [state.banks, state.investments]);

  const persist = useCallback((updater: (prev: PortfolioState) => PortfolioState) => {
    setState((prev) => {
      const next = updater(prev);
      savePortfolio(next);
      return next;
    });
  }, []);

  const setBanks = useCallback(
    (banks: BankAccount[]) => persist((prev) => ({ ...prev, banks })),
    [persist],
  );

  const setInvestments = useCallback(
    (investments: Investment[]) =>
      persist((prev) => ({ ...prev, investments })),
    [persist],
  );

  const updateBank = useCallback(
    (id: string, patch: Partial<Pick<BankAccount, 'balance' | 'name' | 'type'>>) => {
      persist((prev) => ({
        ...prev,
        banks: prev.banks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    [persist],
  );

  const updateInvestment = useCallback(
    (
      id: string,
      patch: Partial<Pick<Investment, 'current' | 'cost' | 'name' | 'risk'>>,
    ) => {
      persist((prev) => ({
        ...prev,
        investments: prev.investments.map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      }));
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      ...state,
      netWorthHistory,
      setBanks,
      setInvestments,
      updateBank,
      updateInvestment,
    }),
    [state, netWorthHistory, setBanks, setInvestments, updateBank, updateInvestment],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePortfolio outside PortfolioProvider');
  return v;
}
