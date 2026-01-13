// src/context/ThemeContext.js
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
  const [currentTenant, setCurrentTenant] = useState(null);

  // ⭐ Función para cargar tema
  const loadTheme = async () => {
    setIsLoading(true);
    try {
      const tenant = localStorage.getItem('tenant');
      if (!tenant) {
        console.log('⚠️ No hay tenant seleccionado');
        setTheme(defaultTheme);
        applyThemeToDOM(defaultTheme);
        setIsLoading(false);
        return;
      }

      console.log('🔄 Cargando tema para tenant:', tenant);
      const data = await getConfig();
      
      console.log('📦 Respuesta getConfig:', data);

      // ⭐ Backend devuelve los datos DIRECTAMENTE (sin .config)
      if (data) {
        const newTheme = {
          empresaNombre: data.empresa_nombre || defaultTheme.empresaNombre,
          primaryColor: data.primary_color || defaultTheme.primaryColor,
          secondaryColor: data.secondary_color || defaultTheme.secondaryColor,
          backgroundColor: data.background_color || defaultTheme.backgroundColor,
          textColor: data.text_color || defaultTheme.textColor,
          logo: data.logo || defaultTheme.logo,
          sidebarMini: false,
        };
        
        console.log('✅ Tema cargado:', newTheme);
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
        setCurrentTenant(tenant);
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración de tema:", error);
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ Función para aplicar tema al DOM
  const applyThemeToDOM = (themeToApply) => {
    console.log('🎨 Aplicando tema al DOM:', themeToApply);
    document.documentElement.style.setProperty('--primary-color', themeToApply.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', themeToApply.secondaryColor);
    document.documentElement.style.setProperty('--background-color', themeToApply.backgroundColor);
    document.documentElement.style.setProperty('--text-color', themeToApply.textColor);
    document.documentElement.style.setProperty(
      "--sidebar-gradient",
      `linear-gradient(135deg, ${themeToApply.primaryColor}, ${themeToApply.secondaryColor})`
    );
  };

  // Cargar tema al montar
  useEffect(() => {
    loadTheme();
  }, []);

  // ⭐ Detectar cambios de tenant con polling
  useEffect(() => {
    const checkTenant = () => {
      const tenant = localStorage.getItem('tenant');
      if (tenant && tenant !== currentTenant) {
        console.log('🔄 Tenant cambió de', currentTenant, 'a', tenant);
        loadTheme();
      }
    };

    // Verificar cada 500ms
    const interval = setInterval(checkTenant, 500);

    return () => clearInterval(interval);
  }, [currentTenant]);

  const updateTheme = (newThemeValues) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newThemeValues };
      applyThemeToDOM(updated);
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