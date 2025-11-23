import React from 'react';
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import type { CycleTimeline } from '@/types/creditCards';

interface TimelineViewProps {
  timeline: CycleTimeline;
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  const today = new Date();
  const statementDate = new Date(timeline.current_cycle.statement_date);
  const dueDate = new Date(timeline.current_cycle.due_date);
  const bestStart = new Date(timeline.timeline.best_purchase_window.start);
  const bestEnd = new Date(timeline.timeline.best_purchase_window.end);

  // Calcular posiciones en el timeline
  const periodStart = new Date(timeline.current_cycle.cycle_start);
  const periodEnd = dueDate;
  const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  const getTodayPosition = () => {
    const daysSinceStart = Math.ceil((today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / totalDays) * 100;
  };

  const getStatementPosition = () => {
    const daysSinceStart = Math.ceil((statementDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / totalDays) * 100;
  };

  const getBestWindowStart = () => {
    const daysSinceStart = Math.ceil((bestStart.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / totalDays) * 100;
  };

  const getBestWindowEnd = () => {
    const daysSinceStart = Math.ceil((bestEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / totalDays) * 100;
  };

  const getDuePosition = () => {
    return 100;
  };

  return (
    <div className="space-y-8">
      {/* Timeline Visual Horizontal */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-cyan-100">
            <Calendar className="w-6 h-6 text-cyan-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Ciclo de Facturación</h2>
            <p className="text-sm text-gray-600">¿Cuál es el mejor momento para comprar?</p>
          </div>
        </div>

        {/* Timeline Horizontal */}
        <div className="mb-12">
          <div className="relative h-32">
            {/* Línea base */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>

            {/* Ventana Óptima (background) */}
            <div
              className="absolute top-1/2 h-16 bg-emerald-100 transform -translate-y-1/2 rounded-lg opacity-50"
              style={{
                left: `${getBestWindowStart()}%`,
                right: `${100 - getBestWindowEnd()}%`,
              }}
            />

            {/* Marcadores principales */}
            {/* Inicio del período */}
            <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: '0%' }}>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <div className="mt-6 text-center">
                  <p className="text-xs font-bold text-gray-900">
                    {periodStart.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-gray-600">Inicio del Período</p>
                </div>
              </div>
            </div>

            {/* Hoy (si está en el rango) */}
            {getTodayPosition() > 0 && getTodayPosition() < 100 && (
              <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${getTodayPosition()}%` }}>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="mt-6 text-center">
                    <p className="text-xs font-bold text-yellow-600">HOY</p>
                    <p className="text-xs text-gray-600">{today.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fecha de Cierre */}
            <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${getStatementPosition()}%` }}>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="mt-6 text-center">
                  <p className="text-xs font-bold text-orange-600">¡COMPRA AQUÍ!</p>
                  <p className="text-xs text-gray-600 font-medium">Fecha de Cierre</p>
                  <p className="text-xs text-gray-600">
                    {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha de Pago */}
            <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${getDuePosition()}%` }}>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="mt-6 text-center">
                  <p className="text-xs font-bold text-blue-600">Último Día de Pago</p>
                  <p className="text-xs text-gray-600">
                    {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-gray-600">APROX. {dueDate.toLocaleDateString('es-PE', { year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Información */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Próximo Corte */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <p className="text-xs text-orange-700 font-medium uppercase tracking-wide mb-2">Próximo Corte</p>
            <p className="text-2xl font-black text-orange-600">
              {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-xs text-orange-700 mt-2">en {timeline.current_cycle.days_until_close} días</p>
          </div>

          {/* Próximo Pago */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700 font-medium uppercase tracking-wide mb-2">Próximo Pago</p>
            <p className="text-2xl font-black text-blue-600">
              {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-xs text-blue-700 mt-2">en {timeline.current_cycle.days_until_payment} días</p>
          </div>

          {/* Si Compras Hoy */}
          <div className={`
            rounded-lg p-4 border-2
            ${timeline.float_calculator.if_buy_today.float_days >= 45
              ? 'bg-emerald-50 border-emerald-300'
              : timeline.float_calculator.if_buy_today.float_days >= 30
              ? 'bg-amber-50 border-amber-300'
              : 'bg-rose-50 border-rose-300'
            }
          `}>
            <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${
              timeline.float_calculator.if_buy_today.float_days >= 45
                ? 'text-emerald-700'
                : timeline.float_calculator.if_buy_today.float_days >= 30
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}>Si Compras Hoy</p>
            <p className={`text-2xl font-black ${
              timeline.float_calculator.if_buy_today.float_days >= 45
                ? 'text-emerald-600'
                : timeline.float_calculator.if_buy_today.float_days >= 30
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {timeline.float_calculator.if_buy_today.float_days} días
            </p>
            <p className="text-xs text-gray-700 mt-2">de crédito gratis</p>
          </div>

          {/* Ventana Óptima */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-300 rounded-lg p-4">
            <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-2">🟢 Ventana Óptima</p>
            <p className="text-sm font-bold text-emerald-600">
              {bestStart.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {bestEnd.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-xs text-emerald-700 mt-2">
              Máximo {timeline.timeline.best_purchase_window.float_days} días gratis
            </p>
          </div>
        </div>
      </div>

      {/* Explicación de Fases */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">Momentos para Comprar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeline.timeline.cycle_phases.map((phase, idx) => (
            <div
              key={idx}
              className={`
                rounded-lg p-4 border-2
                ${phase.phase === 'optimal'
                  ? 'bg-emerald-50 border-emerald-200'
                  : phase.phase === 'normal'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
                }
              `}
            >
              <div className="flex items-start gap-3 mb-2">
                {phase.phase === 'optimal' && <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                {phase.phase === 'normal' && <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                {phase.phase === 'risky' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`font-bold ${
                    phase.phase === 'optimal'
                      ? 'text-emerald-900'
                      : phase.phase === 'normal'
                      ? 'text-amber-900'
                      : 'text-rose-900'
                  }`}>
                    {phase.description}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-700 ml-8">
                {new Date(phase.date_range[0]).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long'
                })} - {new Date(phase.date_range[1]).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
