import type { BankAccount, Investment } from '@/types';

export const SEED_BANKS: Omit<BankAccount, 'id'>[] = [
  { name: 'Maybank', type: 'General Bank', balance: 100.27 },
  { name: 'Bank Rakyat', type: 'General Bank', balance: 622.36 },
  { name: 'Touch N Go', type: 'e-Wallet', balance: 4262.21 },
  { name: 'Versa', type: 'Savings App', balance: 2059.98 },
];

export const SEED_INVESTMENTS: Omit<Investment, 'id'>[] = [
  { name: 'Tabung Haji', risk: 'Low', current: 3874.66, cost: 3753.08 },
  { name: 'ASNB', risk: 'Low', current: 3531.79, cost: 3481.79 },
  { name: 'Public Gold', risk: 'Medium', current: 7959.0, cost: 5332.0 },
  { name: 'Versa Gold', risk: 'Medium', current: 1496.93, cost: 1300.0 },
  { name: 'iShares Silver Trust', risk: 'Medium', current: 207.58, cost: 200.0 },
  { name: 'BTC', risk: 'High', current: 227.19, cost: 375.0 },
  { name: 'ETH', risk: 'High', current: 110.45, cost: 150.0 },
  { name: 'XRP', risk: 'High', current: 23.5, cost: 50.0 },
  { name: 'SOL', risk: 'High', current: 21.45, cost: 50.0 },
];
