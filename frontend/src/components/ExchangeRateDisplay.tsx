import { useExchangeRate } from '@/lib/hooks/useApi';
import { DollarSign } from 'lucide-react';

/**
 * ExchangeRateDisplay - Muestra el tipo de cambio USD/PEN en el header global
 * Visible en todas las páginas de la aplicación
 */
export default function ExchangeRateDisplay() {
  const { data: exchangeRate, isLoading } = useExchangeRate();

  if (isLoading || !exchangeRate) {
    return (
      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <DollarSign className="h-4 w-4" strokeWidth={2.5} />
      <span className="text-sm font-semibold">
        USD/PEN {exchangeRate.rate.toFixed(2)}
      </span>
    </div>
  );
}
