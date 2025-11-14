import { apiClient } from './client';
import type {
  Transaction,
  TransactionWithDetails,
  Account,
  Category,
  BudgetPlan,
  BudgetComparison,
  AnnualBudgetGrid,
  DashboardStats,
  PaginatedResponse,
  TransactionFilters,
  QuickTemplate,
  BillingCycle,
  CurrentCycleInfo,
  CategoryAnalysis,
  TrendData,
  AnalysisSummary,
} from './types';

// Dashboard
export const dashboardApi = {
  getStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const url = `/api/dashboard/summary${queryString ? '?' + queryString : ''}`;
    
    const { data } = await apiClient.get<DashboardStats>(url);
    return data;
  },
};

// Transactions
export const transactionsApi = {
  getAll: async (filters?: TransactionFilters): Promise<PaginatedResponse<TransactionWithDetails>> => {
    const { data } = await apiClient.get<TransactionWithDetails[]>('/api/transactions', {
      params: filters,
    });
    // El backend no devuelve paginación, así que lo simulamos
    return {
      items: data,
      total: data.length,
      page: 1,
      size: data.length,
      pages: 1,
    };
  },

  getById: async (id: number): Promise<TransactionWithDetails> => {
    const { data } = await apiClient.get<TransactionWithDetails>(`/api/transactions/${id}`);
    return data;
  },

  create: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>('/api/transactions', transaction);
    return data;
  },

  update: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
    const { data } = await apiClient.put<Transaction>(`/api/transactions/${id}`, transaction);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/transactions/${id}`);
  },

  getRecent: async (limit: number = 10): Promise<TransactionWithDetails[]> => {
    const { data } = await apiClient.get<TransactionWithDetails[]>('/api/transactions', {
      params: { limit },
    });
    return data;
  },
};

// Accounts
export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const { data } = await apiClient.get<Account[]>('/api/accounts');
    return data;
  },

  getById: async (id: number): Promise<Account> => {
    const { data } = await apiClient.get<Account>(`/api/accounts/${id}`);
    return data;
  },

  create: async (account: Partial<Account>): Promise<Account> => {
    const { data } = await apiClient.post<Account>('/api/accounts', account);
    return data;
  },

  update: async (id: number, account: Partial<Account>): Promise<Account> => {
    const { data } = await apiClient.put<Account>(`/api/accounts/${id}`, account);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/accounts/${id}`);
  },
};

// Categories
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/api/categories');
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/api/categories/${id}`);
    return data;
  },

  create: async (category: Partial<Category>): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/api/categories', category);
    return data;
  },

  update: async (id: number, category: Partial<Category>): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/api/categories/${id}`, category);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};

