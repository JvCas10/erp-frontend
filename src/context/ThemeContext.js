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

  useEffect(() => {
    const fetchThemeFromAPI = async () => {
      try {
        const config = await getConfig();
        if (config) {
          console.log("Configuración de tema cargada:", config);
          setTheme({
            empresaNombre: config.empresa_nombre || defaultTheme.empresaNombre,
            primaryColor: config.primary_color || defaultTheme.primaryColor,
            secondaryColor: config.secondary_color || defaultTheme.secondaryColor,
            backgroundColor: config.background_color || defaultTheme.backgroundColor,
            textColor: config.text_color || defaultTheme.textColor,
            logo: config.logo || defaultTheme.logo,
            sidebarMini: false,
          });
          // Aplicar directamente al body el color de fondo si es necesario
          document.documentElement.style.setProperty(
            "--sidebar-gradient",
            `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
          );
        }
      } catch (error) {
        console.error("Error al cargar configuración de tema:", error);
      }
    };

    fetchThemeFromAPI();
  }, []);

  const updateTheme = (newThemeValues) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newThemeValues };
      if (updated.backgroundColor) {
        if (newThemeValues.primaryColor && newThemeValues.secondaryColor) {
          document.documentElement.style.setProperty(
            "--sidebar-gradient",
            `linear-gradient(135deg, ${newThemeValues.primaryColor}, ${newThemeValues.secondaryColor})`
          );
        }
      }
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);