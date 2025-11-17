import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useBudgetComparison } from '@/lib/hooks/useApi';
import CategoryIcon from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BudgetComparisonSectionProps {
  cycleName: string;
  displayCurrency?: 'PEN' | 'USD';
}

export default function BudgetComparisonSection({ cycleName, displayCurrency = 'PEN' }: BudgetComparisonSectionProps) {
  const { data: comparison, isLoading } = useBudgetComparison(cycleName);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!comparison || comparison.categories.length === 0) {
    return (
      <div className="bg-gradient-to-br from-warning/10 to-orange-50 border-2 border-warning/30 rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-16 h-16 text-warning" />
          <div className="text-center">
            <h3 className="text-h3 font-bold text-text-primary mb-2">Sin Presupuesto Definido</h3>
            <p className="text-body text-text-secondary">
              Define tu presupuesto para el ciclo <span className="font-bold text-warning">{cycleName}</span> para ver la comparación con gastos reales.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { categories, summary } = comparison;

  // Filter out categories with zero budget and zero actual
  const categoriesWithValues = categories.filter(c => 
    c.budgeted > 0 || c.actual > 0
  );

  // Calculate compliance stats
  const categoriesWithinBudget = categoriesWithValues.filter(c => c.variance >= 0).length;
  const totalCategories = categoriesWithValues.length;

  // Categories over 80% of budget
  const categoriesNearLimit = categoriesWithValues.filter(c => 
    c.compliance_percentage > 80 && c.compliance_percentage < 100
  );

  // Categories over budget
  const categoriesOverBudget = categoriesWithValues.filter(c => c.compliance_percentage > 100);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Income Compliance */}
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 border-none text-white shadow-card">
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xl font-extrabold">
              {summary.total_budgeted_income > 0 
                ? ((summary.total_actual_income / summary.total_budgeted_income) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Ingresos</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Presup:</span>
              <span className="font-bold">{displayCurrency} {summary.total_budgeted_income.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Real:</span>
              <span className="font-bold">{displayCurrency} {summary.total_actual_income.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Expense Compliance */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white shadow-card">
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-6 h-6" />
            <span className="text-xl font-extrabold">
              {summary.total_budgeted_expense > 0 
                ? ((summary.total_actual_expense / summary.total_budgeted_expense) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Gastos</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Presup:</span>
              <span className="font-bold">{displayCurrency} {summary.total_budgeted_expense.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Real:</span>
              <span className="font-bold">{displayCurrency} {summary.total_actual_expense.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Overall Compliance */}
        <Card className={cn(
          "border-none text-white shadow-card bg-gradient-to-br",
          summary.overall_compliance >= 80 
            ? "from-green-500 to-green-600"
            : summary.overall_compliance >= 60
            ? "from-amber-400 to-amber-500"
            : "from-red-500 to-red-600"
        )}>
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            {summary.overall_compliance >= 80 ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <span className="text-xl font-extrabold">
              {summary.overall_compliance.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Cumplimiento</p>
          <p className="text-xs opacity-80 mt-2">{categoriesWithinBudget} de {totalCategories} categorías OK</p>
          </CardContent>
        </Card>

        {/* Saving Status */}
        <Card className={cn(
          "border-none text-white shadow-card bg-gradient-to-br",
          summary.total_actual_saving >= summary.total_budgeted_saving
            ? "from-blue-500 to-blue-600"
            : "from-amber-400 to-amber-500"
        )}>
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-6 h-6" />
            <span className="text-xl font-extrabold">
              {summary.total_budgeted_saving > 0 
                ? ((summary.total_actual_saving / summary.total_budgeted_saving) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Ahorro</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Presup:</span>
              <span className="font-bold">{displayCurrency} {summary.total_budgeted_saving.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Real:</span>
              <span className="font-bold">{displayCurrency} {summary.total_actual_saving.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(categoriesOverBudget.length > 0 || categoriesNearLimit.length > 0) && (
        <div className="space-y-3">
          {categoriesOverBudget.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-600">
                    ⚠️ {categoriesOverBudget.length} categoría{categoriesOverBudget.length > 1 ? 's' : ''} sobre presupuesto
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {categoriesOverBudget.map(c => c.category_name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {categoriesNearLimit.length > 0 && (
            <div className="bg-gradient-to-r from-warning/10 to-orange-50 border-2 border-warning/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-warning">
                    🔔 {categoriesNearLimit.length} categoría{categoriesNearLimit.length > 1 ? 's' : ''} cerca del límite (&gt;80%)
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {categoriesNearLimit.map(c => c.category_name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Details */}
      <div className="space-y-3">
        <h3 className="text-h3 font-bold text-text-primary">Detalle por Categoría</h3>
        
        {/* Income Categories */}
        {categoriesWithValues.filter(c => c.category_type === 'income').length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <h4 className="text-sm font-bold text-success">INGRESOS</h4>
            </div>
            {categoriesWithValues
              .filter(c => c.category_type === 'income')
              .sort((a, b) => b.actual - a.actual)
              .map((category, index) => (
                <CategoryComparisonRow key={`income-${category.category_id}-${index}`} category={category} displayCurrency={displayCurrency} />
              ))}
          </div>
        )}

        {/* Expense Categories */}
        {categoriesWithValues.filter(c => c.category_type === 'expense').length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <TrendingDown className="w-4 h-4 text-error" />
              <h4 className="text-sm font-bold text-error">GASTOS</h4>
            </div>
            {categoriesWithValues
              .filter(c => c.category_type === 'expense')
              .sort((a, b) => b.actual - a.actual)
              .map((category, index) => (
                <CategoryComparisonRow key={`expense-${category.category_id}-${index}`} category={category} displayCurrency={displayCurrency} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryComparisonRowProps {
  category: {
    category_id: number;
    category_name: string;
    category_icon?: string;
    category_type: string;
    budgeted: number;
    actual: number;
    variance: number;
    variance_percentage: number;
    compliance_percentage: number;
  };
  displayCurrency: 'PEN' | 'USD';
}

function CategoryComparisonRow({ category, displayCurrency }: CategoryComparisonRowProps) {
  const isOverBudget = category.compliance_percentage > 100;
  const isNearLimit = category.compliance_percentage > 80 && category.compliance_percentage <= 100;
  const isIncome = category.category_type === 'income';

  return (
    <Card className="bg-surface border-border rounded-3xl shadow-card hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Category Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "p-2 rounded-xl",
              isIncome ? "bg-success/10" : "bg-orange-100"
            )}>
              <CategoryIcon iconName={category.category_icon} className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-text-primary">{category.category_name}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <div>
                  <span className="text-text-muted">Presup: </span>
                  <span className="font-bold text-text-primary">{displayCurrency} {category.budgeted.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div>
                  <span className="text-text-muted">Real: </span>
                  <span className={cn(
                    "font-bold",
                    isIncome 
                      ? (category.actual >= category.budgeted ? "text-success" : "text-warning")
                      : "text-orange-600"
                  )}>
                    {displayCurrency} {category.actual.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Dif: </span>
                  <span className={cn(
                    "font-bold",
                    isIncome
                      ? (category.variance >= 0 ? "text-success" : "text-warning")
                      : (category.variance >= 0 ? "text-success" : "text-orange-700")
                  )}>
                    {displayCurrency} {Math.abs(category.variance).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Usado</span>
              <span className={cn(
                "text-sm font-bold",
                isIncome
                  ? (isOverBudget ? "text-error" : isNearLimit ? "text-warning" : "text-success")
                  : (isOverBudget ? "text-orange-700" : isNearLimit ? "text-orange-600" : "text-orange-500")
              )}>
                {category.compliance_percentage.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(category.compliance_percentage, 100)} 
              className={cn(
                "h-2",
                isIncome 
                  ? (isOverBudget ? "bg-red-100" : isNearLimit ? "bg-warning/20" : "bg-success/20")
                  : (isOverBudget ? "bg-orange-100" : isNearLimit ? "bg-orange-100" : "bg-orange-50")
              )}
              indicatorClassName={cn(
                isIncome 
                  ? (isOverBudget ? "bg-red-400" : isNearLimit ? "bg-warning" : "bg-success")
                  : (isOverBudget ? "bg-orange-600" : isNearLimit ? "bg-orange-500" : "bg-orange-400")
              )}
            />
            {isOverBudget && (
              <p className={cn(
                "text-xs font-bold mt-1",
                isIncome ? "text-error" : "text-orange-700"
              )}>
                +{(category.compliance_percentage - 100).toFixed(0)}% sobre límite
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