// Budget Plans
export const budgetPlansApi = {
  // CRUD básico
  getAll: async (): Promise<BudgetPlan[]> => {
    const { data } = await apiClient.get<BudgetPlan[]>('/api/budget-plans/');
    return data;
  },

  getById: async (id: number): Promise<BudgetPlan> => {
    const { data } = await apiClient.get<BudgetPlan>(`/api/budget-plans/${id}`);
    return data;
  },

  create: async (plan: Partial<BudgetPlan>): Promise<BudgetPlan> => {
    const { data } = await apiClient.post<BudgetPlan>('/api/budget-plans/', plan);
    return data;
  },

  update: async (id: number, plan: Partial<BudgetPlan>): Promise<BudgetPlan> => {
    const { data } = await apiClient.put<BudgetPlan>(`/api/budget-plans/${id}`, plan);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/budget-plans/${id}`);
  },

  // Vista por ciclo
  getByCycle: async (cycleName: string): Promise<BudgetPlan[]> => {
    const { data } = await apiClient.get<BudgetPlan[]>(`/api/budget-plans/cycle/${cycleName}`);
    return data;
  },

  saveBulk: async (cycleName: string, budgets: Array<{ category_id: number; amount: number }>): Promise<BudgetPlan[]> => {
    const { data } = await apiClient.post<BudgetPlan[]>(`/api/budget-plans/cycle/bulk`, {
      cycle_name: cycleName,
      budgets,
    });
    return data;
  },

  // Vista anual (grid de 12 meses)
  getAnnualGrid: async (year: number): Promise<AnnualBudgetGrid> => {
    const { data } = await apiClient.get<AnnualBudgetGrid>(`/api/budget-plans/annual/${year}`);
    return data;
  },

  updateCell: async (cycleName: string, categoryId: number, amount: number): Promise<BudgetPlan> => {
    const { data } = await apiClient.post<BudgetPlan>('/api/budget-plans/cell/update', {
      cycle_name: cycleName,
      category_id: categoryId,
      amount,
    });
    return data;
  },

  // Funciones de productividad
  copyCycle: async (sourceCycle: string, targetCycles: string[]): Promise<{ message: string; created_count: number }> => {
    const { data } = await apiClient.post<{ message: string; created_count: number }>('/api/budget-plans/copy/cycle', {
      source_cycle: sourceCycle,
      target_cycles: targetCycles,
    });
    return data;
  },

  copyCategory: async (categoryId: number, sourceCycle: string, targetCycles: string[]): Promise<{ message: string; created_count: number }> => {
    const { data } = await apiClient.post<{ message: string; created_count: number }>('/api/budget-plans/copy/category', {
      category_id: categoryId,
      source_cycle: sourceCycle,
      target_cycles: targetCycles,
    });
    return data;
  },

  clearCycle: async (cycleName: string): Promise<{ message: string; deleted_count: number }> => {
    const { data } = await apiClient.delete<{ message: string; deleted_count: number }>(`/api/budget-plans/cycle/${cycleName}`);
    return data;
  },

  // Comparación con real (para Analysis)
  getComparison: async (cycleName: string): Promise<BudgetComparison> => {
    const { data } = await apiClient.get<BudgetComparison>(`/api/budget-plans/comparison/${cycleName}`);
    return data;
  },
};

// Exchange Rate
export const exchangeRateApi = {
  getRate: async (date?: string): Promise<{ rate: number; currency_pair: string; date: string; source: string }> => {
    const params = date ? { date } : {};
    const { data } = await apiClient.get('/api/exchange-rate', { params });
    return data;
  },
};

// Quick Templates
export const quickTemplatesApi = {
  getAll: async (): Promise<QuickTemplate[]> => {
    const { data } = await apiClient.get<QuickTemplate[]>('/api/quick-templates');
    return data;
  },

  getById: async (id: number): Promise<QuickTemplate> => {
    const { data } = await apiClient.get<QuickTemplate>(`/api/quick-templates/${id}`);
    return data;
  },

  create: async (template: Partial<QuickTemplate>): Promise<QuickTemplate> => {
    const { data } = await apiClient.post<QuickTemplate>('/api/quick-templates/', template);
    return data;
  },

  update: async (id: number, template: Partial<QuickTemplate>): Promise<QuickTemplate> => {
    const { data } = await apiClient.put<QuickTemplate>(`/api/quick-templates/${id}`, template);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/quick-templates/${id}`);
  },
};

// Billing Cycle Settings
export const billingCycleApi = {
  get: async (): Promise<BillingCycle> => {
    const { data } = await apiClient.get<BillingCycle>('/api/settings/billing-cycle');
    return data;
  },

  update: async (startDay: number): Promise<BillingCycle> => {
    const { data } = await apiClient.put<BillingCycle>('/api/settings/billing-cycle', {
      start_day: startDay,
    });
    return data;
  },

  getCurrentCycle: async (): Promise<CurrentCycleInfo> => {
    const { data } = await apiClient.get<CurrentCycleInfo>('/api/settings/billing-cycle/current');
    return data;
  },
};

// Analysis
export const analysisApi = {
  getByCategory: async (startDate?: string, endDate?: string, transactionType?: string): Promise<CategoryAnalysis[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (transactionType) params.append('transaction_type', transactionType);
    
    const queryString = params.toString();
    const url = `/api/analysis/by-category${queryString ? '?' + queryString : ''}`;
    
    const { data } = await apiClient.get<CategoryAnalysis[]>(url);
    return data;
  },

  getTrends: async (cycles: number = 6): Promise<TrendData[]> => {
    const { data } = await apiClient.get<TrendData[]>('/api/analysis/trends', {
      params: { cycles },
    });
    return data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<AnalysisSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const url = `/api/analysis/summary${queryString ? '?' + queryString : ''}`;
    
    const { data } = await apiClient.get<AnalysisSummary>(url);
    return data;
  },
};
