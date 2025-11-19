import { apiClient } from './client';

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
  total_installments: number;
  current_installment: number;
  monthly_payment: number;
  monthly_principal?: number;
  monthly_interest?: number;
  interest_rate?: number;
  remaining_capital?: number;
  is_active: boolean;
  created_at: string;
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
  pdf_file_path?: string;
  ai_parsed: boolean;
  ai_confidence?: number;
  manual_review_required: boolean;
  created_at: string;
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
  total_installments: number;
  current_installment?: number;
  monthly_payment: number;
  monthly_principal?: number;
  monthly_interest?: number;
  interest_rate?: number;
}

export interface CreateStatementPayload {
  credit_card_id: number;
  statement_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
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
  pdf_file_path?: string;
}

// API functions
export const creditCardsApi = {
  list: async (): Promise<CreditCard[]> => {
    const res = await apiClient.get('/credit-cards');
    return res.data;
  },
  create: async (payload: CreateCreditCardPayload): Promise<CreditCard> => {
    const res = await apiClient.post('/credit-cards', payload);
    return res.data;
  },
  update: async (id: number, data: Partial<CreateCreditCardPayload>): Promise<CreditCard> => {
    const res = await apiClient.put(`/credit-cards/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/credit-cards/${id}`);
    return res.data;
  },
  listInstallments: async (cardId: number): Promise<Installment[]> => {
    const res = await apiClient.get(`/credit-cards/${cardId}/installments`);
    return res.data;
  },
  createInstallment: async (payload: CreateInstallmentPayload): Promise<Installment> => {
    const res = await apiClient.post(`/credit-cards/${payload.credit_card_id}/installments`, payload);
    return res.data;
  },
  updateInstallment: async (id: number, data: Partial<CreateInstallmentPayload>): Promise<Installment> => {
    const res = await apiClient.put(`/credit-cards/installments/${id}`, data);
    return res.data;
  },
  listStatements: async (cardId: number): Promise<Statement[]> => {
    const res = await apiClient.get(`/credit-cards/${cardId}/statements`);
    return res.data;
  },
  createStatement: async (payload: CreateStatementPayload): Promise<Statement> => {
    const res = await apiClient.post(`/credit-cards/${payload.credit_card_id}/statements`, payload);
    return res.data;
  }
};
