/**
 * Cashflow Card - Balance del ciclo con mini sparkline
 */
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMonthlyCashflow } from '../../hooks/useDashboardMetrics';
import { ResponsiveLine } from '@nivo/line';
import { formatCurrencyISO } from '@/lib/format';

export function CashflowCard() {
  const { data: rawData, isLoading } = useMonthlyCashflow();
  
  // Descongelar el objeto para evitar React error #310
  const data = rawData ? JSON.parse(JSON.stringify(rawData)) : null;

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

  // Separar datos reales vs proyectados
  const realData = (data.daily_data || []).filter((d: any) => !d.is_projected);
  const projectedData = (data.daily_data || []).filter((d: any) => d.is_projected);
  
  // Preparar datos para Nivo (sin useMemo para evitar React error #310)
  const chartData = [
    {
      id: 'real',
      data: realData.map((d: any) => ({
        x: d.date,
        y: d.balance || 0
      }))
    },
    {
      id: 'projected',
      data: projectedData.length > 0 ? [
        // Conectar último real con primero proyectado
        ...( realData.length > 0 ? [{
          x: realData[realData.length - 1].date,
          y: realData[realData.length - 1].balance
        }] : []),
        ...projectedData.map((d: any) => ({
          x: d.date,
          y: d.balance || 0
        }))
      ] : []
    }
  ];

  return (
    <div className={`min-h-full md:h-auto rounded-2xl p-4 md:p-6 text-white shadow-lg backdrop-blur-md ${gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white/80" strokeWidth={2} />
      </div>
      
      <p className="text-white/70 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">Cashflow del Ciclo</p>
      <p className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">
        {data.is_positive ? '+' : '-'}{formatCurrencyISO(Math.abs(data.balance), 'PEN')}
      </p>

      {/* Sparkline con Nivo */}
      <div className="mb-2 mt-1 md:mt-2" style={{ width: '100%', height: '40px' }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear' }}
          curve="monotoneX"
          colors={(d) => d.id === 'real' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'}
          lineWidth={2}
          enablePoints={false}
          enableArea={false}
          enableGridX={false}
          enableGridY={false}
          enableCrosshair={false}
          motionConfig="stiff"
          defs={[
            {
              id: 'dashed',
              type: 'patternLines',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              lineWidth: 2,
              spacing: 4,
              rotation: 0
            }
          ]}
        />
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
