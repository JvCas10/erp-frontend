// src/api/axiosConfig.js (sin cambios)
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar tenant desde localStorage
    const tenant = localStorage.getItem('tenant') || 'prueba';
    config.params = { ...config.params, tenant };

    // Agregar token JWT
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;