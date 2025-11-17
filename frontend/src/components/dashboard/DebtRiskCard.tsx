/**
 * Debt Risk Card - Resumen de deuda con indicador de riesgo
 */
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDebtSummary } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function DebtRiskCard() {
  const { data, isLoading } = useDebtSummary();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-32 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const riskConfig = {
    healthy: {
      icon: CheckCircle,
      gradient: 'bg-gradient-to-br from-purple-400/90 to-purple-500/90',
      label: 'Saludable'
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'bg-gradient-to-br from-orange-400/90 to-orange-500/90',
      label: 'Precaución'
    },
    critical: {
      icon: AlertTriangle,
      gradient: 'bg-gradient-to-br from-red-400/90 to-red-500/90',
      label: 'Riesgo Alto'
    }
  };

  const config = riskConfig[data.risk_level];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg backdrop-blur-md ${config.gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-3">
        <CreditCard className="w-6 h-6 text-white/80" strokeWidth={2} />
        <Icon className="w-5 h-5 text-white/90" strokeWidth={2.5} />
      </div>

      <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Deuda Bancaria</p>
      <p className="text-2xl font-black text-white tracking-tight mb-1">
        {formatCurrencyISO(data.total_debt / 1000, 'PEN', { decimals: 1 })}k
      </p>
      <p className="text-white/60 text-xs mb-3">
        Cuota: {formatCurrencyISO(data.total_monthly_payment, 'PEN')}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
        <div>
          <p className="text-xs text-white/70 mb-0.5">% Ingresos</p>
          <p className="text-sm font-bold text-white">
            {data.monthly_income_percentage.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-white/70 mb-0.5">Préstamos</p>
          <p className="text-sm font-bold text-white">
            {data.active_loans_count}
          </p>
        </div>
      </div>
    </div>
  );
}
