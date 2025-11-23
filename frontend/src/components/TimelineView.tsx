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

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-cyan-100">
          <Calendar className="w-6 h-6 text-cyan-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Ciclo de Facturación</h2>
          <p className="text-lg text-gray-600">¿Cuándo es mejor comprar?</p>
        </div>
      </div>

      {/* TIMELINE VISUAL - Línea horizontal con puntos */}
      <div className="mb-12">
        <div className="relative py-8">
          {/* Línea base con segmentos de color según fases */}
          <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 flex">
            {timeline.timeline.cycle_phases.map((phase, idx) => {
              const startDate = new Date(phase.date_range[0]);
              const endDate = new Date(phase.date_range[1]);
              const periodStart = new Date(timeline.current_cycle.statement_date);
              periodStart.setDate(periodStart.getDate() - 23);
              const dueDate = new Date(timeline.current_cycle.due_date);
              
              const totalDays = Math.ceil((dueDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
              const phaseDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const phasePercent = (phaseDays / totalDays) * 100;
              
              const bgColor = phase.phase === 'optimal'
                ? 'bg-emerald-500'
                : phase.phase === 'normal'
                ? 'bg-amber-500'
                : 'bg-red-500';
              
              return (
                <div key={idx} className={`${bgColor} flex-1`} style={{ width: `${phasePercent}%` }} />
              );
            })}
          </div>

          {/* Contenedor de puntos */}
          <div className="relative flex justify-between items-center">
            {/* PUNTO 1: Cierre anterior */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg relative z-10 mb-2"></div>
              <p className="text-xs font-bold text-gray-900 whitespace-nowrap">
                {periodStart.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-600 whitespace-nowrap">Cierre anterior</p>
            </div>

            {/* PUNTO 2: Inicio nuevo ciclo (Hoy o en el pasado) */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg relative z-10 mb-2"></div>
              <p className="text-xs font-bold text-emerald-700 whitespace-nowrap">Inicio nuevo ciclo</p>
              <p className="text-xs text-gray-600 whitespace-nowrap">
                {periodStart.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* PUNTO 3: Fecha de Corte */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-lg relative z-10 mb-2"></div>
              <p className="text-xs font-bold text-orange-700 whitespace-nowrap">Cierre</p>
              <p className="text-xs text-gray-600 whitespace-nowrap">
                {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* PUNTO 4: Fecha de Pago */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg relative z-10 mb-2"></div>
              <p className="text-xs font-bold text-blue-700 whitespace-nowrap">Pago</p>
              <p className="text-xs text-gray-600 whitespace-nowrap">
                {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FASES BAJO LA LÍNEA */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">Momentos para Comprar</h3>
        
        <div className="space-y-4">
          {timeline.timeline.cycle_phases.map((phase, idx) => {
            const startDate = new Date(phase.date_range[0]);
            const endDate = new Date(phase.date_range[1]);
            
            const bgColor = phase.phase === 'optimal' 
              ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
              : phase.phase === 'normal'
              ? 'bg-amber-50 border-l-4 border-l-amber-500'
              : 'bg-red-50 border-l-4 border-l-red-500';

            const textColor = phase.phase === 'optimal'
              ? 'text-emerald-900'
              : phase.phase === 'normal'
              ? 'text-amber-900'
              : 'text-red-900';

            return (
              <div key={idx} className={`${bgColor} p-4 rounded-lg`}>
                <p className={`font-bold text-sm ${textColor}`}>
                  {phase.description}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {startDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })} - {endDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRID DE INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Días hasta Cierre */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
          <p className="text-xs text-orange-700 font-bold uppercase tracking-wide mb-2">Días hasta Cierre</p>
          <p className="text-3xl font-black text-orange-600 mb-1">{timeline.current_cycle.days_until_close}</p>
          <p className="text-sm text-orange-700">
            {statementDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Días hasta Pago */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2">Días hasta Pago</p>
          <p className="text-3xl font-black text-blue-600 mb-1">{timeline.current_cycle.days_until_payment}</p>
          <p className="text-sm text-blue-700">
            {dueDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
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
    </div>
  );
}
