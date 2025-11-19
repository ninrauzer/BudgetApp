import { useState, useEffect, useMemo } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { useBillingCycle, useCurrentCycle, useUpdateBillingCycle } from '@/lib/hooks/useApi';

export default function BillingCycleSettings() {
  const { data: billingCycle, isLoading: isCycleLoading } = useBillingCycle();
  const { data: currentCycleInfo, isLoading: isInfoLoading } = useCurrentCycle();
  const updateMutation = useUpdateBillingCycle();
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (billingCycle && !isEditing) {
      setSelectedDay(billingCycle.start_day);
    }
  }, [billingCycle, isEditing]);

  const handleSave = async () => {
    if (selectedDay === null) return;
    try {
      await updateMutation.mutateAsync(selectedDay);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating billing cycle:', error);
    }
  };

  const exampleRange = useMemo(() => {
    if (!selectedDay) return null;
    const today = new Date();
    const currentDay = today.getDate();

    let startYear = today.getFullYear();
    let startMonth = today.getMonth();

    if (currentDay < selectedDay) {
      startMonth -= 1;
      if (startMonth < 0) {
        startMonth = 11;
        startYear -= 1;
      }
    }

    const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
    const safeDay = Math.min(selectedDay, daysInStartMonth);
    const start = new Date(startYear, startMonth, safeDay);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    const formatter = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
    });

    return {
      startLabel: formatter.format(start),
      endLabel: formatter.format(end),
    };
  }, [selectedDay]);

  const isLoading = isCycleLoading || isInfoLoading;

  if (isLoading) {
    return <div className="text-center py-8 text-text-secondary">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Current Cycle Info */}
      {currentCycleInfo && (
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-text-primary">Ciclo Actual</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-text-secondary">Periodo:</p>
              <p className="text-lg font-bold text-text-primary">
                {currentCycleInfo.cycle_name}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Desde:</p>
              <p className="font-bold text-text-primary">
                {new Date(currentCycleInfo.start_date).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Hasta:</p>
              <p className="font-bold text-text-primary">
                {new Date(currentCycleInfo.end_date).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Day Configuration */}
      <div className="bg-surface-soft border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-text-primary">Inicio del Ciclo</h3>
            <p className="text-sm text-text-secondary">
              Las transacciones se agruparán según este día del mes
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setSelectedDay(billingCycle?.start_day ?? null);
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm transition-all"
            >
              Editar
            </button>
          )}
        </div>

        {!isEditing ? (
          // Display current day
          <div className="bg-surface border-2 border-border rounded-xl p-6 text-center">
            <p className="text-sm text-text-secondary mb-2">Día de inicio actual:</p>
            <p className="text-5xl font-bold text-primary mb-2">
              {billingCycle?.start_day}
            </p>
            <p className="text-text-secondary">
              del mes
            </p>
          </div>
        ) : (
          // Edit mode - Day selector
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Selecciona el día del mes en el que inicia cada ciclo de facturación:
            </p>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                    selectedDay === day
                      ? 'bg-primary text-white shadow-button'
                      : 'bg-surface border-2 border-border hover:border-primary/50 text-text-primary'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={selectedDay === null || updateMutation.isPending}
                className="flex-1 px-4 py-3 bg-success hover:bg-success-hover text-white rounded-lg font-bold shadow-button transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedDay(billingCycle?.start_day || null);
                }}
                className="flex-1 px-4 py-3 bg-surface border-2 border-border text-text-primary hover:bg-surface-soft rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>

            {/* Preview */}
            {selectedDay && (
              <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-2">Vista previa:</p>
                <p className="font-bold text-text-primary">
                  Los ciclos comenzarán el día <span className="text-primary">{selectedDay}</span> de cada mes
                </p>
                {exampleRange && (
                  <p className="text-sm text-text-secondary mt-2">
                    Ejemplo (ciclo actual): {exampleRange.startLabel} al {exampleRange.endLabel}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Nota:</strong> Cambiar el inicio del ciclo solo afectará a futuras transacciones. Las transacciones existentes se recalcularán según el nuevo ciclo.
        </p>
      </div>
    </div>
  );
}
