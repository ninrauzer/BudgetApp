/**
 * Cashflow Card - Balance del ciclo con mini sparkline
 */
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMonthlyCashflow } from '../../hooks/useDashboardMetrics';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatCurrencyISO } from '@/lib/format';

export function CashflowCard() {
  const { data, isLoading } = useMonthlyCashflow();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const Icon = data.is_positive ? TrendingUp : TrendingDown;
  const gradient = data.is_positive 
    ? 'bg-gradient-to-br from-cyan-400/90 to-cyan-500/90' 
    : 'bg-gradient-to-br from-rose-400/90 to-rose-500/90';

  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg backdrop-blur-md ${gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6 text-white/80" strokeWidth={2} />
      </div>
      
      <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Cashflow del Ciclo</p>
      <p className="text-2xl font-black text-white tracking-tight mb-1">
        {data.is_positive ? '+' : '-'}{formatCurrencyISO(Math.abs(data.balance), 'PEN')}
      </p>

      {/* Sparkline */}
      <div className="h-12 -mx-2 mb-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.daily_data}>
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="rgba(255,255,255,0.8)" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
        <div>
          <p className="text-xs text-white/70 mb-0.5">Ingresos</p>
          <p className="text-xs font-bold text-white">
            +{formatCurrencyISO(data.total_income / 1000, 'PEN', { decimals: 1 })}k
          </p>
        </div>
        <div>
          <p className="text-xs text-white/70 mb-0.5">Gastos</p>
          <p className="text-xs font-bold text-white">
            -{formatCurrencyISO(data.total_expense / 1000, 'PEN', { decimals: 1 })}k
          </p>
        </div>
      </div>
    </div>
  );
}
