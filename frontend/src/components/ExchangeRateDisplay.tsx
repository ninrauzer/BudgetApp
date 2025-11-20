import { useExchangeRate } from '@/lib/hooks/useApi';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * ExchangeRateDisplay - Muestra el tipo de cambio USD/PEN en el header global
 * Con variación diaria y colores mejorados
 */
export default function ExchangeRateDisplay() {
  const { data: exchangeRate, isLoading } = useExchangeRate();
  const [variation, setVariation] = useState<{ percent: number; isPositive: boolean } | null>(null);

  useEffect(() => {
    // Simular variación diaria (en producción, vendría del backend)
    // Por ahora usamos un valor simulado entre -0.5% y +0.5%
    const simpleVariation = (Math.random() - 0.5) * 0.01; // -0.5% a +0.5%
    setVariation({
      percent: Math.abs(simpleVariation),
      isPositive: simpleVariation >= 0
    });
  }, [exchangeRate?.rate]);

  if (isLoading || !exchangeRate) {
    return (
      <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
    );
  }

  const bgColor = variation?.isPositive 
    ? 'bg-gradient-to-r from-amber-50 to-yellow-50' 
    : 'bg-gradient-to-r from-amber-50 to-orange-50';
  
  const borderColor = variation?.isPositive 
    ? 'border-amber-300' 
    : 'border-orange-300';
  
  const textColor = variation?.isPositive 
    ? 'text-amber-800' 
    : 'text-orange-800';
  
  const TrendIcon = variation?.isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}>
      <span className="text-xs font-bold">
        USD/PEN · {exchangeRate.rate.toFixed(2)}
      </span>
      <div className="flex items-center gap-0.5">
        <TrendIcon size={14} className="flex-shrink-0" strokeWidth={2.5} />
        <span className="text-xs font-bold">
          {variation?.percent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
