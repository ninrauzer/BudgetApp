/**
 * React Query hooks for new dashboard metrics
 */
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:5173/api/dashboard';

// Types
export interface MonthlyAvailable {
  available_amount: number;
  days_remaining: number;
  daily_limit: number;
  monthly_income: number;
  fixed_expenses_budgeted: number;
  variable_expenses_spent: number;
  health_status: 'healthy' | 'warning' | 'critical';
  period_start: string;
  period_end: string;
}

export interface SpendingStatus {
  status: 'under_budget' | 'on_track' | 'over_budget';
  total_budgeted: number;
  total_spent: number;
  difference: number;
  deviation_percentage: number;
  message: string;
  period_start: string;
  period_end: string;
}

export interface DailyDataPoint {
  date: string;
  cumulative_income: number;
  cumulative_expense: number;
  balance: number;
}

export interface MonthlyCashflow {
  total_income: number;
  total_expense: number;
  balance: number;
  is_positive: boolean;
  daily_data: DailyDataPoint[];
  period_start: string;
  period_end: string;
}

export interface DebtSummary {
  total_debt: number;
  total_monthly_payment: number;
  monthly_income_percentage: number;
  risk_level: 'healthy' | 'warning' | 'critical';
  active_loans_count: number;
  total_remaining_payments: number;
}

export interface UpcomingPayment {
  loan_id: number;
  loan_name: string;
  entity: string;
  amount: number;
  payment_date: string;
  days_until_due: number;
}

export interface UpcomingPayments {
  payments: UpcomingPayment[];
  total_amount: number;
  available_balance: number;
  deficit: number;
  has_deficit: boolean;
}

export interface MonthProjection {
  projected_balance: number;
  is_positive: boolean;
  daily_average_spending: number;
  days_elapsed: number;
  days_remaining: number;
  message: string;
}

export interface ProblemCategory {
  category_id: number;
  category_name: string;
  budgeted: number;
  spent: number;
  deviation: number;
  deviation_percentage: number;
  message: string;
}

// Hooks
export function useMonthlyAvailable(cycleOffset: number = 0) {
  return useQuery<MonthlyAvailable>({
    queryKey: ['monthly-available', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/monthly-available`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useSpendingStatus(cycleOffset: number = 0) {
  return useQuery<SpendingStatus>({
    queryKey: ['spending-status', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/spending-status`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 60000,
  });
}

export function useMonthlyCashflow(cycleOffset: number = 0) {
  return useQuery<MonthlyCashflow>({
    queryKey: ['monthly-cashflow', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/monthly-cashflow`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 60000,
  });
}

export function useDebtSummary(cycleOffset: number = 0) {
  return useQuery<DebtSummary>({
    queryKey: ['debt-summary', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/debt-summary`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useUpcomingPayments() {
  return useQuery<UpcomingPayments>({
    queryKey: ['upcoming-payments'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/upcoming-payments`);
      return data;
    },
    refetchInterval: 300000,
  });
}

export function useMonthProjection(cycleOffset: number = 0) {
  return useQuery<MonthProjection>({
    queryKey: ['month-projection', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/month-projection`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 60000,
  });
}

export function useProblemCategory(cycleOffset: number = 0) {
  return useQuery<ProblemCategory>({
    queryKey: ['problem-category', cycleOffset],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/problem-category`, {
        params: { cycle_offset: cycleOffset }
      });
      return data;
    },
    refetchInterval: 60000,
  });
}
