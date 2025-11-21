import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, transactionsApi, accountsApi, categoriesApi, budgetPlansApi, quickTemplatesApi, billingCycleApi, analysisApi, exchangeRateApi, transfersApi } from '../api';
import type { TransactionFilters } from '../api';
import type { TransferCreate, TransferResponse } from '../api';

// Dashboard Hooks
export const useDashboardStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', startDate, endDate],
    queryFn: () => dashboardApi.getStats(startDate, endDate),
  });
};

// Transaction Hooks
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });
};

export const useRecentTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: () => transactionsApi.getRecent(limit),
  });
};

export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
};

// Transfers Hooks
export const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => transfersApi.list(),
  });
};

export const useTransfer = (transferId: string) => {
  return useQuery({
    queryKey: ['transfers', transferId],
    queryFn: () => transfersApi.getById(transferId),
    enabled: !!transferId,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation<TransferResponse, unknown, TransferCreate>({
    mutationFn: (payload) => transfersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; transfer_id: string; deleted_transactions: number }, unknown, string>({
    mutationFn: (transferId) => transfersApi.delete(transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Account Hooks
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });
};

export const useAccount = (id: number) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Category Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Budget Plan Hooks
export const useBudgetPlans = () => {
  return useQuery({
    queryKey: ['budgetPlans'],
    queryFn: budgetPlansApi.getAll,
  });
};

export const useBudgetPlan = (id: number) => {
  return useQuery({
    queryKey: ['budgetPlans', id],
    queryFn: () => budgetPlansApi.getById(id),
    enabled: !!id,
  });
};

export const useBudgetPlansByCycle = (cycleName: string) => {
  return useQuery({
    queryKey: ['budgetPlans', 'cycle', cycleName],
    queryFn: () => budgetPlansApi.getByCycle(cycleName),
    enabled: !!cycleName,
  });
};

export const useAnnualBudgetGrid = (year: number) => {
  return useQuery({
    queryKey: ['budgetPlans', 'annual', year],
    queryFn: () => budgetPlansApi.getAnnualGrid(year),
  });
};

export const useBudgetComparison = (cycleName: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['budgetPlans', 'comparison', cycleName, startDate, endDate],
    queryFn: () => budgetPlansApi.getComparison(cycleName, startDate, endDate),
    enabled: !!cycleName,
  });
};

export const useCreateBudgetPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: budgetPlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
    },
  });
};

export const useUpdateBudgetPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => budgetPlansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
    },
  });
};

export const useDeleteBudgetPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: budgetPlansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
    },
  });
};

export const useSaveBulkBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cycleName, budgets }: { cycleName: string; budgets: Array<{ category_id: number; amount: number }> }) => 
      budgetPlansApi.saveBulk(cycleName, budgets),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      queryClient.invalidateQueries({ queryKey: ['budgetPlans', 'cycle', variables.cycleName] });
      queryClient.invalidateQueries({ queryKey: ['budgetPlans', 'annual'] });
    },
  });
};

export const useUpdateBudgetCell = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cycleName, categoryId, amount, notes }: { cycleName: string; categoryId: number; amount: number; notes?: string }) => 
      budgetPlansApi.updateCell(cycleName, categoryId, amount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      // Invalidate all annual grids using predicate to match any year
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'budgetPlans' && query.queryKey[1] === 'annual'
      });
    },
  });
};

export const useCopyCycle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceCycle, targetCycles, overwrite = false }: { sourceCycle: string; targetCycles: string[]; overwrite?: boolean }) => 
      budgetPlansApi.copyCycle(sourceCycle, targetCycles, overwrite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      // Invalidate all annual grids (different years) using predicate
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'budgetPlans' && query.queryKey[1] === 'annual'
      });
    },
  });
};

export const useCopyCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, sourceCycle, targetCycles, overwrite = false }: { categoryId: number; sourceCycle: string; targetCycles: string[]; overwrite?: boolean }) => 
      budgetPlansApi.copyCategory(categoryId, sourceCycle, targetCycles, overwrite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'budgetPlans' && query.queryKey[1] === 'annual'
      });
    },
  });
};

export const useClearCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cycleName: string) => budgetPlansApi.clearCycle(cycleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      queryClient.invalidateQueries({ queryKey: ['budgetPlans', 'annual'] });
    },
  });
};

export const useCloneYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sourceYear, targetYear, overwrite }: { sourceYear: number; targetYear: number; overwrite?: boolean }) => 
      budgetPlansApi.cloneYear(sourceYear, targetYear, overwrite || false),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] });
      queryClient.invalidateQueries({ queryKey: ['budgetPlans', 'annual', variables.targetYear] });
    },
  });
};

// Quick Template Hooks
export const useQuickTemplates = () => {
  return useQuery({
    queryKey: ['quickTemplates'],
    queryFn: quickTemplatesApi.getAll,
  });
};

export const useQuickTemplate = (id: number) => {
  return useQuery({
    queryKey: ['quickTemplates', id],
    queryFn: () => quickTemplatesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateQuickTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quickTemplatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickTemplates'] });
    },
  });
};

export const useUpdateQuickTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => quickTemplatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickTemplates'] });
    },
  });
};

export const useDeleteQuickTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quickTemplatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickTemplates'] });
    },
  });
};

// Billing Cycle Hooks
export const useBillingCycle = () => {
  return useQuery({
    queryKey: ['billingCycle'],
    queryFn: billingCycleApi.get,
  });
};

export const useCurrentCycle = () => {
  return useQuery({
    queryKey: ['currentCycle'],
    queryFn: billingCycleApi.getCurrentCycle,
  });
};

export const useUpdateBillingCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: { start_day: number; next_override_date?: string | null }) => billingCycleApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingCycle'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycle'] });
    },
  });
};

// Analysis Hooks
export const useCategoryAnalysis = (startDate?: string, endDate?: string, transactionType?: string) => {
  return useQuery({
    queryKey: ['analysis', 'category', startDate, endDate, transactionType],
    queryFn: () => analysisApi.getByCategory(startDate, endDate, transactionType),
  });
};

export const useTrends = (cycles: number = 6) => {
  return useQuery({
    queryKey: ['analysis', 'trends', cycles],
    queryFn: () => analysisApi.getTrends(cycles),
  });
};

export const useAnalysisSummary = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analysis', 'summary', startDate, endDate],
    queryFn: () => analysisApi.getSummary(startDate, endDate),
  });
};

// Exchange Rate Hook
export const useExchangeRate = (date?: string) => {
  return useQuery({
    queryKey: ['exchangeRate', date],
    queryFn: () => exchangeRateApi.getRate(date),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
