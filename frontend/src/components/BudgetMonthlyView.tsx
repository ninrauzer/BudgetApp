import { useState, useEffect } from 'react';
import { Save, Loader2, TrendingUp, TrendingDown, Wallet, StickyNote } from 'lucide-react';
import { formatBudget } from '@/lib/format';
import { useBudgetPlansByCycle, useCategories, useSaveBulkBudget } from '@/lib/hooks/useApi';
import CategoryIcon from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

interface BudgetMonthlyViewProps {
  cycleName: string;
  displayCurrency?: 'PEN' | 'USD';
  exchangeRate?: number;
  applyDemoScale?: (amount: number) => number;
}

export default function BudgetMonthlyView({ cycleName, displayCurrency = 'PEN', exchangeRate, applyDemoScale = (amount) => amount }: BudgetMonthlyViewProps) {
  const { data: budgetPlans = [], isLoading: plansLoading } = useBudgetPlansByCycle(cycleName);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const saveBulk = useSaveBulkBudget();

  const [localBudgets, setLocalBudgets] = useState<Record<number, number>>({});
  const [localNotes, setLocalNotes] = useState<Record<number, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Convert amount based on display currency and demo mode
  const convertAmount = (amount: number) => {
    const demoAmount = applyDemoScale(amount);
    if (displayCurrency === 'USD' && exchangeRate) {
      return demoAmount / exchangeRate;
    }
    return demoAmount;
  };

  // Initialize local budgets from API data
  useEffect(() => {
    if (budgetPlans.length > 0) {
      const budgetMap: Record<number, number> = {};
      const notesMap: Record<number, string> = {};
      budgetPlans.forEach(plan => {
        budgetMap[plan.category_id] = plan.amount;
        if (plan.notes) {
          notesMap[plan.category_id] = plan.notes;
        }
      });
      setLocalBudgets(budgetMap);
      setLocalNotes(notesMap);
      setHasChanges(false);
    }
  }, [budgetPlans]);

  // Active categories only
  const activeCategories = categories.filter(cat => cat.is_active);
  const incomeCategories = activeCategories.filter(cat => cat.type === 'income');
  const expenseCategories = activeCategories.filter(cat => cat.type === 'expense');

  // Handle budget change
  const handleBudgetChange = (categoryId: number, value: string) => {
    const amount = parseFloat(value) || 0;
    setLocalBudgets(prev => ({
      ...prev,
      [categoryId]: amount,
    }));
    setHasChanges(true);
  };
  
  // Handle note change
  const handleNoteChange = (categoryId: number, value: string) => {
    setLocalNotes(prev => {
      if (value) {
        return { ...prev, [categoryId]: value };
      } else {
        // Remove note if empty
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
    });
    setHasChanges(true);
  };

  // Save all changes
  const handleSave = async () => {
    try {
      const budgets = Object.entries(localBudgets)
        .filter(([_, amount]) => amount > 0)
        .map(([categoryId, amount]) => ({
          category_id: parseInt(categoryId),
          amount,
          notes: localNotes[parseInt(categoryId)] || undefined,
        }));

      await saveBulk.mutateAsync({
        cycleName,
        budgets,
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  };

  // Calculate totals
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + (localBudgets[cat.id] || 0), 0);
  const totalExpense = expenseCategories.reduce((sum, cat) => sum + (localBudgets[cat.id] || 0), 0);
  const totalSaving = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? (totalSaving / totalIncome) * 100 : 0;

  // Render category row
  const renderCategoryRow = (category: any) => {
    const amount = localBudgets[category.id] || 0;
    const note = localNotes[category.id] || '';
    const isEditing = editingCategoryId === category.id;

    return (
      <div
        key={category.id}
        className="group flex flex-col gap-2 p-4 bg-white border-2 border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
      >
        {/* Category Info and Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "p-2.5 rounded-xl transition-colors",
              category.type === 'income' 
                ? "bg-success/10 group-hover:bg-success/20" 
                : "bg-error/10 group-hover:bg-error/20"
            )}>
              <CategoryIcon iconName={category.icon} className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-text-muted">{category.description}</p>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">
                PEN
              </span>
              <input
                type="number"
                value={amount > 0 ? amount : ''}
                onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                onFocus={() => setEditingCategoryId(category.id)}
                onBlur={() => setEditingCategoryId(null)}
                placeholder="0"
                className={cn(
                  "w-40 pl-10 pr-4 py-2.5 rounded-xl border-2 font-bold text-right transition-all",
                  isEditing 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                    : "border-border bg-white hover:border-primary/50",
                  amount > 0 ? "text-text-primary" : "text-text-muted"
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="flex items-center gap-2 pl-12">
          <StickyNote className="w-4 h-4 text-amber-600/70" />
          <input
            type="text"
            value={note}
            onChange={(e) => handleNoteChange(category.id, e.target.value)}
            placeholder="Agregar nota (opcional)..."
            className="flex-1 px-3 py-1.5 text-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
        </div>
      </div>
    );
  };

  // Loading state
  if (plansLoading || categoriesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards - Carousel on mobile, grid on desktop */}
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-4 pb-2 md:pb-0">
          {/* Ingresos */}
          <div className="flex-shrink-0 w-[280px] md:w-auto group relative rounded-2xl p-4 md:p-5 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Ingresos</p>
            <p className="text-2xl font-black text-white tracking-tight">{formatBudget(convertAmount(totalIncome), displayCurrency)}</p>
          </div>

          {/* Gastos */}
          <div className="flex-shrink-0 w-[280px] md:w-auto group relative rounded-2xl p-4 md:p-5 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-rose-400/90 to-rose-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <TrendingDown className="w-6 h-6 md:w-7 md:h-7 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Gastos</p>
            <p className="text-2xl font-black text-white tracking-tight">{formatBudget(convertAmount(totalExpense), displayCurrency)}</p>
          </div>

          {/* Ahorro - Principal con glow */}
          <div className={cn(
            "flex-shrink-0 w-[280px] md:w-auto group relative rounded-2xl p-4 md:p-5 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl",
            totalSaving >= 0 
              ? "bg-gradient-to-br from-amber-400/90 to-orange-500/90 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              : "bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          )}>
            <Wallet className="w-6 h-6 md:w-7 md:h-7 text-white/80 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Ahorro</p>
            <p className="text-2xl font-black text-white tracking-tight">
              {totalSaving >= 0 ? '' : '-'}{formatBudget(convertAmount(Math.abs(totalSaving)), displayCurrency)}
            </p>
          </div>

          {/* Tasa */}
          <div className="flex-shrink-0 w-[280px] md:w-auto group relative rounded-2xl p-4 md:p-5 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-blue-400/90 to-blue-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xl font-black text-white/80 mb-3">
              %
            </div>
            <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">Tasa Ahorro</p>
            <p className="text-2xl font-black text-white tracking-tight">{savingRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Save Button (sticky when changes) */}
      {hasChanges && (
        <div className="sticky top-4 z-20 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveBulk.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveBulk.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      )}

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <h2 className="text-lg font-bold text-success">INGRESOS</h2>
            <div className="flex-1 h-px bg-success/20"></div>
          </div>
          <div className="space-y-2">
            {incomeCategories.map(renderCategoryRow)}
          </div>
          <div className="flex items-center justify-between p-4 bg-success/5 border-2 border-success/20 rounded-xl">
            <span className="font-bold text-success">Subtotal Ingresos</span>
            <span className="text-xl font-bold text-success">{formatBudget(convertAmount(totalIncome), displayCurrency)}</span>
          </div>
        </div>
      )}

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <TrendingDown className="w-5 h-5 text-error" />
            <h2 className="text-lg font-bold text-error">GASTOS</h2>
            <div className="flex-1 h-px bg-error/20"></div>
          </div>
          <div className="space-y-2">
            {expenseCategories.map(renderCategoryRow)}
          </div>
          <div className="flex items-center justify-between p-4 bg-error/5 border-2 border-error/20 rounded-xl">
            <span className="font-bold text-error">Subtotal Gastos</span>
            <span className="text-xl font-bold text-error">{formatBudget(convertAmount(totalExpense), displayCurrency)}</span>
          </div>
        </div>
      )}

      {/* Net Saving Summary */}
      <div className={cn(
        "flex items-center justify-between p-6 border-2 rounded-2xl shadow-lg",
        totalSaving >= 0 
          ? "bg-gradient-to-r from-primary/10 to-info/10 border-primary/30" 
          : "bg-gradient-to-r from-warning/10 to-orange-50 border-warning/30"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-4 rounded-xl",
            totalSaving >= 0 ? "bg-primary/20" : "bg-warning/20"
          )}>
            <Wallet className={cn(
              "w-8 h-8",
              totalSaving >= 0 ? "text-primary" : "text-warning"
            )} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Ahorro Planificado</p>
            <p className={cn(
              "text-3xl font-bold",
              totalSaving >= 0 ? "text-primary" : "text-warning"
            )}>
              {formatBudget(convertAmount(totalSaving), displayCurrency)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {totalIncome > 0 ? `${savingRate.toFixed(1)}% de tus ingresos` : 'Define tus ingresos para calcular'}
            </p>
          </div>
        </div>
        {totalSaving < 0 && (
          <div className="px-4 py-2 bg-warning/20 border border-warning/30 rounded-lg">
            <p className="text-sm font-bold text-warning">⚠️ Presupuesto deficitario</p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-info/5 border border-info/20 rounded-xl p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-bold text-info">💡 Tip:</span> Ingresa los montos planificados para cada categoría. 
          Los cambios se habilitan para guardar automáticamente cuando editas cualquier monto.
        </p>
      </div>
    </div>
  );
}
