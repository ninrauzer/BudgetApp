import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Calendar, Star, StickyNote, Wallet, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useAnnualBudgetGrid, useCategories, useUpdateBudgetCell, useCloneYear, useCurrentCycle } from '@/lib/hooks/useApi';
import CategoryIcon from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/toast/ToastContext';
import { formatBudget } from '@/lib/format';

interface BudgetAnnualViewProps {
  year: number;
  displayCurrency?: 'PEN' | 'USD';
  exchangeRate?: number;
  applyDemoScale?: (amount: number) => number;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function BudgetAnnualView({ year, displayCurrency = 'PEN', exchangeRate, applyDemoScale = (amount) => amount }: BudgetAnnualViewProps) {
  const { data: annualGrid, isLoading: gridLoading } = useAnnualBudgetGrid(year);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const updateCell = useUpdateBudgetCell();
  const cloneYear = useCloneYear();
  const { pushToast } = useToast();
  const { data: currentCycle } = useCurrentCycle();
  
  // Current cycle highlight - use actual billing cycle name from backend
  const currentMonthName = currentCycle?.cycle_name || MONTHS[new Date().getMonth()];
  
  // Collapsible summary cards state
  const [isCardsCollapsed, setIsCardsCollapsed] = useState(false);
  
  // Clone year dialog
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  // Convert amount based on display currency and demo mode
  const convertAmount = (amount: number) => {
    const demoAmount = applyDemoScale(amount);
    if (displayCurrency === 'USD' && exchangeRate) {
      return demoAmount / exchangeRate;
    }
    return demoAmount;
  };

  const [editingCell, setEditingCell] = useState<{ cycle: string; categoryId: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [localGrid, setLocalGrid] = useState<Record<string, Record<string, number>>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, Record<string, string>>>({});
  
  // Drag-to-fill states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ cycle: string; categoryId: number; value: number } | null>(null);
  const [dragRange, setDragRange] = useState<{ cycle: string; categoryId: number }[]>([]);

  // Initialize local grid from API data
  useEffect(() => {
    if (annualGrid) {
      setLocalGrid(annualGrid.amounts);
      setLocalNotes(annualGrid.notes);
    }
  }, [annualGrid]);

  // Global mouseup listener for drag-to-fill
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, dragRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Active categories only
  const activeCategories = categories.filter(cat => cat.is_active);
  const incomeCategories = activeCategories.filter(cat => cat.type === 'income');
  const expenseCategories = activeCategories.filter(cat => cat.type === 'expense');
  
  // Separate fixed and variable expenses
  // Split expense categories by expense_type.
  // After migration existing categories may have expense_type = undefined/null.
  // We show those in a separate "Sin Tipo" section to avoid hiding them.
  const fixedExpenseCategories = expenseCategories.filter(cat => cat.expense_type === 'fixed');
  const variableExpenseCategories = expenseCategories.filter(cat => cat.expense_type === 'variable');
  const unspecifiedExpenseCategories = expenseCategories.filter(cat => !cat.expense_type);

  // Handle cell edit
  const handleCellClick = (cycle: string, categoryId: number) => {
    const currentValue = localGrid[cycle]?.[categoryId] || 0;
    const currentNote = localNotes[cycle]?.[categoryId] || '';
    setEditingCell({ cycle, categoryId });
    setEditValue(currentValue.toString());
    setEditNote(currentNote);
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const newValue = parseFloat(editValue) || 0;
    const currentValue = localGrid[editingCell.cycle]?.[editingCell.categoryId] || 0;
    const currentNote = localNotes[editingCell.cycle]?.[editingCell.categoryId] || '';

    // Only update if value or note changed
    if (newValue !== currentValue || editNote !== currentNote) {
      try {
        await updateCell.mutateAsync({
          cycleName: editingCell.cycle,
          categoryId: editingCell.categoryId,
          amount: newValue,
          notes: editNote || undefined, // Send undefined if empty to clear note
        });

        // Update local state
        setLocalGrid(prev => ({
          ...prev,
          [editingCell.cycle]: {
            ...prev[editingCell.cycle],
            [editingCell.categoryId]: newValue,
          },
        }));
        
        setLocalNotes(prev => {
          const updated = { ...prev };
          if (editNote) {
            updated[editingCell.cycle] = {
              ...updated[editingCell.cycle],
              [editingCell.categoryId]: editNote,
            };
          } else {
            // Remove note if empty
            if (updated[editingCell.cycle]) {
              const { [editingCell.categoryId]: _, ...rest } = updated[editingCell.cycle];
              updated[editingCell.cycle] = rest;
            }
          }
          return updated;
        });

        pushToast({
          title: 'Presupuesto actualizado',
          message: `${editingCell.cycle}: ${newValue.toLocaleString('es-PE')} ${displayCurrency}`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error updating budget cell:', error);
        pushToast({
          title: 'Error al guardar',
          message: 'No se pudo actualizar el presupuesto. Intenta nuevamente.',
          type: 'error'
        });
      }
    }

    setEditingCell(null);
    setEditValue('');
    setEditNote('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
      setEditNote('');
    }
  };

  // Drag-to-fill handlers
  const handleDragStart = (cycle: string, categoryId: number, value: number) => {
    setIsDragging(true);
    setDragStart({ cycle, categoryId, value });
    setDragRange([{ cycle, categoryId }]);
  };

  const handleDragEnter = (cycle: string, categoryId: number) => {
    if (!isDragging || !dragStart) return;
    
    // Only allow dragging within same category (same row)
    if (categoryId !== dragStart.categoryId) return;

    const startIndex = MONTHS.indexOf(dragStart.cycle);
    const currentIndex = MONTHS.indexOf(cycle);
    
    if (startIndex === -1 || currentIndex === -1) return;

    // Build range from start to current
    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);
    
    const range = MONTHS.slice(minIndex, maxIndex + 1).map(month => ({
      cycle: month,
      categoryId
    }));
    
    setDragRange(range);
  };

  const handleDragEnd = async () => {
    if (!isDragging || !dragStart || dragRange.length <= 1) {
      setIsDragging(false);
      setDragStart(null);
      setDragRange([]);
      return;
    }

    // Apply value to all cells in range
    const updates: Promise<any>[] = [];
    const newGridState = { ...localGrid };

    for (const cell of dragRange) {
      if (cell.cycle === dragStart.cycle && cell.categoryId === dragStart.categoryId) {
        continue; // Skip source cell
      }

      updates.push(
        updateCell.mutateAsync({
          cycleName: cell.cycle,
          categoryId: cell.categoryId,
          amount: dragStart.value,
        })
      );

      // Update local state
      if (!newGridState[cell.cycle]) {
        newGridState[cell.cycle] = {};
      }
      newGridState[cell.cycle][cell.categoryId] = dragStart.value;
    }

    try {
      await Promise.all(updates);
      setLocalGrid(newGridState);
      
      pushToast({
        title: 'Celdas actualizadas',
        message: `${dragRange.length} celda${dragRange.length > 1 ? 's' : ''} copiada${dragRange.length > 1 ? 's' : ''} con valor ${dragStart.value.toLocaleString('es-PE')}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error during drag fill:', error);
      pushToast({
        title: 'Error al copiar',
        message: 'Algunas celdas no se pudieron actualizar.',
        type: 'error'
      });
    }

    setIsDragging(false);
    setDragStart(null);
    setDragRange([]);
  };

  // Handle clone year
  const handleCloneYear = async (targetYear: number, overwrite: boolean) => {
    try {
      const result = await cloneYear.mutateAsync({
        sourceYear: year,
        targetYear,
        overwrite
      });
      
      pushToast({
        title: 'Año clonado exitosamente',
        message: `Se ${result.created ? `crearon ${result.created}` : ''} ${result.updated ? `y actualizaron ${result.updated}` : ''} presupuestos en ${targetYear}`,
        type: 'success'
      });
      setShowCloneDialog(false);
    } catch (error) {
      console.error('Error cloning year:', error);
      pushToast({
        title: 'Error al clonar',
        message: 'No se pudo clonar el año. Intenta nuevamente.',
        type: 'error'
      });
    }
  };

  // Calculate totals
  const getColumnTotal = (cycle: string, type: 'income' | 'expense') => {
    const categoryIds = type === 'income' 
      ? incomeCategories.map(c => c.id)
      : expenseCategories.map(c => c.id);
    
    return categoryIds.reduce((sum, catId) => {
      const value = localGrid[cycle]?.[catId] || 0;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const getRowTotal = (categoryId: number) => {
    return MONTHS.reduce((sum, month) => {
      const value = localGrid[month]?.[categoryId] || 0;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const getGrandTotal = (type: 'income' | 'expense') => {
    const total = MONTHS.reduce((sum, month) => {
      const colTotal = getColumnTotal(month, type);
      return sum + (typeof colTotal === 'number' ? colTotal : 0);
    }, 0);
    return typeof total === 'number' ? total : 0;
  };

  // Render category row
  const renderCategoryRow = (category: any) => {
    const rowTotal = getRowTotal(category.id);
    const avgMonthly = rowTotal / 12;
    
    // Determine color based on category type
    const isIncome = category.type === 'income';
    const iconColor = isIncome ? 'text-emerald-600' : 'text-rose-600';
    const textColor = isIncome ? 'text-emerald-700' : 'text-rose-700';
    const hoverBg = isIncome ? 'group-hover/row:bg-emerald-50' : 'group-hover/row:bg-rose-50';

    return (
      <tr key={category.id} className="group/row border-b border-border transition-colors">
        {/* Category Name */}
        <td className={cn(
          "sticky left-0 z-10 bg-white border-r border-border px-4 py-3 transition-colors",
          hoverBg
        )}>
          <div className="flex items-center gap-2">
            <CategoryIcon iconName={category.icon} className={cn("w-5 h-5", iconColor)} />
            <span className={cn("font-medium text-sm", textColor)}>
              {category.name}
            </span>
          </div>
        </td>

        {/* Monthly cells */}
        {MONTHS.map((month) => {
          const value = localGrid[month]?.[category.id] || 0;
          const note = localNotes[month]?.[category.id] || '';
          const isEditing = editingCell?.cycle === month && editingCell?.categoryId === category.id;
          const isInDragRange = dragRange.some(cell => cell.cycle === month && cell.categoryId === category.id);
          const isDragSource = dragStart?.cycle === month && dragStart?.categoryId === category.id;
          const isCurrent = month === currentMonthName;

          return (
            <td
              key={month}
              className={cn(
                "border-r border-border px-2 py-2 text-center cursor-pointer transition-colors relative group",
                isInDragRange && "bg-primary/20 border-primary",
                isDragSource && "bg-primary/30",
                isCurrent && "bg-warning/5 border-l-4 border-warning/50",
                !isEditing && !isInDragRange && !isDragSource && "group-hover/row:bg-blue-50"
              )}
              onClick={() => !isEditing && !isDragging && handleCellClick(month, category.id)}
              onMouseEnter={() => handleDragEnter(month, category.id)}
            >
              {isEditing ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="0"
                    className="w-full px-2 py-1 text-sm text-center border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Nota..."
                    className="w-full px-2 py-0.5 text-xs text-left border border-border/50 rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-center gap-1">
                    <span className={cn(
                      "text-sm font-medium",
                      value > 0 ? "text-text-primary" : "text-text-muted"
                    )}>
                      {value > 0 ? value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}
                    </span>
                    {note && (
                      <div className="group/note relative inline-block">
                        <StickyNote className="w-3.5 h-3.5 text-amber-600/70" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap max-w-xs">
                          {note}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Drag handle - grip dots indicator */}
                  {value > 0 && !isEditing && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end"
                      style={{ cursor: 'crosshair' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleDragStart(month, category.id, value);
                      }}
                      onMouseUp={handleDragEnd}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" className="text-primary">
                        <circle cx="3" cy="9" r="1.2" fill="currentColor" />
                        <circle cx="9" cy="9" r="1.2" fill="currentColor" />
                        <circle cx="9" cy="3" r="1.2" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </td>
          );
        })}

        {/* Row Total */}
        <td className="sticky right-0 z-10 bg-gradient-to-l from-primary/10 to-transparent group-hover/row:from-blue-50 group-hover/row:to-blue-50 border-l-2 border-primary/30 px-4 py-3 transition-colors">
          <div className="text-right">
            <div className="font-bold text-text-primary text-sm">
              {formatBudget(convertAmount(rowTotal), displayCurrency)}
            </div>
            <div className="text-xs text-text-muted">
              ~{formatBudget(convertAmount(avgMonthly), displayCurrency).replace(` ${displayCurrency}`, '')}/mes
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
  const savingRate = totalIncome > 0 ? ((totalSaving / totalIncome) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Collapsible Summary Cards - Glass Premium */}
      <div className="bg-white/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsCardsCollapsed(!isCardsCollapsed)}
            className="flex-1 flex items-center justify-start gap-3 hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              {isCardsCollapsed ? (
                <ChevronDown className="w-5 h-5 text-primary" strokeWidth={2.5} />
              ) : (
                <ChevronUp className="w-5 h-5 text-primary" strokeWidth={2.5} />
              )}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-text-primary">Resumen Anual {year}</h3>
              <p className="text-xs text-text-secondary">
                {isCardsCollapsed ? 'Mostrar detalles' : 'Ocultar detalles'}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-6 text-sm font-bold">
            <span className="text-emerald-600">↑ {formatBudget(convertAmount(totalIncome || 0), displayCurrency)}</span>
            <span className="text-rose-600">↓ {formatBudget(convertAmount(totalExpense || 0), displayCurrency)}</span>
            <span className={cn(
              "px-3 py-1 rounded-lg",
              totalSaving >= 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            )}>
              {totalSaving >= 0 ? '' : '-'}{formatBudget(convertAmount(Math.abs(totalSaving || 0)), displayCurrency)}
            </span>
            <button
              onClick={() => setShowCloneDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:shadow-lg hover:scale-105 transition-all"
              title="Clonar presupuestos al año siguiente"
            >
              <Copy className="w-4 h-4" />
              Clonar año
            </button>
          </div>
        </div>
        
        {!isCardsCollapsed && (
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ingresos */}
              <div className="group relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-white/80" strokeWidth={2} />
                </div>
                <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">Ingresos Anuales</p>
                <p className="text-3xl font-black text-white tracking-tight mb-1">
                  {formatBudget(convertAmount(totalIncome || 0), displayCurrency)}
                </p>
                <p className="text-white/60 text-xs">~{formatBudget(convertAmount(totalIncome || 0) / 12, displayCurrency).replace(` ${displayCurrency}`, '')}/mes</p>
              </div>

              {/* Gastos */}
              <div className="group relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md bg-gradient-to-br from-rose-400/90 to-rose-500/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <TrendingDown className="w-8 h-8 text-white/80" strokeWidth={2} />
                </div>
                <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">Gastos Anuales</p>
                <p className="text-3xl font-black text-white tracking-tight mb-1">
                  {formatBudget(convertAmount(totalExpense || 0), displayCurrency)}
                </p>
                <p className="text-white/60 text-xs">~{formatBudget(convertAmount(totalExpense || 0) / 12, displayCurrency).replace(` ${displayCurrency}`, '')}/mes</p>
              </div>

              {/* Saldo - Principal con glow */}
              <div className={cn(
                "group relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl",
                totalSaving >= 0 
                  ? "bg-gradient-to-br from-amber-400/90 to-orange-500/90 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                  : "bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <Wallet className="w-8 h-8 text-white/80" strokeWidth={2} />
                </div>
                <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">Saldo Anual</p>
                <p className="text-3xl font-black text-white tracking-tight mb-1">
                  {totalSaving >= 0 ? '' : '-'}{formatBudget(convertAmount(Math.abs(totalSaving || 0)), displayCurrency)}
                </p>
                <p className="text-white/60 text-xs">Tasa: {(savingRate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Table */}
      <div className="bg-white border-2 border-border rounded-2xl overflow-hidden shadow-md">
        <div className={cn(
          "overflow-auto transition-all duration-300",
          isCardsCollapsed ? "max-h-[calc(100vh-160px)]" : "max-h-[calc(100vh-200px)]"
        )}>
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-primary/10 to-info/10">
              <tr>
                <th className="sticky left-0 top-0 z-40 bg-white border-r border-b-2 border-border px-4 py-3 text-left shadow-md">
                  <span className="text-sm font-bold text-text-primary">Categoría</span>
                </th>
                {MONTHS.map((month) => {
                  const isCurrent = month === currentMonthName;
                  return (
                    <th
                      key={month}
                      className={cn(
                        "sticky top-0 z-30 border-r border-b-2 border-border px-2 py-3 text-center min-w-[100px] shadow-md",
                        isCurrent ? "bg-amber-100" : "bg-gray-50",
                        isCurrent && "border-l-4 border-warning/50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-text-primary">{month}</span>
                        {isCurrent && (
                          <Star className="w-3 h-3 text-warning fill-warning" strokeWidth={2.5} aria-label="Mes actual" />
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="sticky right-0 top-0 z-40 bg-white border-l-2 border-b-2 border-border px-4 py-3 text-right shadow-md">
                  <span className="text-sm font-bold text-text-primary">Total Anual</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Saldo Row (Balance) - First row after header */}
              <tr className={cn(
                "font-bold border-b-2"
              )}>
                <td className={cn(
                  "sticky left-0 z-30 border-r border-border px-4 py-4 shadow-md",
                  totalSaving >= 0 ? "bg-blue-100" : "bg-red-100"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    totalSaving >= 0 ? "text-primary" : "text-warning"
                  )}>
                    Saldo
                  </span>
                </td>
                {MONTHS.map((month) => {
                  const balance = getColumnTotal(month, 'income') - getColumnTotal(month, 'expense');
                  const isCurrent = month === currentMonthName;
                  return (
                    <td
                      key={month}
                      className={cn(
                        "border-r border-border px-2 py-4 text-center shadow-md",
                        totalSaving >= 0 ? "bg-blue-100" : "bg-red-100",
                        isCurrent && "border-l-4 border-warning/50"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold",
                        balance >= 0 ? "text-primary" : "text-warning"
                      )}>
                        {balance.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </td>
                  );
                })}
                <td className={cn(
                  "sticky right-0 z-30 border-l-2 px-4 py-4 text-right shadow-md",
                  totalSaving >= 0 ? "bg-blue-100" : "bg-red-100"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    totalSaving >= 0 ? "text-primary" : "text-warning"
                  )}>
                    {formatBudget(convertAmount(totalSaving), displayCurrency)}
                  </span>
                </td>
              </tr>

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
                    {MONTHS.map((month) => {
                      const isCurrent = month === currentMonthName;
                      return (
                        <td
                          key={month}
                          className={cn(
                            "border-r border-border px-2 py-3 text-center",
                            isCurrent && "bg-warning/5 border-l-4 border-warning/50"
                          )}
                        >
                          <span className="text-sm font-bold text-success">
                            {getColumnTotal(month, 'income').toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-success/10 border-l-2 border-success/30 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-success">
                        {formatBudget(convertAmount(totalIncome), displayCurrency)}
                      </span>
                    </td>
                  </tr>
                </>
              )}

              {/* Fixed Expenses Section */}
              {fixedExpenseCategories.length > 0 && (
                <>
                  <tr className="bg-rose-50">
                    <td colSpan={14} className="px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span className="text-sm font-bold text-rose-700">GASTOS FIJOS</span>
                        <span className="text-xs text-rose-500">(Recurrentes mensuales)</span>
                      </div>
                    </td>
                  </tr>
                  {fixedExpenseCategories.map(renderCategoryRow)}
                  {/* Fixed Expense Subtotal */}
                  <tr className="bg-rose-100 font-bold border-t-2 border-rose-300">
                    <td className="sticky left-0 z-10 bg-rose-100 border-r border-border px-4 py-3">
                      <span className="text-sm text-rose-700">Subtotal Gastos Fijos</span>
                    </td>
                    {MONTHS.map((month) => {
                      const isCurrent = month === currentMonthName;
                      const fixedTotal = fixedExpenseCategories.reduce((sum, cat) => {
                        const value = localGrid[month]?.[cat.id] || 0;
                        return sum + value;
                      }, 0);
                      return (
                        <td
                          key={month}
                          className={cn(
                            "border-r border-border px-2 py-3 text-center",
                            isCurrent && "bg-warning/5 border-l-4 border-warning/50"
                          )}
                        >
                          <span className="text-sm font-bold text-rose-700">
                            {fixedTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-rose-100 border-l-2 border-rose-300 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-rose-700">
                        {formatBudget(convertAmount(
                          fixedExpenseCategories.reduce((sum, cat) => {
                            const catTotal = MONTHS.reduce((monthSum, month) => {
                              return monthSum + (localGrid[month]?.[cat.id] || 0);
                            }, 0);
                            return sum + catTotal;
                          }, 0)
                        ), displayCurrency)}
                      </span>
                    </td>
                  </tr>
                </>
              )}
              {/* Unspecified Expenses Section (categories without expense_type yet) */}
              {unspecifiedExpenseCategories.length > 0 && (
                <>
                  <tr className="bg-slate-50">
                    <td colSpan={14} className="px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-700">GASTOS SIN TIPO</span>
                        <span className="text-xs text-slate-500">(Asigna fijo o variable en Categorías)</span>
                      </div>
                    </td>
                  </tr>
                  {unspecifiedExpenseCategories.map(renderCategoryRow)}
                  {/* Unspecified Expense Subtotal */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="sticky left-0 z-10 bg-slate-100 border-r border-border px-4 py-3">
                      <span className="text-sm text-slate-700">Subtotal Gastos Sin Tipo</span>
                    </td>
                    {MONTHS.map((month) => {
                      const isCurrent = month === currentMonthName;
                      const unspecifiedTotal = unspecifiedExpenseCategories.reduce((sum, cat) => {
                        const value = localGrid[month]?.[cat.id] || 0;
                        return sum + value;
                      }, 0);
                      return (
                        <td
                          key={month}
                          className={cn(
                            "border-r border-border px-2 py-3 text-center",
                            isCurrent && "bg-warning/5 border-l-4 border-warning/50"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {unspecifiedTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-slate-100 border-l-2 border-slate-300 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-700">
                        {formatBudget(convertAmount(
                          unspecifiedExpenseCategories.reduce((sum, cat) => {
                            const catTotal = MONTHS.reduce((monthSum, month) => {
                              return monthSum + (localGrid[month]?.[cat.id] || 0);
                            }, 0);
                            return sum + catTotal;
                          }, 0)
                        ), displayCurrency)}
                      </span>
                    </td>
                  </tr>
                </>
              )}
              
              {/* Variable Expenses Section */}
              {variableExpenseCategories.length > 0 && (
                <>
                  <tr className="bg-pink-50">
                    <td colSpan={14} className="px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-bold text-pink-700">GASTOS VARIABLES</span>
                        <span className="text-xs text-pink-500">(Ocasionales o controlables)</span>
                      </div>
                    </td>
                  </tr>
                  {variableExpenseCategories.map(renderCategoryRow)}
                  {/* Variable Expense Subtotal */}
                  <tr className="bg-pink-100 font-bold border-t-2 border-pink-300">
                    <td className="sticky left-0 z-10 bg-pink-100 border-r border-border px-4 py-3">
                      <span className="text-sm text-pink-700">Subtotal Gastos Variables</span>
                    </td>
                    {MONTHS.map((month) => {
                      const isCurrent = month === currentMonthName;
                      const variableTotal = variableExpenseCategories.reduce((sum, cat) => {
                        const value = localGrid[month]?.[cat.id] || 0;
                        return sum + value;
                      }, 0);
                      return (
                        <td
                          key={month}
                          className={cn(
                            "border-r border-border px-2 py-3 text-center",
                            isCurrent && "bg-warning/5 border-l-4 border-warning/50"
                          )}
                        >
                          <span className="text-sm font-bold text-pink-700">
                            {variableTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-pink-100 border-l-2 border-pink-300 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-pink-700">
                        {formatBudget(convertAmount(
                          variableExpenseCategories.reduce((sum, cat) => {
                            const catTotal = MONTHS.reduce((monthSum, month) => {
                              return monthSum + (localGrid[month]?.[cat.id] || 0);
                            }, 0);
                            return sum + catTotal;
                          }, 0)
                        ), displayCurrency)}
                      </span>
                    </td>
                  </tr>
                </>
              )}
              
              {/* Total Expenses Row */}
              {expenseCategories.length > 0 && (
                <tr className="bg-rose-50/50 font-bold border-t-2 border-rose-400">
                  <td className="sticky left-0 z-10 bg-rose-50/50 border-r border-border px-4 py-3">
                    <span className="text-sm text-rose-700 font-extrabold">TOTAL GASTOS</span>
                    </td>
                    {MONTHS.map((month) => {
                      const isCurrent = month === currentMonthName;
                      return (
                        <td
                          key={month}
                          className={cn(
                            "border-r border-border px-2 py-3 text-center",
                            isCurrent && "bg-warning/5 ring-1 ring-warning/30 border-l-4 border-warning/50"
                          )}
                        >
                          <span className="text-sm font-bold text-rose-700">
                            {getColumnTotal(month, 'expense').toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-rose-50/50 border-l-2 border-rose-400 px-4 py-3 text-right">
                      <span className="text-sm font-bold text-rose-700">
                        {formatBudget(convertAmount(totalExpense), displayCurrency)}
                      </span>
                    </td>
                  </tr>
              )}
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

      {/* Clone Year Dialog */}
      {showCloneDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Copy className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Clonar presupuestos</h3>
                <p className="text-xs text-text-secondary">Copiar todos los presupuestos de {year}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Se copiarán todos los presupuestos de <strong>{year}</strong> a <strong>{year + 1}</strong>.
                Esto incluye todos los meses y categorías.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> Si ya existen presupuestos en {year + 1}, se mantendrán sin cambios.
                  Solo se crearán los que no existan.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCloneDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-border text-text-secondary font-bold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleCloneYear(year + 1, false)}
                disabled={cloneYear.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cloneYear.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clonando...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Clonar a {year + 1}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
