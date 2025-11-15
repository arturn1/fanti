import axios from 'axios';
import https from 'https';

const isDev = process.env.NODE_ENV === 'development';
const access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7213/api',
  headers: {
    'Content-Type': 'application/json',
    ...(access_token ? { 'Authorization': `Bearer ${access_token}` } : {}),
  },
  httpsAgent: isDev
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined,
});


api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
