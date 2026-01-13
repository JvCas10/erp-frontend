// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { getConfig } from "../api/config";

const defaultTheme = {
  empresaNombre: "Mi Empresa",
  primaryColor: "#3498db",
  secondaryColor: "#2ecc71",
  backgroundColor: "#f5f5f5",
  textColor: "#333333",
  logo: "",
  sidebarMini: false,
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐ Función para cargar tema (puede llamarse desde cualquier componente)
  const loadTheme = async () => {
    setIsLoading(true);
    try {
      const tenant = localStorage.getItem('tenant');
      if (!tenant) {
        console.log('No hay tenant seleccionado, usando tema por defecto');
        setIsLoading(false);
        return;
      }

      console.log('Cargando tema para tenant:', tenant);
      const data = await getConfig();
      
      if (data && data.config) {
        console.log("Configuración de tema cargada:", data.config);
        const newTheme = {
          empresaNombre: data.config.empresa_nombre || defaultTheme.empresaNombre,
          primaryColor: data.config.primary_color || defaultTheme.primaryColor,
          secondaryColor: data.config.secondary_color || defaultTheme.secondaryColor,
          backgroundColor: data.config.background_color || defaultTheme.backgroundColor,
          textColor: data.config.text_color || defaultTheme.textColor,
          logo: data.config.logo || defaultTheme.logo,
          sidebarMini: false,
        };
        
        setTheme(newTheme);
        
        // Aplicar CSS variables
        document.documentElement.style.setProperty('--primary-color', newTheme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', newTheme.secondaryColor);
        document.documentElement.style.setProperty('--background-color', newTheme.backgroundColor);
        document.documentElement.style.setProperty('--text-color', newTheme.textColor);
        document.documentElement.style.setProperty(
          "--sidebar-gradient",
          `linear-gradient(135deg, ${newTheme.primaryColor}, ${newTheme.secondaryColor})`
        );
        
        console.log('✅ Tema aplicado correctamente');
      }
    } catch (error) {
      console.error("Error al cargar configuración de tema:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tema al montar
  useEffect(() => {
    loadTheme();
  }, []);

  // ⭐ Recargar tema cuando cambie el tenant en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tenant') {
        console.log('Tenant cambió, recargando tema...');
        loadTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateTheme = (newThemeValues) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newThemeValues };
      
      // Aplicar CSS variables
      if (updated.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', updated.primaryColor);
      }
      if (updated.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', updated.secondaryColor);
      }
      if (updated.backgroundColor) {
        document.documentElement.style.setProperty('--background-color', updated.backgroundColor);
      }
      if (updated.textColor) {
        document.documentElement.style.setProperty('--text-color', updated.textColor);
      }
      
      if (updated.primaryColor && updated.secondaryColor) {
        document.documentElement.style.setProperty(
          "--sidebar-gradient",
          `linear-gradient(135deg, ${updated.primaryColor}, ${updated.secondaryColor})`
        );
      }
      
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, loadTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);