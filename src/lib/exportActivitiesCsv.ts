import type { PlLogEntry } from '@/lib/priceHistoryMath';
import type { ActivityRow } from '@/types';

function csvEscape(field: string): string {
  if (/[",\n\r]/.test(field)) return `"${field.replace(/"/g, '""')}"`;
  return field;
}

/** RFC 4180-style CSV with UTF-8 BOM for Excel. */
export function activitiesToCsv(rows: ActivityRow[]): string {
  const header = ['Date', 'Description', 'Amount (RM)', 'Type', 'Account', 'Created at (UTC)'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.date),
        csvEscape(r.description),
        csvEscape(String(r.amount)),
        csvEscape(r.type),
        csvEscape(r.account),
        csvEscape(r.created_at ?? ''),
      ].join(','),
    );
  }
  return '\uFEFF' + lines.join('\r\n');
}

/** Filtered P&amp;L log rows export (matches Price History table columns). */
export function exportPriceHistoryCsv(entries: PlLogEntry[]): string {
  const header = [
    'Date',
    'Asset',
    'Previous Value (RM)',
    'Current Value (RM)',
    'Change (RM)',
    'Change (%)',
  ];
  const lines = [header.join(',')];
  for (const r of entries) {
    lines.push(
      [
        csvEscape(r.date),
        csvEscape(r.asset),
        csvEscape(String(r.previousValue)),
        csvEscape(String(r.currentValue)),
        csvEscape(String(r.changeRm)),
        csvEscape(String(r.changePct)),
      ].join(','),
    );
  }
  return '\uFEFF' + lines.join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
