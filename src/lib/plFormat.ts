import type { CSSProperties } from 'react';
import { PL_NEG, PL_POS } from '@/lib/plStyles';

export function formatPlRm(value: number): string {
  const abs = Math.abs(value).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (value > 0) return `+RM ${abs}`;
  if (value < 0) return `-RM ${abs}`;
  return `RM ${abs}`;
}

export function formatPlPct(value: number, fractionDigits = 2): string {
  const abs = Math.abs(value).toFixed(fractionDigits);
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `-${abs}%`;
  return `0%`;
}

export function plRmStyle(value: number): CSSProperties {
  if (value > 0) return { color: PL_POS.text };
  if (value < 0) return { color: PL_NEG.text };
  return {};
}

export function plCardStyle(value: number): CSSProperties {
  if (value > 0) return { color: PL_POS.text, backgroundColor: PL_POS.bg };
  if (value < 0) return { color: PL_NEG.text, backgroundColor: PL_NEG.bg };
  return { color: '#64748b', backgroundColor: '#f1f5f9' };
}
