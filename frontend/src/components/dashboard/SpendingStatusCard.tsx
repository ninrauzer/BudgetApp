/**
 * Spending Status Card - Semáforo financiero
 */
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSpendingStatus } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function SpendingStatusCard() {
  const { data, isLoading } = useSpendingStatus();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-24 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const statusConfig = {
    under_budget: {
      icon: CheckCircle,
      gradient: 'bg-gradient-to-br from-blue-400/90 to-blue-500/90',
      label: '🟢 Bajo Control'
    },
    on_track: {
      icon: AlertTriangle,
      gradient: 'bg-gradient-to-br from-amber-400/90 to-orange-500/90',
      label: '🟡 En Rango'
    },
    over_budget: {
      icon: AlertCircle,
      gradient: 'bg-gradient-to-br from-rose-400/90 to-rose-500/90',
      label: '🔴 Exceso'
    }
  };

  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg backdrop-blur-md ${config.gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6 text-white/80" strokeWidth={2} />
      </div>
      
      <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Estado de Gasto</p>
      <p className="text-2xl font-black text-white tracking-tight mb-1">
        {config.label}
      </p>
      <p className="text-white/60 text-xs mb-3">{data.message}</p>
      
      {/* Progress bar */}
      <div className="pt-3 border-t border-white/20">
        <div className="flex justify-between text-xs mb-2 text-white/70">
          <span>{formatCurrencyISO(data.total_spent, 'PEN', { decimals: 0 })}</span>
          <span className="font-bold text-white">{((data.total_spent / data.total_budgeted) * 100).toFixed(0)}%</span>
          <span>{formatCurrencyISO(data.total_budgeted, 'PEN', { decimals: 0 })}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-white"
            style={{ width: `${Math.min(100, (data.total_spent / data.total_budgeted) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
