/**
 * Problem Category Card - Categoría con mayor desviación
 */
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useProblemCategory } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function ProblemCategoryCard() {
  const { data, isLoading } = useProblemCategory();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const hasDeviation = data.category_id > 0 && data.deviation > 0;
  const Icon = hasDeviation ? AlertTriangle : TrendingUp;
  const gradient = hasDeviation 
    ? 'bg-gradient-to-br from-pink-400/90 to-pink-500/90' 
    : 'bg-gradient-to-br from-teal-400/90 to-teal-500/90';

  return (
    <div className={`min-h-full md:h-auto rounded-2xl p-4 md:p-6 text-white shadow-lg backdrop-blur-md ${gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white/80" strokeWidth={2} />
      </div>
      
      <p className="text-white/70 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">
        {hasDeviation ? 'Categoría a Revisar' : 'Estado del Presupuesto'}
      </p>
      <p className="text-lg md:text-xl font-black text-white tracking-tight mb-1">
        {data.category_name}
      </p>
      <p className="text-white/60 text-[11px] md:text-xs mb-2 md:mb-3">{data.message}</p>
      
      {hasDeviation && (
        <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-3 border-t border-white/20">
          <div>
            <p className="text-[10px] md:text-xs text-white/70 mb-0.5">Presupuestado</p>
            <p className="text-xs md:text-sm font-bold text-white">
              {formatCurrencyISO(data.budgeted / 1000, 'PEN', { decimals: 1 })}k
            </p>
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-white/70 mb-0.5">Gastado</p>
            <p className="text-xs md:text-sm font-bold text-white">
              {formatCurrencyISO(data.spent / 1000, 'PEN', { decimals: 1 })}k
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
