// src/api/axiosConfig.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar tenant y token
axiosInstance.interceptors.request.use(
  (config) => {
    // Token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tenant
    const tenant = localStorage.getItem('tenant') || 'prueba';
    if (!config.params) {
      config.params = {};
    }
    config.params.tenant = tenant;

    console.log('🔍 Request:', config.url, 'Tenant:', tenant);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;