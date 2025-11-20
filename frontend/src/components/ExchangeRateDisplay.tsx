import { useExchangeRate } from '@/lib/hooks/useApi';
import { TrendingUp } from 'lucide-react';

/**
 * ExchangeRateDisplay - Muestra el tipo de cambio USD/PEN en el header global
 * Estilo badge similar a EnvironmentBadge pero con colores ámbar/dorado
 */
export default function ExchangeRateDisplay() {
  const { data: exchangeRate, isLoading } = useExchangeRate();

  if (isLoading || !exchangeRate) {
    return (
      <div className="h-7 w-28 bg-gray-200 rounded animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-amber-100 border-amber-300 text-amber-700">
      <TrendingUp size={16} className="flex-shrink-0" strokeWidth={2.5} />
      <span className="text-xs font-bold">
        TC: {exchangeRate.rate.toFixed(2)}
      </span>
    </div>
  );
}
