import './api/axiosConfig';
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.1";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "react-datepicker/dist/react-datepicker.css";

import { ThemeProvider } from "./context/ThemeContext";


console.warn = () => {};

// Componente principal que gestiona el estado de autenticación
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica si ya hay un token en localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // En una aplicación real, aquí validarías el token con la API
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/auth/*" 
            element={<AuthLayout onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/admin/*" 
            element={isAuthenticated ? <AdminLayout /> : <Navigate to="/auth/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/admin/inventario" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

// React 18: usar createRoot
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(<App />);