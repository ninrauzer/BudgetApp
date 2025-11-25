// API Response Types
export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  account_id: number;
  notes?: string;
  currency?: 'PEN' | 'USD';
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  category_name: string;
  account_name: string;
  category_icon?: string;
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

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'saving';
  icon?: string;
  color?: string;
  expense_type?: 'fixed' | 'variable';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  available: {
    available_amount: number;
    monthly_income: number;
    fixed_expenses_budgeted: number;
    variable_expenses_spent: number;
    days_remaining: number;
    daily_limit: number;
    health_status: string;
    period_start: string;
    period_end: string;
  };
  projection: {
    projected_balance: number;
    is_positive: boolean;
    daily_average_spending: number;
    days_elapsed: number;
    days_remaining: number;
    message?: string;
  };
}

export interface TransactionCreate {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  account_id: number;
  notes?: string;
  currency?: 'PEN' | 'USD';
}
