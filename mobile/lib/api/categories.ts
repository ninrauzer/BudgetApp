import { apiClient } from './client';
import type { Category } from './types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get('/api/categories');
    return data;
  },

  getActive: async (): Promise<Category[]> => {
    const { data } = await apiClient.get('/api/categories', {
      params: { include_inactive: false }
    });
    return data;
  },
};
