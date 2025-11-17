/**
 * Available Balance Card - Tarjeta principal del dashboard
 * Muestra el saldo disponible hasta fin de ciclo
 */
import { Wallet, TrendingDown, Calendar } from 'lucide-react';
import { useMonthlyAvailable } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function AvailableBalanceCard() {
  const { data, isLoading } = useMonthlyAvailable();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determinar color del gradiente según salud
  const gradientConfig = {
    healthy: 'bg-gradient-to-br from-emerald-400/90 to-emerald-500/90',
    warning: 'bg-gradient-to-br from-amber-400/90 to-orange-500/90',
    critical: 'bg-gradient-to-br from-rose-400/90 to-rose-500/90',
  }[data.health_status];

  const Icon = data.available_amount >= 0 ? Wallet : TrendingDown;

  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg backdrop-blur-md ${gradientConfig} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide opacity-90">
              Disponible hasta fin de ciclo
            </h3>
            <p className="text-xs opacity-75">
              {data.days_remaining} días restantes
            </p>
          </div>
        </div>
      </div>

      {/* Monto Principal */}
      <div className="mb-3">
        <p className="text-3xl font-extrabold mb-1">
          {formatCurrencyISO(data.available_amount, 'PEN')}
        </p>
        <p className="text-xs opacity-90">
          Puedes gastar <span className="font-bold text-base">{formatCurrencyISO(data.daily_limit, 'PEN', { decimals: 0 })}</span> por día
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
        <div>
          <p className="text-xs opacity-75 mb-0.5">Ingresos</p>
          <p className="text-sm font-bold">
            {formatCurrencyISO(data.monthly_income / 1000, 'PEN', { decimals: 1 })}k
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-0.5">Gastos Fijos</p>
          <p className="text-sm font-bold">
            {formatCurrencyISO(data.fixed_expenses_budgeted / 1000, 'PEN', { decimals: 1 })}k
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-0.5">Variables</p>
          <p className="text-sm font-bold">
            {formatCurrencyISO(data.variable_expenses_spent / 1000, 'PEN', { decimals: 1 })}k
          </p>
        </div>
      </div>

      {/* Período */}
      <div className="mt-3 flex items-center gap-2 text-xs opacity-75">
        <Calendar className="w-3 h-3" />
        <span>
          {new Date(data.period_start).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {' '}
          {new Date(data.period_end).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
