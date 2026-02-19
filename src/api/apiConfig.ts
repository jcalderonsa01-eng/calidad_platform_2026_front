import axios from 'axios';

// En Vite, las variables de entorno se acceden vía import.meta.env
// Si no existe la variable, usamos la de Vercel por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://calidad-platform-2026-back.vercel.app/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Vital para enviar/recibir cookies de Vercel
});

// Interceptor para adjuntar el token en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;