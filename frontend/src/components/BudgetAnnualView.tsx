import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAnnualBudgetGrid, useCategories, useUpdateBudgetCell } from '@/lib/hooks/useApi';
import CategoryIcon from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

interface BudgetAnnualViewProps {
  year: number;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function BudgetAnnualView({ year }: BudgetAnnualViewProps) {
  const { data: annualGrid, isLoading: gridLoading } = useAnnualBudgetGrid(year);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const updateCell = useUpdateBudgetCell();

  const [editingCell, setEditingCell] = useState<{ cycle: string; categoryId: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [localGrid, setLocalGrid] = useState<Record<string, Record<string, number>>>({});

  // Initialize local grid from API data
  useEffect(() => {
    if (annualGrid) {
      setLocalGrid(annualGrid);
    }
  }, [annualGrid]);

  // Active categories only
  const activeCategories = categories.filter(cat => cat.is_active);
  const incomeCategories = activeCategories.filter(cat => cat.type === 'income');
  const expenseCategories = activeCategories.filter(cat => cat.type === 'expense');

  // Handle cell edit
  const handleCellClick = (cycle: string, categoryId: number) => {
    const currentValue = localGrid[cycle]?.[categoryId] || 0;
    setEditingCell({ cycle, categoryId });
    setEditValue(currentValue.toString());
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const newValue = parseFloat(editValue) || 0;
    const currentValue = localGrid[editingCell.cycle]?.[editingCell.categoryId] || 0;

    // Only update if value changed
    if (newValue !== currentValue) {
      try {
        await updateCell.mutateAsync({
          cycleName: editingCell.cycle,
          categoryId: editingCell.categoryId,
          amount: newValue,
        });

        // Update local state
        setLocalGrid(prev => ({
          ...prev,
          [editingCell.cycle]: {
            ...prev[editingCell.cycle],
            [editingCell.categoryId]: newValue,
          },
        }));
      } catch (error) {
        console.error('Error updating budget cell:', error);
      }
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Calculate totals
  const getColumnTotal = (cycle: string, type: 'income' | 'expense') => {
    const categoryIds = type === 'income' 
      ? incomeCategories.map(c => c.id)
      : expenseCategories.map(c => c.id);
    
    return categoryIds.reduce((sum, catId) => {
      return sum + (localGrid[cycle]?.[catId] || 0);
    }, 0);
  };

  const getRowTotal = (categoryId: number) => {
    return MONTHS.reduce((sum, month) => {
      return sum + (localGrid[month]?.[categoryId] || 0);
    }, 0);
  };

  const getGrandTotal = (type: 'income' | 'expense') => {
    return MONTHS.reduce((sum, month) => {
      return sum + getColumnTotal(month, type);
    }, 0);
  };

  // Render category row
  const renderCategoryRow = (category: any) => {
    const rowTotal = getRowTotal(category.id);
    const avgMonthly = rowTotal / 12;

    return (
      <tr key={category.id} className="border-b border-border hover:bg-surface-hover transition-colors">
        {/* Category Name */}
        <td className="sticky left-0 z-10 bg-white border-r border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <CategoryIcon iconName={category.icon} className="w-5 h-5 text-text-secondary" />
            <span className="font-medium text-text-primary text-sm">{category.name}</span>
          </div>
        </td>

        {/* Monthly cells */}
        {MONTHS.map((month) => {
          const value = localGrid[month]?.[category.id] || 0;
          const isEditing = editingCell?.cycle === month && editingCell?.categoryId === category.id;

          return (
            <td
              key={month}
              className="border-r border-border px-2 py-2 text-center cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => !isEditing && handleCellClick(month, category.id)}
            >
              {isEditing ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleCellBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-2 py-1 text-sm text-center border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  value > 0 ? "text-text-primary" : "text-text-muted"
                )}>
                  {value > 0 ? value.toFixed(0) : '-'}
                </span>
              )}
            </td>
          );
        })}

        {/* Row Total */}
        <td className="sticky right-0 z-10 bg-gradient-to-l from-primary/10 to-transparent border-l-2 border-primary/30 px-4 py-3">
          <div className="text-right">
            <div className="font-bold text-text-primary text-sm">
              S/ {rowTotal.toFixed(0)}
            </div>
            <div className="text-xs text-text-muted">
              ~{avgMonthly.toFixed(0)}/mes
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Loading state
  if (gridLoading || categoriesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalIncome = getGrandTotal('income');
  const totalExpense = getGrandTotal('expense');
  const totalSaving = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Ingresos Anuales</p>
              <p className="text-2xl font-bold text-success mt-1">S/ {totalIncome.toFixed(0)}</p>
              <p className="text-xs text-text-muted mt-1">~S/ {(totalIncome / 12).toFixed(0)}/mes</p>
            </div>
            <div className="p-3 bg-success/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-error/10 to-error/5 border-2 border-error/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Gastos Anuales</p>
              <p className="text-2xl font-bold text-error mt-1">S/ {totalExpense.toFixed(0)}</p>
              <p className="text-xs text-text-muted mt-1">~S/ {(totalExpense / 12).toFixed(0)}/mes</p>
            </div>
            <div className="p-3 bg-error/20 rounded-xl">
              <TrendingDown className="w-6 h-6 text-error" />
            </div>
          </div>
        </div>

        <div className={cn(
          "bg-gradient-to-br border-2 rounded-2xl p-4",
          totalSaving >= 0 
            ? "from-primary/10 to-primary/5 border-primary/20" 
            : "from-warning/10 to-warning/5 border-warning/20"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Ahorro Planificado</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                totalSaving >= 0 ? "text-primary" : "text-warning"
              )}>
                S/ {totalSaving.toFixed(0)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {totalIncome > 0 ? `${((totalSaving / totalIncome) * 100).toFixed(1)}%` : '0%'} de ingresos
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-xl",
              totalSaving >= 0 ? "bg-primary/20" : "bg-warning/20"
            )}>
              <Calendar className={cn(
                "w-6 h-6",
                totalSaving >= 0 ? "text-primary" : "text-warning"
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white border-2 border-border rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-primary/10 to-info/10 sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 bg-gradient-to-r from-primary/10 to-info/10 border-r border-b-2 border-border px-4 py-3 text-left">
                  <span className="text-sm font-bold text-text-primary">Categoría</span>
                </th>
                {MONTHS.map((month) => (
                  <th key={month} className="border-r border-b-2 border-border px-2 py-3 text-center min-w-[100px]">
                    <span className="text-xs font-bold text-text-primary">{month}</span>
                  </th>
                ))}
                <th className="sticky right-0 z-30 bg-gradient-to-r from-primary/10 to-info/10 border-l-2 border-b-2 border-border px-4 py-3 text-right">
                  <span className="text-sm font-bold text-text-primary">Total Anual</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Income Section */}
              {incomeCategories.length > 0 && (
                <>
                  <tr className="bg-success/5">
                    <td colSpan={14} className="px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success">INGRESOS</span>
                      </div>
                    </td>
                  </tr>
                  {incomeCategories.map(renderCategoryRow)}
                  {/* Income Subtotal */}
                  <tr className="bg-success/10 font-bold border-t-2 border-success/30">
                    <td className="sticky left-0 z-10 bg-success/10 border-r border-border px-4 py-3">
                      <span className="text-sm text-success">Subtotal Ingresos</span>
                    </td>
                    {MONTHS.map((month) => (
                      <td key={month} className="border-r border-border px-2 py-3 text-center">
                        <span className="text-sm font-bold text-success">
                          {getColumnTotal(month, 'income').toFixed(0)}
                        </span>
                      </td>
                    ))}
                    <td className="sticky right-0 z-10 bg-success/10 border-l-2 border-success/30 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-success">
                        S/ {totalIncome.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                </>
              )}

              {/* Expense Section */}
              {expenseCategories.length > 0 && (
                <>
                  <tr className="bg-error/5">
                    <td colSpan={14} className="px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-error" />
                        <span className="text-sm font-bold text-error">GASTOS</span>
                      </div>
                    </td>
                  </tr>
                  {expenseCategories.map(renderCategoryRow)}
                  {/* Expense Subtotal */}
                  <tr className="bg-error/10 font-bold border-t-2 border-error/30">
                    <td className="sticky left-0 z-10 bg-error/10 border-r border-border px-4 py-3">
                      <span className="text-sm text-error">Subtotal Gastos</span>
                    </td>
                    {MONTHS.map((month) => (
                      <td key={month} className="border-r border-border px-2 py-3 text-center">
                        <span className="text-sm font-bold text-error">
                          {getColumnTotal(month, 'expense').toFixed(0)}
                        </span>
                      </td>
                    ))}
                    <td className="sticky right-0 z-10 bg-error/10 border-l-2 border-error/30 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-error">
                        S/ {totalExpense.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                </>
              )}

              {/* Net Saving Row */}
              <tr className={cn(
                "font-bold border-t-4",
                totalSaving >= 0 ? "bg-primary/10 border-primary/30" : "bg-warning/10 border-warning/30"
              )}>
                <td className={cn(
                  "sticky left-0 z-10 border-r border-border px-4 py-4",
                  totalSaving >= 0 ? "bg-primary/10" : "bg-warning/10"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    totalSaving >= 0 ? "text-primary" : "text-warning"
                  )}>
                    Ahorro Neto
                  </span>
                </td>
                {MONTHS.map((month) => {
                  const saving = getColumnTotal(month, 'income') - getColumnTotal(month, 'expense');
                  return (
                    <td key={month} className="border-r border-border px-2 py-4 text-center">
                      <span className={cn(
                        "text-sm font-bold",
                        saving >= 0 ? "text-primary" : "text-warning"
                      )}>
                        {saving.toFixed(0)}
                      </span>
                    </td>
                  );
                })}
                <td className={cn(
                  "sticky right-0 z-10 border-l-2 px-4 py-4 text-right",
                  totalSaving >= 0 ? "bg-primary/10 border-primary/30" : "bg-warning/10 border-warning/30"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    totalSaving >= 0 ? "text-primary" : "text-warning"
                  )}>
                    S/ {totalSaving.toFixed(0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-info/5 border border-info/20 rounded-xl p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-bold text-info">💡 Tip:</span> Haz clic en cualquier celda para editar el monto presupuestado. 
          Los cambios se guardan automáticamente al salir de la celda.
        </p>
      </div>
    </div>
  );
}
