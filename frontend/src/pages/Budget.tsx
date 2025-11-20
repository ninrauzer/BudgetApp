import { useState, useEffect } from 'react';
import { Grid3x3, List, Loader2 } from 'lucide-react';
import { useCurrentCycle, useExchangeRate } from '@/lib/hooks/useApi';
import { CycleInfo } from '@/components/ui/cycle-info';
import BudgetAnnualView from '@/components/BudgetAnnualView';
import BudgetMonthlyView from '@/components/BudgetMonthlyView';
import BudgetActions from '@/components/BudgetActions';
import { useDemoMode } from '@/lib/hooks/useDemoMode';

type ViewType = 'annual' | 'monthly';

export default function Budget() {
  const [viewType, setViewType] = useState<ViewType>('annual');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
  const { applyDemoScale } = useDemoMode();
  
  const { data: currentCycle, isLoading: cycleLoading } = useCurrentCycle();
  const { data: exchangeRate, isLoading: rateLoading } = useExchangeRate();

  // Force re-fetch exchange rate when currency changes
  useEffect(() => {
    if (displayCurrency === 'USD') {
      // Exchange rate will be auto-fetched by the hook
    }
  }, [displayCurrency]);

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
      <div className="flex items-center justify-between px-8">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">
            Presupuesto {viewType === 'annual' ? selectedYear : `${selectedCycle} ${selectedYear}`}
          </h1>
          <CycleInfo cycleData={currentCycle} exchangeRate={exchangeRate?.rate} isLoading={cycleLoading || rateLoading} />
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector (for Annual) or Month Selector (for Monthly) */}
          {viewType === 'annual' ? (
            <div className="relative bg-white border border-border rounded-xl p-1 shadow-sm">
              <div className="flex items-center gap-1">
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => {
                  const isSelected = selectedYear === year;
                  const isCurrent = year === new Date().getFullYear();
                  return (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`
                        relative px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ease-out
                        ${isSelected 
                          ? 'text-white shadow-md scale-105 z-10' 
                          : 'text-text-muted hover:text-text-primary hover:bg-gray-50'
                        }
                      `}
                    >
                      {/* Background gradient for selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-indigo-600 rounded-lg -z-10 animate-in fade-in slide-in-from-bottom-1 duration-300" />
                      )}
                      
                      <span className="relative z-10">{year}</span>
                      
                      {/* Current year indicator */}
                      {isCurrent && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border border-white shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
                  Actual
                </span>
              )}
            </div>
          )}

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setDisplayCurrency('PEN')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                displayCurrency === 'PEN'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              PEN
            </button>
            <button
              onClick={() => setDisplayCurrency('USD')}
              disabled={rateLoading}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              } disabled:opacity-50`}
            >
              {rateLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'USD'}
            </button>
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
      </div>

      {/* Actions Bar (only for monthly view) */}
      {viewType === 'monthly' && (
        <div className="flex items-center justify-end">
          <BudgetActions 
            currentCycle={selectedCycle}
            onSuccess={() => {
              // Force refresh by changing state
              const temp = selectedCycle;
              setSelectedCycle('');
              setTimeout(() => setSelectedCycle(temp), 10);
            }}
          />
        </div>
      )}

      {/* Content Area - Will be filled with Annual/Monthly views */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        {viewType === 'annual' ? (
          <BudgetAnnualView 
            year={selectedYear} 
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate?.rate}
            applyDemoScale={applyDemoScale}
          />
        ) : (
          <BudgetMonthlyView 
            cycleName={selectedCycle}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate?.rate}
            applyDemoScale={applyDemoScale}
          />
        )}
      </div>
    </div>
  );
}
