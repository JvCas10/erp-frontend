// src/api/axiosConfig.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios con baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor para incluir automáticamente el token Y el tenant
axiosInstance.interceptors.request.use(
  (config) => {
    // ⭐ AGREGAR TOKEN (authToken, no token)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token añadido:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No hay token disponible');
    }

    // ⭐ AGREGAR TENANT COMO QUERY PARAM
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      config.params = config.params || {};
      config.params.tenant = tenant;
      console.log('✅ Tenant añadido:', tenant);
    } else {
      console.log('⚠️ No hay tenant disponible');
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ Error 401 - Token inválido o expirado');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenant');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;