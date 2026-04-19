import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { uid } from '@/lib/ids';
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
  addBank: (bank: Omit<BankAccount, 'id'>) => void;
  deleteBank: (id: string) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;
}

const Ctx = createContext<PortfolioCtx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(() => loadPortfolio());
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthPoint[]>(() =>
    loadNetWorthHistory(),
  );

  /** Record net worth snapshot when the app loads (new calendar day gets a point when user opens the app). */
  useEffect(() => {
    const s = loadPortfolio();
    snapNetWorthFromPortfolio(s.banks, s.investments);
    setNetWorthHistory(loadNetWorthHistory());
  }, []);

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

  const addBank = useCallback(
    (bank: Omit<BankAccount, 'id'>) => {
      persist((prev) => ({
        ...prev,
        banks: [...prev.banks, { ...bank, id: uid() }],
      }));
    },
    [persist],
  );

  const deleteBank = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        banks: prev.banks.filter((b) => b.id !== id),
      }));
    },
    [persist],
  );

  const addInvestment = useCallback(
    (inv: Omit<Investment, 'id'>) => {
      persist((prev) => ({
        ...prev,
        investments: [...prev.investments, { ...inv, id: uid() }],
      }));
    },
    [persist],
  );

  const deleteInvestment = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        investments: prev.investments.filter((i) => i.id !== id),
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
      addBank,
      deleteBank,
      addInvestment,
      deleteInvestment,
    }),
    [
      state,
      netWorthHistory,
      setBanks,
      setInvestments,
      updateBank,
      updateInvestment,
      addBank,
      deleteBank,
      addInvestment,
      deleteInvestment,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePortfolio outside PortfolioProvider');
  return v;
}
