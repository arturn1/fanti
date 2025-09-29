
import axios from 'axios';
import https from 'https';

const isDev = process.env.NODE_ENV === 'development';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7213/api',
    headers: {
        'Content-Type': 'application/json',
    },
    httpsAgent: isDev
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
