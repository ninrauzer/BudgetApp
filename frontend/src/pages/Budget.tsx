import { useState } from 'react';
import { Calendar, Grid3x3, List, Loader2 } from 'lucide-react';
import { useCurrentCycle } from '@/lib/hooks/useApi';
import BudgetAnnualView from '@/components/BudgetAnnualView';
import BudgetMonthlyView from '@/components/BudgetMonthlyView';
import BudgetActions from '@/components/BudgetActions';

type ViewType = 'annual' | 'monthly';

export default function Budget() {
  const [viewType, setViewType] = useState<ViewType>('annual');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  
  const { data: currentCycle, isLoading: cycleLoading } = useCurrentCycle();

  // Set default cycle when loaded
  if (!selectedCycle && currentCycle) {
    setSelectedCycle(currentCycle.cycle_name);
  }

  // List of months in Spanish
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Loading state
  if (cycleLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Presupuesto</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Planifica tus ingresos y gastos
          </p>
        </div>

        {/* View Type Selector */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => setViewType('annual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewType === 'annual'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Vista Anual
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewType === 'monthly'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <List className="w-4 h-4" />
            Vista Mensual
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-r from-primary/5 to-info/5 border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          {viewType === 'annual' ? (
            // Year Selector for Annual View
            <div className="flex items-center gap-4">
              <label className="text-body font-bold text-text-primary">
                Año:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-2 rounded-lg bg-white border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Calendar className="w-5 h-5 text-text-secondary" />
                </button>
                <span className="text-h3 font-bold text-text-primary min-w-[100px] text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-2 rounded-lg bg-white border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Calendar className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>
          ) : (
            // Cycle Selector for Monthly View
            <div className="flex items-center gap-4">
              <label className="text-body font-bold text-text-primary">
                Ciclo:
              </label>
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white border-2 border-border text-text-primary font-bold hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              {currentCycle && selectedCycle === currentCycle.cycle_name && (
                <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-bold">
                  Ciclo Actual
                </span>
              )}
            </div>
          )}

          {/* Actions / Info */}
          <div className="flex items-center gap-4">
            {viewType === 'monthly' && (
              <BudgetActions 
                currentCycle={selectedCycle}
                onSuccess={() => {
                  // Force refresh by changing state
                  const temp = selectedCycle;
                  setSelectedCycle('');
                  setTimeout(() => setSelectedCycle(temp), 10);
                }}
              />
            )}
            <div className="text-body-sm text-text-secondary">
              {viewType === 'annual' ? (
                <span>Visualiza y edita presupuestos para todos los meses</span>
              ) : (
                <span>Gestiona el presupuesto del ciclo seleccionado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Will be filled with Annual/Monthly views */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        {viewType === 'annual' ? (
          <BudgetAnnualView year={selectedYear} />
        ) : (
          <BudgetMonthlyView cycleName={selectedCycle} />
        )}
      </div>
    </div>
  );
}
