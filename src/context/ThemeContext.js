// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getConfig } from '../api/config';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primaryColor: '#3498db',
    secondaryColor: '#2ecc71',
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    empresaNombre: 'Dashboard'
  });

  const [isLoading, setIsLoading] = useState(true);

  // ⭐ Cargar tema del tenant actual
  const loadTheme = async () => {
    try {
      const tenant = localStorage.getItem('tenant');
      if (!tenant) {
        setIsLoading(false);
        return;
      }

      const data = await getConfig();
      
      if (data && data.config) {
        setTheme({
          primaryColor: data.config.primary_color || '#3498db',
          secondaryColor: data.config.secondary_color || '#2ecc71',
          backgroundColor: data.config.background_color || '#f5f5f5',
          textColor: data.config.text_color || '#333333',
          empresaNombre: data.config.empresa_nombre || 'Dashboard'
        });
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tema al montar y cuando cambie el tenant
  useEffect(() => {
    loadTheme();
  }, []);

  // Recargar tema cuando cambie el tenant en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      loadTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loadTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);