import { apiClient } from './client';
import type { Account } from './types';

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const { data } = await apiClient.get('/api/accounts');
    return data;
  },

  getActive: async (): Promise<Account[]> => {
    const { data } = await apiClient.get('/api/accounts', {
      params: { include_inactive: false }
    });
    return data;
  },
};
