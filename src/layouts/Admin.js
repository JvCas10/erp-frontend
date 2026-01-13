import React, { useEffect } from "react";
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "components/Sidebar/Sidebar.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";

import routes from "routes.js";
import { useTheme } from "../context/ThemeContext";

let ps;

function Admin(props) {
  const location = useLocation();
  const { theme, setTheme, loadTheme } = useTheme();
  const backgroundColor = theme.backgroundColor || "#f5f5f5";
  const activeColor = theme.primaryColor || "#3498db";
  const sidebarMini = theme.sidebarMini || false;

  const mainPanel = React.useRef();

  // ⭐ Cargar tema del tenant al montar
  useEffect(() => {
    loadTheme();
  }, []);

  // ⭐ Aplicar CSS variables cuando cambie el tema
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor || '#3498db');
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor || '#2ecc71');
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor || '#f5f5f5');
    document.documentElement.style.setProperty('--text-color', theme.textColor || '#333333');
  }, [theme]);

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanel.current);
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.className += " perfect-scrollbar-off";
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/admin") {
        return <Route path={prop.path} element={prop.component} key={key} exact />;
      } else {
        return null;
      }
    });
  };

  const handleActiveClick = (color) => {
    setTheme({ ...theme, primaryColor: color });
  };

  const handleBgClick = (color) => {
    setTheme({ ...theme, backgroundColor: color });
  };

  const handleMiniClick = () => {
    const next = !sidebarMini;
    setTheme({ ...theme, sidebarMini: next });
    document.body.classList.toggle("sidebar-mini", next);
  };

  return (
    <div className="wrapper">
      <Sidebar
        {...props}
        routes={routes}
        bgColor={backgroundColor}
        activeColor={activeColor}
        handleMiniClick={handleMiniClick}
      />
      <div className="main-panel" ref={mainPanel}>
        <AdminNavbar {...props} handleMiniClick={handleMiniClick} />
        <Routes>{getRoutes(routes)}</Routes>
      </div>
    </div>
  );
}

export default Admin;