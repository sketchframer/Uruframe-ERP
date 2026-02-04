/**
 * Format a date string (ISO) to locale date string
 */
export function formatDate(isoDate: string, locale = 'es'): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a date string to locale date + time
 */
export function formatDateTime(isoDate: string, locale = 'es'): string {
  return new Date(isoDate).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a number with optional decimals
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage (0-100)
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)}%`;
}
