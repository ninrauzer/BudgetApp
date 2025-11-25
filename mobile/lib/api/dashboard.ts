import { apiClient } from './client';
import type { DashboardMetrics } from './types';

export const dashboardApi = {
  getAvailable: async (): Promise<DashboardMetrics['available']> => {
    const { data } = await apiClient.get('/api/dashboard/monthly-available');
    return data;
  },

  getProjection: async (): Promise<DashboardMetrics['projection']> => {
    const { data } = await apiClient.get('/api/dashboard/month-projection');
    return data;
  },
};
