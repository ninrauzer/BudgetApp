/**
 * Parse a date string (YYYY-MM-DD) as local time instead of UTC.
 * 
 * JavaScript's `new Date("2025-10-23")` interprets the string as UTC midnight,
 * which causes timezone issues in UTC-5 (Peru). Adding 'T12:00:00' forces
 * local timezone interpretation at noon, avoiding day shifts.
 * 
 * @param dateString - Date in format YYYY-MM-DD
 * @param timezone - Optional IANA timezone (e.g., 'America/Lima'). If not provided, uses browser default.
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string, timezone?: string): Date {
  // Parse at noon to avoid timezone boundary issues
  const baseDate = new Date(dateString + 'T12:00:00');
  
  // If no specific timezone requested, return as-is
  if (!timezone) {
    return baseDate;
  }
  
  // If timezone is specified, adjust the date to that timezone
  // Get the date components in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(baseDate);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
  
  const year = parseInt(getValue('year'));
  const month = parseInt(getValue('month')) - 1; // JS months are 0-indexed
  const day = parseInt(getValue('day'));
  const hour = parseInt(getValue('hour'));
  const minute = parseInt(getValue('minute'));
  const second = parseInt(getValue('second'));
  
  return new Date(year, month, day, hour, minute, second);
}

/**
 * Format a date string (YYYY-MM-DD) to localized string without timezone issues.
 * 
 * @param dateString - Date in format YYYY-MM-DD
 * @param locale - Locale for formatting (default: 'es-PE')
 * @param options - Intl.DateTimeFormat options
 * @param timezone - Optional IANA timezone from user settings
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateString: string,
  locale: string = 'es-PE',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
  timezone?: string
): string {
  const date = parseLocalDate(dateString, timezone);
  
  // If timezone is specified, include it in formatting options
  const formatOptions = timezone 
    ? { ...options, timeZone: timezone }
    : options;
  
  return date.toLocaleDateString(locale, formatOptions);
}

/**
 * Get the user's saved timezone preference from localStorage.
 * Falls back to browser's timezone if not set.
 * 
 * @returns IANA timezone string (e.g., 'America/Lima')
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') return 'UTC';
  
  const saved = localStorage.getItem('userTimezone');
  return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
}
