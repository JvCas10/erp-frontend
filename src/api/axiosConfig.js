// src/api/axiosConfig.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // ⭐ AGREGAR TOKEN
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⭐ AGREGAR TENANT COMO QUERY PARAM
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      config.params = config.params || {};
      config.params.tenant = tenant;
    }

    // ⭐ Solo establecer Content-Type si NO es FormData
    // Cuando es FormData, el navegador establece automáticamente
    // el Content-Type con el boundary correcto
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenant');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;