/**
 * Credit Cards API Client
 * 
 * Endpoints para gestión de tarjetas de crédito:
 * - CRUD de tarjetas
 * - Gestión de cuotas
 * - Estados de cuenta
 * - Timeline de ciclos (mejor momento para comprar)
 * - Asesor de compras (cuotas vs revolvente)
 */

import { apiClient } from './client';

// ============================================================================
// Types
// ============================================================================

export interface CreditCard {
  id: number;
  name: string;
  bank: string;
  card_type?: string;
  last_four_digits?: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  revolving_debt: number;
  payment_due_day?: number;
  statement_close_day?: number;
  revolving_interest_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: number;
  credit_card_id: number;
  concept: string;
  original_amount: number;
  purchase_date?: string;
  current_installment: number;
  total_installments: number;
  monthly_payment: number;
  monthly_principal?: number;
  monthly_interest?: number;
  interest_rate?: number;
  remaining_capital?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Statement {
  id: number;
  credit_card_id: number;
  statement_date: string;
  due_date: string;
  previous_balance: number;
  new_charges: number;
  payments_received: number;
  interest_charges: number;
  fees: number;
  new_balance: number;
  minimum_payment: number;
  total_payment: number;
  revolving_balance: number;
  installments_balance: number;
  created_at: string;
}

export interface CreditCardSummary {
  card: CreditCard;
  active_installments: Installment[];
  latest_statement?: Statement;
  total_monthly_installments: number;
  months_to_payoff_minimum?: number;
  projected_interest_minimum?: number;
}

export interface CycleTimeline {
  current_cycle: {
    statement_date: string;
    due_date: string;
    days_in_cycle: number;
    days_until_close: number;
    days_until_payment: number;
  };
  timeline: {
    best_purchase_window: {
      start: string;
      end: string;
      float_days: number;
      reason: string;
    };
    risk_zone: {
      start: string;
      end: string;
      reason: string;
    };
    cycle_phases: Array<{
      phase: 'optimal' | 'normal' | 'warning';
      date_range: [string, string];
      description: string;
    }>;
  };
  float_calculator: {
    if_buy_today: {
      purchase_date: string;
      will_appear_on_statement: string;
      payment_due: string;
      float_days: number;
      message: string;
    };
  };
}

export interface PurchaseAdvisor {
  purchase_amount: number;
  revolvente_option: {
    total_to_pay: number;
    interest: number;
    condition: string;
    tea_effective: number;
    pros: string[];
    cons: string[];
  };
  installments_option?: {
    installments: number;
    monthly_payment: number;
    total_to_pay: number;
    total_interest: number;
    tea: number;
    pros: string[];
    cons: string[];
  };
  recommendation: {
    best_option: 'revolvente' | 'installments' | 'depends';
    reason: string;
    considerations: string[];
  };
  impact_on_credit: {
    current_available: number;
    after_purchase: number;
    utilization_before: number;
    utilization_after: number;
    warning: string;
  };
}

export interface CreateCreditCardPayload {
  name: string;
  bank: string;
  card_type?: string;
  last_four_digits?: string;
  credit_limit: number;
  payment_due_day?: number;
  statement_close_day?: number;
  revolving_interest_rate?: number;
}

export interface CreateInstallmentPayload {
  credit_card_id: number;
  concept: string;
  original_amount: number;
  purchase_date?: string;
  current_installment?: number;
  total_installments: number;
  monthly_payment: number;
  monthly_principal?: number;
  monthly_interest?: number;
  interest_rate?: number;
}

export interface CreateStatementPayload {
  credit_card_id: number;
  statement_date: string;
  due_date: string;
  previous_balance?: number;
  new_charges?: number;
  payments_received?: number;
  interest_charges?: number;
  fees?: number;
  new_balance?: number;
  minimum_payment?: number;
  total_payment?: number;
  revolving_balance?: number;
  installments_balance?: number;
}

// ============================================================================
// API Functions
// ============================================================================

export const creditCardsApi = {
  // ========== Credit Cards CRUD ==========
  
  list: async (): Promise<CreditCard[]> => {
    const response = await apiClient.get('/credit-cards/');
    return response.data;
  },

  getById: async (id: number): Promise<CreditCard> => {
    const response = await apiClient.get(`/credit-cards/${id}/`);
    return response.data;
  },

  getSummary: async (id: number): Promise<CreditCardSummary> => {
    const response = await apiClient.get(`/credit-cards/${id}/`);
    return response.data;
  },

  create: async (payload: CreateCreditCardPayload): Promise<CreditCard> => {
    const response = await apiClient.post('/credit-cards/', payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<CreateCreditCardPayload>): Promise<CreditCard> => {
    const response = await apiClient.put(`/credit-cards/${id}/`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/credit-cards/${id}/`);
    return response.data;
  },

  // ========== Installments ==========

  listInstallments: async (cardId: number): Promise<Installment[]> => {
    const response = await apiClient.get(`/credit-cards/${cardId}/installments/`);
    return response.data;
  },

  createInstallment: async (payload: CreateInstallmentPayload): Promise<Installment> => {
    const { credit_card_id, ...data } = payload;
    const response = await apiClient.post(`/credit-cards/${credit_card_id}/installments/`, data);
    return response.data;
  },

  updateInstallment: async (id: number, current_installment: number): Promise<Installment> => {
    const response = await apiClient.put(`/credit-cards/installments/${id}/`, { current_installment });
    return response.data;
  },

  deleteInstallment: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/credit-cards/installments/${id}/`);
    return response.data;
  },

  // ========== Statements ==========

  listStatements: async (cardId: number, limit?: number): Promise<Statement[]> => {
    const response = await apiClient.get(`/credit-cards/${cardId}/statements/`, {
      params: { limit }
    });
    return response.data;
  },

  createStatement: async (payload: CreateStatementPayload): Promise<Statement> => {
    const { credit_card_id, ...data } = payload;
    const response = await apiClient.post(`/credit-cards/${credit_card_id}/statements/`, data);
    return response.data;
  },

  // ========== Timeline & Advisor ==========

  getCycleTimeline: async (
    cardId: number,
    targetMonth?: number,
    targetYear?: number
  ): Promise<CycleTimeline> => {
    const response = await apiClient.get(`/credit-cards/${cardId}/cycle-timeline/`, {
      params: { target_month: targetMonth, target_year: targetYear }
    });
    return response.data;
  },

  getPurchaseAdvisor: async (
    cardId: number,
    amount: number,
    installments?: number,
    teaInstallments?: number
  ): Promise<PurchaseAdvisor> => {
    const response = await apiClient.get(`/credit-cards/${cardId}/purchase-advisor/`, {
      params: {
        amount,
        installments,
        tea_installments: teaInstallments
      }
    });
    return response.data;
  },
};
