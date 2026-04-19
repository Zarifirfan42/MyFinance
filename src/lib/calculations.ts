import type { BankAccount, Investment } from '@/types';

export function totalCash(banks: BankAccount[]): number {
  return banks.reduce((s, b) => s + b.balance, 0);
}

export function totalInvestedCurrent(investments: Investment[]): number {
  return investments.reduce((s, i) => s + i.current, 0);
}

export function netWorth(banks: BankAccount[], investments: Investment[]): number {
  return totalCash(banks) + totalInvestedCurrent(investments);
}

/** Total P&amp;L % vs cost when cost is set (any risk). */
export function investmentPnLPercent(inv: Investment): number | null {
  if (inv.cost == null || inv.cost === 0) return null;
  return ((inv.current - inv.cost) / inv.cost) * 100;
}

/** Overall P&L (RM) for Medium + High: sum(current) - sum(cost) where cost != null */
export function overallMediumHighPnL(investments: Investment[]): number {
  return investments
    .filter((i) => (i.risk === 'Medium' || i.risk === 'High') && i.cost != null)
    .reduce((s, i) => s + i.current - (i.cost as number), 0);
}

export function allocationSlices(
  banks: BankAccount[],
  investments: Investment[],
): { name: string; value: number; color: string }[] {
  const bankSum = totalCash(banks);
  const low = investments.filter((i) => i.risk === 'Low').reduce((s, i) => s + i.current, 0);
  const medium = investments.filter((i) => i.risk === 'Medium').reduce((s, i) => s + i.current, 0);
  const high = investments.filter((i) => i.risk === 'High').reduce((s, i) => s + i.current, 0);

  return [
    { name: 'Banks', value: bankSum, color: '#378ADD' },
    { name: 'Low', value: low, color: '#639922' },
    { name: 'Medium', value: medium, color: '#EF9F27' },
    { name: 'High', value: high, color: '#E24B4A' },
  ].filter((x) => x.value > 0);
}

export interface BarPnLItem {
  name: string;
  pnlRm: number;
  pct: number | null;
}

export function mediumHighPnLBars(investments: Investment[]): BarPnLItem[] {
  return investments
    .filter((i) => i.risk === 'Medium' || i.risk === 'High')
    .map((i) => {
      const cost = i.cost ?? 0;
      const pnlRm = i.current - cost;
      const pct =
        i.cost != null && i.cost !== 0 ? ((i.current - i.cost) / i.cost) * 100 : null;
      return { name: i.name, pnlRm, pct };
    });
}
