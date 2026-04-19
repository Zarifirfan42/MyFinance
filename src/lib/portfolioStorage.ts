import { SEED_BANKS, SEED_INVESTMENTS } from '@/data/seed';
import { uid } from '@/lib/ids';
import type { BankAccount, Investment } from '@/types';

const STORAGE_KEY = 'myfinance-portfolio-v1';

export interface PortfolioState {
  banks: BankAccount[];
  investments: Investment[];
}

function withIds(): PortfolioState {
  return {
    banks: SEED_BANKS.map((b) => ({ ...b, id: uid() })),
    investments: SEED_INVESTMENTS.map((i) => ({ ...i, id: uid() })),
  };
}

export function loadPortfolio(): PortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = withIds();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as PortfolioState;
    const banks = Array.isArray(parsed.banks) ? parsed.banks : [];
    const investments = Array.isArray(parsed.investments) ? parsed.investments : [];
    return { banks, investments };
  } catch {
    const seeded = withIds();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function savePortfolio(state: PortfolioState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
