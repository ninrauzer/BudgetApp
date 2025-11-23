/**
 * Credit Cards API Client
 * 
 * Endpoints para gestión de tarjetas de crédito:
 * - CRUD de tarjetas
 * - Gestión de cuotas
 * - Estados de cuenta
 * - Timeline de ciclos (mejor momento para comprar)
 * - Asesor de compras (cuotas vs revolvente)
 * 
 * Nota: Usa fetch() directamente para evitar problemas con baseURL en axios
 */

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
    const response = await fetch('/api/credit-cards/');
    if (!response.ok) throw new Error('Failed to fetch credit cards');
    return response.json();
  },

  getById: async (id: number): Promise<CreditCard> => {
    const response = await fetch(`/api/credit-cards/${id}`);
    if (!response.ok) throw new Error('Failed to fetch credit card');
    return response.json();
  },

  getSummary: async (id: number): Promise<CreditCardSummary> => {
    const response = await fetch(`/api/credit-cards/${id}`);
    if (!response.ok) throw new Error('Failed to fetch credit card summary');
    return response.json();
  },

  create: async (payload: CreateCreditCardPayload): Promise<CreditCard> => {
    const response = await fetch('/api/credit-cards/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create credit card');
    return response.json();
  },

  update: async (id: number, payload: Partial<CreateCreditCardPayload>): Promise<CreditCard> => {
    const response = await fetch(`/api/credit-cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update credit card');
    return response.json();
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`/api/credit-cards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete credit card');
    return response.json();
  },

  // ========== Installments ==========

  listInstallments: async (cardId: number): Promise<Installment[]> => {
    const response = await fetch(`/api/credit-cards/${cardId}/installments/`);
    if (!response.ok) throw new Error('Failed to fetch installments');
    return response.json();
  },

  createInstallment: async (payload: CreateInstallmentPayload): Promise<Installment> => {
    const { credit_card_id, ...data } = payload;
    const response = await fetch(`/api/credit-cards/${credit_card_id}/installments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create installment');
    return response.json();
  },

  updateInstallment: async (id: number, current_installment: number): Promise<Installment> => {
    const response = await fetch(`/api/credit-cards/installments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_installment }),
    });
    if (!response.ok) throw new Error('Failed to update installment');
    return response.json();
  },

  deleteInstallment: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`/api/credit-cards/installments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete installment');
    return response.json();
  },

  // ========== Statements ==========

  listStatements: async (cardId: number, limit?: number): Promise<Statement[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const url = `/api/credit-cards/${cardId}/statements/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch statements');
    return response.json();
  },

  createStatement: async (payload: CreateStatementPayload): Promise<Statement> => {
    const { credit_card_id, ...data } = payload;
    const response = await fetch(`/api/credit-cards/${credit_card_id}/statements/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create statement');
    return response.json();
  },

  // ========== Timeline & Advisor ==========

  getCycleTimeline: async (
    cardId: number,
    targetMonth?: number,
    targetYear?: number
  ): Promise<CycleTimeline> => {
    const params = new URLSearchParams();
    if (targetMonth !== undefined) params.append('target_month', targetMonth.toString());
    if (targetYear !== undefined) params.append('target_year', targetYear.toString());
    const url = `/api/credit-cards/${cardId}/cycle-timeline${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cycle timeline');
    return response.json();
  },

  getPurchaseAdvisor: async (
    cardId: number,
    amount: number,
    installments?: number,
    teaInstallments?: number
  ): Promise<PurchaseAdvisor> => {
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    if (installments !== undefined) params.append('installments', installments.toString());
    if (teaInstallments !== undefined) params.append('tea_installments', teaInstallments.toString());
    const url = `/api/credit-cards/${cardId}/purchase-advisor?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch purchase advisor');
    return response.json();
  },
};
