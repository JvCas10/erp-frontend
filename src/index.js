import './api/axiosConfig';
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.1";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "react-datepicker/dist/react-datepicker.css";
import "assets/css/custom.css";

import { ThemeProvider } from "./context/ThemeContext";

console.warn = () => {};

// Componente de Loading
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{ textAlign: 'center', color: '#fff' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid #fff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      <p style={{ fontSize: '18px', margin: 0 }}>Cargando...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Componente para proteger rutas admin
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  const location = useLocation();
  
  // Mientras carga, no hacer nada (el loading se muestra arriba)
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirigir después del login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Componente para rutas públicas (login)
const PublicRoute = ({ children, isAuthenticated, isLoading }) => {
  // Mientras carga, no hacer nada
  if (isLoading) {
    return null;
  }
  
  // Si ya está autenticado, redirigir al admin
  if (isAuthenticated) {
    return <Navigate to="/admin/inventario" replace />;
  }
  
  return children;
};

// Componente principal que gestiona el estado de autenticación
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ← NUEVO: estado de carga

  // Verifica si ya hay un token en localStorage al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const tenant = localStorage.getItem('tenant');
      
      if (token && tenant) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
      // Terminar la carga
      setIsLoading(false);
    };

    // Pequeño delay para asegurar que localStorage está disponible
    checkAuth();
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tenant');
    setIsAuthenticated(false);
  };

  // Mostrar loading mientras verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas de autenticación (login) */}
          <Route 
            path="/auth/*" 
            element={
              <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <AuthLayout onLoginSuccess={handleLoginSuccess} />
              </PublicRoute>
            } 
          />
          
          {/* Rutas protegidas (admin) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <AdminLayout onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta raíz - redirige según estado de autenticación */}
          <Route 
            path="/" 
            element={
              isAuthenticated 
                ? <Navigate to="/admin/inventario" replace /> 
                : <Navigate to="/auth/login" replace />
            } 
          />
          
          {/* Cualquier otra ruta */}
          <Route 
            path="*" 
            element={
              isAuthenticated 
                ? <Navigate to="/admin/inventario" replace /> 
                : <Navigate to="/auth/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

// React 18: usar createRoot
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(<App />);