import { apiClient } from './client';
import type { Transaction, TransactionWithDetails, TransactionCreate } from './types';

export const transactionsApi = {
  getAll: async (): Promise<TransactionWithDetails[]> => {
    const { data } = await apiClient.get('/api/transactions');
    return data;
  },

  getRecent: async (limit: number = 10): Promise<TransactionWithDetails[]> => {
    const { data } = await apiClient.get(`/api/transactions/recent?limit=${limit}`);
    return data;
  },

  create: async (transaction: TransactionCreate): Promise<Transaction> => {
    const { data } = await apiClient.post('/api/transactions', transaction);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/transactions/${id}`);
  },
};
