// API Response Types
export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  account_id: number;
  budget_plan_id?: number;
  loan_id?: number;
  notes?: string;
  currency?: 'PEN' | 'USD';
  exchange_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  category_name: string;
  account_name: string;
  category_type?: string;
  category_icon?: string;
  category_expense_type?: 'fixed' | 'variable';
}

export interface Account {
  id: number;
  name: string;
  type: string;
  icon?: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Transfers
export interface TransferCreate {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface TransferResponse {
  transfer_id: string;
  from_transaction_id: number;
  to_transaction_id: number;
  from_account_name: string;
  to_account_name: string;
  amount: number;
  date: string;
  description?: string;
}

export interface TransferDetail {
  transfer_id: string;
  from_account: { id: number; name: string; currency: string };
  to_account: { id: number; name: string; currency: string };
  amount: number;
  date: string;
  description?: string;
  withdrawal_transaction: { id: number; amount: number; date: string };
  deposit_transaction: { id: number; amount: number; date: string };
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'saving';
  icon?: string;
  color?: string;
  expense_type?: 'fixed' | 'variable';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetCopyResult {
  success: boolean;
  copied?: number;
  skipped?: number;
  created?: number;
  updated?: number;
  source_year?: number;
  target_year?: number;
}

export interface QuickTemplate {
  id: number;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name?: string;
  category_icon?: string;
}

export interface BudgetPlan {
  id: number;
  cycle_name: string;
  start_date: string;
  end_date: string;
  category_id: number;
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Campos agregados por el backend
  category_name?: string;
  category_icon?: string;
  category_type?: string;
}

export interface BudgetCellUpdate {
  cycle_name: string;
  category_id: number;
  amount: number;
  notes?: string;
}

export interface BulkBudgetUpdate {
  cycle_name: string;
  budgets: Array<{
    category_id: number;
    amount: number;
    notes?: string;
  }>;
}

export interface CopyCycleRequest {
  source_cycle: string;
  target_cycles: string[];
}

export interface CopyCategoryRequest {
  category_id: number;
  source_cycle: string;
  target_cycles: string[];
}

export interface BudgetComparison {
  cycle_name: string;
  start_date: string;
  end_date: string;
  categories: Array<{
    category_id: number;
    category_name: string;
    category_icon?: string;
    category_type: string;
    budgeted: number;
    actual: number;
    variance: number;
    variance_percentage: number;
    compliance_percentage: number;
  }>;
  summary: {
    total_budgeted_income: number;
    total_actual_income: number;
    total_budgeted_expense: number;
    total_actual_expense: number;
    total_budgeted_saving: number;
    total_actual_saving: number;
    overall_compliance: number;
  };
}

export interface AnnualBudgetGrid {
  amounts: {
    [cycleName: string]: {
      [categoryId: string]: number;
    };
  };
  notes: {
    [cycleName: string]: {
      [categoryId: string]: string;
    };
  };
}

export interface BudgetLimit {
  id: number;
  budget_plan_id: number;
  category_id: number;
  limit_amount: number;
  spent_amount?: number;
  category_name?: string;
  percentage?: number;
}

export interface DashboardStats {
  total_income_planned: number;
  total_income_actual: number;
  total_expense_planned: number;
  total_expense_actual: number;
  total_saving_planned: number;
  balance_planned: number;
  balance_actual: number;
  variance: number;
  variance_percentage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Query Parameters
export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  account_id?: number;
  type?: 'income' | 'expense';
  search?: string;
  skip?: number;
  limit?: number;
}

export interface BudgetFilters {
  budget_plan_id?: number;
  category_id?: number;
}

export interface BillingCycle {
  id: number;
  name: string;
  start_day: number;
  next_override_date?: string | null;  // Manual override for next cycle start date
  is_active: boolean;
}

export interface CurrentCycleInfo {
  cycle_name: string;       // e.g., "Enero"
  start_date: string;       // e.g., "2024-12-23"
  end_date: string;         // e.g., "2025-01-22"
  start_day: number;        // e.g., 23
  next_override_date?: string | null;  // Manual override if exists
}

// Analysis Types
export interface CategoryAnalysis {
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_type: string;
  total: number;
  count: number;
}

export interface TrendData {
  cycle_name: string;
  start_date: string;
  end_date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface LargestExpense {
  description: string;
  amount: number;
  category: string;
}

export interface AnalysisSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  avg_transaction: number;
  avg_daily_expense: number;
  largest_expense: LargestExpense | null;
}
