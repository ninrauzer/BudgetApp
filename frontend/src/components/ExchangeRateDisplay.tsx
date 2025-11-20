import { useExchangeRate } from '@/lib/hooks/useApi';
import { useState, useEffect } from 'react';

/**
 * ExchangeRateDisplay - Chip de tipo de cambio USD/PEN en header
 * Estilo neutral profesional (estándar fintech)
 */
export default function ExchangeRateDisplay() {
  const { data: exchangeRate, isLoading } = useExchangeRate();
  const [variation, setVariation] = useState<{ percent: number; isPositive: boolean } | null>(null);

  useEffect(() => {
    // Simular variación diaria (en producción, vendría del backend)
    const simpleVariation = (Math.random() - 0.5) * 0.01; // -0.5% a +0.5%
    setVariation({
      percent: Math.abs(simpleVariation),
      isPositive: simpleVariation >= 0
    });
  }, [exchangeRate?.rate]);

  if (isLoading || !exchangeRate) {
    return (
      <div className="h-7 w-40 bg-gray-100 rounded animate-pulse" />
    );
  }

  const arrow = variation?.isPositive ? '↑' : '↓';
  const arrowColor = variation?.isPositive ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium tabular-nums">
      <span>USD/PEN · {exchangeRate.rate.toFixed(2)}</span>
      <span className={`${arrowColor}`}>
        {arrow} {variation?.percent.toFixed(2)}%
      </span>
    </div>
  );
}
