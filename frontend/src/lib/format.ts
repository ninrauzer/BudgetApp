// Global formatting utilities for currency and budget values
// All monetary values should display as: 1,234.56 ISO_CODE
// Budget (planned) amounts are integers: 1,234 ISO_CODE

export interface FormatOptions {
  decimals?: number; // number of decimal places; defaults to 2
  locale?: string; // locale for number formatting; defaults to 'es-PE'
}

export function formatCurrencyISO(amount: number, currency: string, options: FormatOptions = {}): string {
  const { decimals = 2, locale = 'es-PE' } = options;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  const formatted = formatter.format(amount);
  return `${formatted} ${currency}`;
}

export function formatBudget(amount: number, currency: string, locale: string = 'es-PE'): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `${formatter.format(amount)} ${currency}`;
}

export function formatSigned(amount: number, currency: string, options: FormatOptions = {}): string {
  const sign = amount >= 0 ? '' : '-';
  return sign + formatCurrencyISO(Math.abs(amount), currency, options);
}

// Utility to decide budget vs actual automatically if decimals are present
export function formatAuto(amount: number, currency: string, isBudget: boolean): string {
  return isBudget ? formatBudget(amount, currency) : formatCurrencyISO(amount, currency);
}
