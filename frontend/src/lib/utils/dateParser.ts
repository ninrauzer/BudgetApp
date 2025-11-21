/**
 * Parse a date string (YYYY-MM-DD) as local time instead of UTC.
 * 
 * JavaScript's `new Date("2025-10-23")` interprets the string as UTC midnight,
 * which causes timezone issues in UTC-5 (Peru). Adding 'T12:00:00' forces
 * local timezone interpretation at noon, avoiding day shifts.
 * 
 * @param dateString - Date in format YYYY-MM-DD
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  return new Date(dateString + 'T12:00:00');
}

/**
 * Format a date string (YYYY-MM-DD) to localized string without timezone issues.
 * 
 * @param dateString - Date in format YYYY-MM-DD
 * @param locale - Locale for formatting (default: 'es-PE')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateString: string,
  locale: string = 'es-PE',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  return parseLocalDate(dateString).toLocaleDateString(locale, options);
}
