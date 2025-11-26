import { Calendar } from 'lucide-react';
import { useBillingCycle, useCurrentCycle } from '@/lib/hooks/useApi';
import { formatLocalDate, getUserTimezone } from '@/lib/utils/dateParser';

export default function BillingCycleSettings() {
  const { data: billingCycle, isLoading: isCycleLoading } = useBillingCycle();
  const { data: currentCycleInfo, isLoading: isInfoLoading } = useCurrentCycle();
  
  // Get user's timezone preference
  const userTimezone = getUserTimezone();

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
                {formatLocalDate(currentCycleInfo.start_date, 'es-PE', { year: 'numeric', month: 'long', day: 'numeric' }, userTimezone)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">Hasta:</p>
              <p className="font-bold text-text-primary">
                {formatLocalDate(currentCycleInfo.end_date, 'es-PE', { year: 'numeric', month: 'long', day: 'numeric' }, userTimezone)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Nota:</strong> El ciclo de facturación se puede ajustar mes a mes usando la grilla de ciclos abajo. El día base predeterminado es <strong>{billingCycle?.start_day}</strong>.
        </p>
      </div>
    </div>
  );
}
