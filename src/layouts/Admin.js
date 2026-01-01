import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";
import { useTheme } from "../context/ThemeContext";

let ps;

function Admin(props) {
  const location = useLocation();
  const { theme, updateTheme } = useTheme();
  const backgroundColor = theme.backgroundColor || "black";
  const activeColor = theme.primaryColor || "info";
  const sidebarMini = theme.sidebarMini || false;

  const mainPanel = React.useRef();

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
    updateTheme({ primaryColor: color });
  };

  const handleBgClick = (color) => {
    updateTheme({ backgroundColor: color });
  };

  const handleMiniClick = () => {
    const next = !sidebarMini;
    updateTheme({ sidebarMini: next });
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
      <div className="main-panel" ref={mainPanel} style={{ backgroundColor: theme.backgroundColor }}>
        <Routes>{getRoutes(routes)}</Routes>
      </div>
    </div>
  );
}

export default Admin;