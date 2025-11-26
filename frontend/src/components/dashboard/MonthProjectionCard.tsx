/**
 * Month Projection Card - Proyección de cierre del ciclo
 */
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMonthProjection } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function MonthProjectionCard() {
  const { data, isLoading } = useMonthProjection();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const Icon = data.is_positive ? TrendingUp : TrendingDown;
  const gradient = data.is_positive 
    ? 'bg-gradient-to-br from-indigo-400/90 to-indigo-500/90' 
    : 'bg-gradient-to-br from-orange-400/90 to-orange-500/90';

  return (
    <div className={`min-h-full md:h-auto rounded-2xl p-4 md:p-6 text-white shadow-lg backdrop-blur-md ${gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white/80" strokeWidth={2} />
      </div>
      
      <p className="text-white/70 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">Proyección de Cierre</p>
      <p className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">
        {data.is_positive ? '+' : ''}{formatCurrencyISO(data.projected_balance, 'PEN')}
      </p>
      <p className="text-white/60 text-[11px] md:text-xs mb-2 md:mb-3">{data.message}</p>
      
      <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-3 border-t border-white/20">
        <div>
          <p className="text-[10px] md:text-xs text-white/70 mb-0.5">Promedio Diario</p>
          <p className="text-xs md:text-sm font-bold text-white">
            {formatCurrencyISO(data.daily_average_spending, 'PEN', { decimals: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-white/70 mb-0.5">Días Restantes</p>
          <p className="text-xs md:text-sm font-bold text-white">
            {data.days_remaining}
          </p>
        </div>
      </div>
    </div>
  );
}
