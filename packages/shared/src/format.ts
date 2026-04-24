import { format, formatDistanceToNow, parseISO } from 'date-fns';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

export function formatGBP(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(value)) return GBP_FORMATTER.format(0);
  return GBP_FORMATTER.format(value);
}

export function formatGBPMinor(minorUnits: number): string {
  return formatGBP(minorUnits / 100);
}

function toDate(input: Date | string): Date {
  return typeof input === 'string' ? parseISO(input) : input;
}

export function formatDate(input: Date | string, pattern = 'd MMM yyyy'): string {
  return format(toDate(input), pattern);
}

export function formatTime(input: Date | string, pattern = 'HH:mm'): string {
  return format(toDate(input), pattern);
}

export function formatDateTime(input: Date | string, pattern = 'd MMM yyyy HH:mm'): string {
  return format(toDate(input), pattern);
}

export function formatRelative(input: Date | string): string {
  return formatDistanceToNow(toDate(input), { addSuffix: true });
}
