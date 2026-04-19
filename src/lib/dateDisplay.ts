/** e.g. "19 Apr 2025" */
export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayISODateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addCalendarDays(isoDate: string, delta: number): string {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday 00:00 local of the week containing `isoDate`. */
export function startOfWeekMonday(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayNum = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

export function startOfMonth(isoDate: string): string {
  return isoDate.slice(0, 7) + '-01';
}

export function startOfYear(isoDate: string): string {
  return isoDate.slice(0, 4) + '-01-01';
}
