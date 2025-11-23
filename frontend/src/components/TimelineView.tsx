import React from 'react';
import { Calendar } from 'lucide-react';
import type { CycleTimeline } from '@/types/creditCards';

interface TimelineViewProps {
  timeline: CycleTimeline;
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  const today = new Date();
  
  // Calcular el inicio del ciclo: 23 días antes del cierre
  const statementDate = new Date(timeline.current_cycle.statement_date);
  const dueDate = new Date(timeline.current_cycle.due_date);
  
  // El ciclo comienza 23 días antes de la fecha de cierre
  const periodStart = new Date(statementDate);
  periodStart.setDate(periodStart.getDate() - 23);

  // Calcular el progreso del ciclo
  const totalCycleDays = Math.ceil((dueDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceStart = Math.ceil((today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.max(0, Math.min(100, (daysSinceStart / totalCycleDays) * 100));

  // Calcular posición de fecha de cierre
  const daysUntilStatement = Math.ceil((statementDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const statementPercent = (daysUntilStatement / totalCycleDays) * 100;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-cyan-100">
          <Calendar className="w-6 h-6 text-cyan-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Ciclo de Facturación</h2>
          <p className="text-sm text-gray-600">¿Cuál es el mejor momento para comprar?</p>
        </div>
      </div>

      {/* Barra de Progreso Principal */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Progreso del Ciclo</p>
            <p className="text-xs text-gray-500 mt-1">
              {periodStart.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} → {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <p className="text-2xl font-black text-gray-900">{progressPercent.toFixed(0)}%</p>
        </div>

        {/* Barra de progreso partida por fecha de corte */}
        <div className="relative flex h-3 rounded-full overflow-hidden bg-gray-200">
          {/* Parte ANTES del corte - Azul */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${statementPercent}%` }}
          />
          
          {/* Separador visual - Línea naranja */}
          <div className="w-1 bg-orange-500 flex-shrink-0" />
          
          {/* Parte DESPUÉS del corte - Gris */}
          <div
            className="h-full bg-gray-300 transition-all duration-300"
            style={{ flex: 1 }}
          />
          
          {/* Marcador de fecha de cierre */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 mt-2"
            style={{ left: `${statementPercent}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-3 h-6 bg-orange-500 rounded-full shadow-lg -mt-2"></div>
              <p className="text-xs font-bold text-orange-600 whitespace-nowrap mt-3">Corte</p>
              <p className="text-xs text-gray-600 whitespace-nowrap">
                {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Días hasta Cierre */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <p className="text-xs text-orange-700 font-bold uppercase tracking-wide mb-2">Días hasta Cierre</p>
          <p className="text-3xl font-black text-orange-600 mb-1">{timeline.current_cycle.days_until_close}</p>
          <p className="text-sm text-orange-700">
            {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Días hasta Pago */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2">Días hasta Pago</p>
          <p className="text-3xl font-black text-blue-600 mb-1">{timeline.current_cycle.days_until_payment}</p>
          <p className="text-sm text-blue-700">
            {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Float Hoy */}
        <div className={`rounded-xl p-6 border-2 ${
          timeline.float_calculator.if_buy_today.float_days >= 45
            ? 'bg-emerald-50 border-emerald-300'
            : timeline.float_calculator.if_buy_today.float_days >= 30
            ? 'bg-amber-50 border-amber-300'
            : 'bg-rose-50 border-rose-300'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${
            timeline.float_calculator.if_buy_today.float_days >= 45
              ? 'text-emerald-700'
              : timeline.float_calculator.if_buy_today.float_days >= 30
              ? 'text-amber-700'
              : 'text-rose-700'
          }`}>Si Compras Hoy</p>
          <p className={`text-3xl font-black mb-1 ${
            timeline.float_calculator.if_buy_today.float_days >= 45
              ? 'text-emerald-600'
              : timeline.float_calculator.if_buy_today.float_days >= 30
              ? 'text-amber-600'
              : 'text-rose-600'
          }`}>
            {timeline.float_calculator.if_buy_today.float_days} días
          </p>
          <p className="text-sm text-gray-700">de crédito gratis</p>
        </div>
      </div>

      {/* Ventana Óptima - Destacada */}
      <div className="bg-gradient-to-r from-emerald-400/90 to-emerald-500/90 rounded-xl p-6 text-white border-2 border-emerald-300 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide mb-2 text-emerald-100">🟢 Ventana Óptima para Comprar</p>
        <p className="text-2xl font-black mb-2">
          {new Date(timeline.timeline.best_purchase_window.start).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })} - {new Date(timeline.timeline.best_purchase_window.end).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
        </p>
        <p className="text-sm text-emerald-50">
          {timeline.timeline.best_purchase_window.reason}
        </p>
        <p className="text-xs text-emerald-100 mt-2">
          Máximo {timeline.timeline.best_purchase_window.float_days} días de crédito gratis
        </p>
      </div>

      {/* Fases del Ciclo */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Momentos para Comprar</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeline.timeline.cycle_phases.map((phase, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 border-l-4 ${
                phase.phase === 'optimal'
                  ? 'bg-emerald-50 border-l-emerald-500 border border-emerald-200'
                  : phase.phase === 'normal'
                  ? 'bg-amber-50 border-l-amber-500 border border-amber-200'
                  : 'bg-rose-50 border-l-rose-500 border border-rose-200'
              }`}
            >
              <p className={`font-bold text-sm mb-1 ${
                phase.phase === 'optimal'
                  ? 'text-emerald-900'
                  : phase.phase === 'normal'
                  ? 'text-amber-900'
                  : 'text-rose-900'
              }`}>
                {phase.description}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(phase.date_range[0]).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {new Date(phase.date_range[1]).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
