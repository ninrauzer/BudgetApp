import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useBudgetComparison } from '@/lib/hooks/useApi';
import CategoryIcon from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BudgetComparisonSectionProps {
  cycleName: string;
}

export default function BudgetComparisonSection({ cycleName }: BudgetComparisonSectionProps) {
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

  // Calculate compliance stats
  const categoriesWithinBudget = categories.filter(c => c.variance >= 0).length;
  const totalCategories = categories.length;

  // Categories over 80% of budget
  const categoriesNearLimit = categories.filter(c => 
    c.compliance_percentage > 80 && c.compliance_percentage < 100
  );

  // Categories over budget
  const categoriesOverBudget = categories.filter(c => c.compliance_percentage > 100);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Compliance */}
        <div className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-success" />
            <span className={cn(
              "text-xl font-bold",
              summary.total_actual_income >= summary.total_budgeted_income ? "text-success" : "text-warning"
            )}>
              {summary.total_budgeted_income > 0 
                ? ((summary.total_actual_income / summary.total_budgeted_income) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary">Ingresos</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Presup:</span>
              <span className="font-bold text-text-primary">S/ {summary.total_budgeted_income.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Real:</span>
              <span className="font-bold text-success">S/ {summary.total_actual_income.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Expense Compliance */}
        <div className="bg-gradient-to-br from-error/10 to-error/5 border-2 border-error/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-6 h-6 text-error" />
            <span className={cn(
              "text-xl font-bold",
              summary.total_actual_expense <= summary.total_budgeted_expense ? "text-success" : "text-error"
            )}>
              {summary.total_budgeted_expense > 0 
                ? ((summary.total_actual_expense / summary.total_budgeted_expense) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary">Gastos</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Presup:</span>
              <span className="font-bold text-text-primary">S/ {summary.total_budgeted_expense.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Real:</span>
              <span className="font-bold text-error">S/ {summary.total_actual_expense.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Overall Compliance */}
        <div className={cn(
          "bg-gradient-to-br border-2 rounded-2xl p-4",
          summary.overall_compliance >= 80 
            ? "from-success/10 to-success/5 border-success/20"
            : summary.overall_compliance >= 60
            ? "from-warning/10 to-warning/5 border-warning/20"
            : "from-error/10 to-error/5 border-error/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            {summary.overall_compliance >= 80 ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertCircle className="w-6 h-6 text-warning" />
            )}
            <span className={cn(
              "text-xl font-bold",
              summary.overall_compliance >= 80 ? "text-success" :
              summary.overall_compliance >= 60 ? "text-warning" : "text-error"
            )}>
              {summary.overall_compliance.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary">Cumplimiento</p>
          <p className="text-xs text-text-muted mt-2">
            {categoriesWithinBudget} de {totalCategories} categorías OK
          </p>
        </div>

        {/* Saving Status */}
        <div className={cn(
          "bg-gradient-to-br border-2 rounded-2xl p-4",
          summary.total_actual_saving >= summary.total_budgeted_saving
            ? "from-primary/10 to-primary/5 border-primary/20"
            : "from-warning/10 to-warning/5 border-warning/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <DollarSign className={cn(
              "w-6 h-6",
              summary.total_actual_saving >= summary.total_budgeted_saving ? "text-primary" : "text-warning"
            )} />
            <span className={cn(
              "text-xl font-bold",
              summary.total_actual_saving >= summary.total_budgeted_saving ? "text-primary" : "text-warning"
            )}>
              {summary.total_budgeted_saving > 0 
                ? ((summary.total_actual_saving / summary.total_budgeted_saving) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary">Ahorro</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Presup:</span>
              <span className="font-bold text-text-primary">S/ {summary.total_budgeted_saving.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Real:</span>
              <span className={cn(
                "font-bold",
                summary.total_actual_saving >= summary.total_budgeted_saving ? "text-primary" : "text-warning"
              )}>
                S/ {summary.total_actual_saving.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(categoriesOverBudget.length > 0 || categoriesNearLimit.length > 0) && (
        <div className="space-y-3">
          {categoriesOverBudget.length > 0 && (
            <div className="bg-gradient-to-r from-error/10 to-red-50 border-2 border-error/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-error">
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
        {categories.filter(c => c.category_type === 'income').length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <h4 className="text-sm font-bold text-success">INGRESOS</h4>
            </div>
            {categories
              .filter(c => c.category_type === 'income')
              .map((category) => (
                <CategoryComparisonRow key={category.category_id} category={category} />
              ))}
          </div>
        )}

        {/* Expense Categories */}
        {categories.filter(c => c.category_type === 'expense').length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <TrendingDown className="w-4 h-4 text-error" />
              <h4 className="text-sm font-bold text-error">GASTOS</h4>
            </div>
            {categories
              .filter(c => c.category_type === 'expense')
              .map((category) => (
                <CategoryComparisonRow key={category.category_id} category={category} />
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
}

function CategoryComparisonRow({ category }: CategoryComparisonRowProps) {
  const isOverBudget = category.compliance_percentage > 100;
  const isNearLimit = category.compliance_percentage > 80 && category.compliance_percentage <= 100;
  const isIncome = category.category_type === 'income';

  return (
    <div className="bg-white border-2 border-border rounded-xl p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Category Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "p-2 rounded-xl",
            isIncome ? "bg-success/10" : "bg-error/10"
          )}>
            <CategoryIcon iconName={category.category_icon} className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-text-primary">{category.category_name}</h4>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <div>
                <span className="text-text-muted">Presup: </span>
                <span className="font-bold text-text-primary">S/ {category.budgeted.toFixed(0)}</span>
              </div>
              <div>
                <span className="text-text-muted">Real: </span>
                <span className={cn(
                  "font-bold",
                  isIncome 
                    ? (category.actual >= category.budgeted ? "text-success" : "text-warning")
                    : (category.actual <= category.budgeted ? "text-success" : "text-error")
                )}>
                  S/ {category.actual.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Dif: </span>
                <span className={cn(
                  "font-bold",
                  category.variance >= 0 ? "text-success" : "text-error"
                )}>
                  S/ {category.variance.toFixed(0)}
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
              isOverBudget ? "text-error" :
              isNearLimit ? "text-warning" : "text-success"
            )}>
              {category.compliance_percentage.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={Math.min(category.compliance_percentage, 100)} 
            className={cn(
              "h-2",
              isOverBudget ? "bg-error/20" :
              isNearLimit ? "bg-warning/20" : "bg-success/20"
            )}
          />
          {isOverBudget && (
            <p className="text-xs text-error font-bold mt-1">
              +{(category.compliance_percentage - 100).toFixed(0)}% sobre límite
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
