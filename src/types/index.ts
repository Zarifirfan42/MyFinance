export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface Investment {
  id: string;
  name: string;
  risk: RiskLevel;
  current: number;
  cost: number | null;
}

export type ActivityType = 'income' | 'expense' | 'investment' | 'savings';

export interface ActivityRow {
  id: string;
  created_at: string;
  date: string;
  description: string;
  amount: number;
  type: ActivityType;
  account: string;
}

export interface PriceHistoryRow {
  id: string;
  created_at: string;
  asset_name: string;
  date: string;
  value_rm: number;
}
