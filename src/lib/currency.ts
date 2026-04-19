export function formatRM(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = value < 0 ? '-' : '';
  return `${sign}RM ${formatted}`;
}

export function formatRMUnsigned(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `RM ${formatted}`;
}
