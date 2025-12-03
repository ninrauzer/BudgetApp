import axios from 'axios';
import { getStoredCredentials } from '@/contexts/AuthContext';

// Use relative paths so requests go through the nginx proxy
// In production/docker: /api/... goes through nginx to localhost:8000
// In development: set VITE_API_URL to http://localhost:8000
// IMPORTANT: Empty string makes axios use the current origin (with port)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Try JWT token first (OAuth)
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[apiClient] Using JWT token:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to HTTP Basic Auth (development mode)
      const credentials = getStoredCredentials();
      if (credentials) {
        console.log('[apiClient] Using Basic Auth');
        config.headers.Authorization = `Basic ${credentials}`;
      } else {
        console.log('[apiClient] No authentication found');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('Network Error:', error.request);
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
