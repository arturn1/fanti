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


// Interceptor para adicionar Authorization Bearer token
api.interceptors.request.use(
    (config) => {
        // Se já existe Authorization no header, apenas propague
        // (não sobrescreva nem tente buscar em localStorage ou URL)
        // Isso garante que requisições internas com Bearer sejam mantidas
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
