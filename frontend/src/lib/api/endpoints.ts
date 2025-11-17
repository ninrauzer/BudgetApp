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
  BudgetCopyResult,
  TransferCreate,
  TransferResponse,
  TransferDetail,
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
    // El backend actualmente devuelve cuentas con el campo 'balance' pero el frontend
    // espera 'initial_balance' y 'current_balance'. Aquí normalizamos para evitar NaN.
    const { data } = await apiClient.get<any[]>('/api/accounts');
    return data.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      icon: a.icon,
      currency: a.currency,
      initial_balance: typeof a.balance === 'number' && !Number.isNaN(a.balance) ? a.balance : 0,
      current_balance: typeof a.balance === 'number' && !Number.isNaN(a.balance) ? a.balance : 0,
      is_active: a.is_active,
      created_at: a.created_at,
      // El modelo backend no expone updated_at aún; usamos created_at como fallback
      updated_at: a.updated_at ?? a.created_at,
    }));
  },

  getById: async (id: number): Promise<Account> => {
    const { data } = await apiClient.get<any>(`/api/accounts/${id}`);
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon,
      currency: data.currency,
      initial_balance: typeof data.balance === 'number' && !Number.isNaN(data.balance) ? data.balance : 0,
      current_balance: typeof data.balance === 'number' && !Number.isNaN(data.balance) ? data.balance : 0,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at ?? data.created_at,
    };
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

  updateCell: async (cycleName: string, categoryId: number, amount: number, notes?: string): Promise<BudgetPlan> => {
    const { data } = await apiClient.post<BudgetPlan>('/api/budget-plans/cell/update', {
      cycle_name: cycleName,
      category_id: categoryId,
      amount,
      notes,
    });
    return data;
  },

  // Funciones de productividad
  copyCycle: async (sourceCycle: string, targetCycles: string[], overwrite: boolean = false): Promise<BudgetCopyResult> => {
    const { data } = await apiClient.post<BudgetCopyResult>('/api/budget-plans/copy/cycle', {
      source_cycle_name: sourceCycle,
      target_cycle_names: targetCycles,
      overwrite,
    });
    return data;
  },

  copyCategory: async (categoryId: number, sourceCycle: string, targetCycles: string[], overwrite: boolean = false): Promise<BudgetCopyResult> => {
    const { data } = await apiClient.post<BudgetCopyResult>('/api/budget-plans/copy/category', {
      category_id: categoryId,
      source_cycle_name: sourceCycle,
      target_cycle_names: targetCycles,
      overwrite,
    });
    return data;
  },

  clearCycle: async (cycleName: string): Promise<{ message: string; deleted_count: number }> => {
    const { data } = await apiClient.delete<{ message: string; deleted_count: number }>(`/api/budget-plans/cycle/${cycleName}`);
    return data;
  },

  cloneYear: async (sourceYear: number, targetYear: number, overwrite: boolean = false): Promise<BudgetCopyResult> => {
    const { data } = await apiClient.post<BudgetCopyResult>('/api/budget-plans/clone/year', {
      source_year: sourceYear,
      target_year: targetYear,
      overwrite,
    });
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

// Transfers
export const transfersApi = {
  create: async (payload: TransferCreate): Promise<TransferResponse> => {
    const { data } = await apiClient.post<TransferResponse>('/api/transfers/', payload);
    return data;
  },
  list: async (): Promise<TransferResponse[]> => {
    const { data } = await apiClient.get<TransferResponse[]>('/api/transfers/');
    return data;
  },
  getById: async (transferId: string): Promise<TransferDetail> => {
    const { data } = await apiClient.get<TransferDetail>(`/api/transfers/${transferId}`);
    return data;
  },
  delete: async (transferId: string): Promise<{ message: string; transfer_id: string; deleted_transactions: number }> => {
    const { data } = await apiClient.delete<{ message: string; transfer_id: string; deleted_transactions: number }>(`/api/transfers/${transferId}`);
    return data;
  },
};
