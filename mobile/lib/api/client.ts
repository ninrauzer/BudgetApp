import axios from 'axios';

// Para desarrollo: usa tu backend en Render.com o Docker local
// Render.com (RECOMENDADO - siempre disponible): https://budgetapp-backend.onrender.com
// Docker local (desde iPhone): http://192.168.100.11:8000
// Docker local (desde Windows): http://192.168.126.127:8000
const API_BASE_URL = 'http://192.168.100.11:8000';

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
    // Log de la URL completa para debugging
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
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
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
