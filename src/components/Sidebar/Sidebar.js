import React from "react";
import { Link } from "react-router-dom";
import { Nav, Collapse } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";

import avatar from "assets/img/faces/ayo-ogunseinde-2.jpg";
import defaultLogo from "assets/img/react-logo.png";
import { useTheme } from "../../context/ThemeContext";

let ps;

function Sidebar(props) {
  const [openAvatar, setOpenAvatar] = React.useState(false);
  const [collapseStates, setCollapseStates] = React.useState({});
  const sidebar = React.useRef();
  const { theme } = useTheme();

  const getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: getCollapseInitialState(prop.views),
          ...getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };

  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.pathname.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  };

  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) return null;
      if (prop.collapse) {
        const st = { [prop.state]: !collapseStates[prop.state] };
        return (
          <li className={getCollapseInitialState(prop.views) ? "active" : ""} key={key}>
            <a
              href="#pablo"
              data-toggle="collapse"
              aria-expanded={collapseStates[prop.state]}
              onClick={(e) => {
                e.preventDefault();
                setCollapseStates(st);
              }}
              style={{ color: theme.textColor }}
            >
              {prop.icon ? (
                <>
                  <i className={prop.icon} />
                  <p>{prop.name}<b className="caret" /></p>
                </>
              ) : (
                <>
                  <span className="sidebar-mini-icon">{prop.mini}</span>
                  <span className="sidebar-normal">{prop.name}<b className="caret" /></span>
                </>
              )}
            </a>
            <Collapse isOpen={collapseStates[prop.state]}>
              <ul className="nav">{createLinks(prop.views)}</ul>
            </Collapse>
          </li>
        );
      }
      return (
        <li className={activeRoute(prop.layout + prop.path)} key={key}>
          <Link to={prop.layout + prop.path} style={{ color: theme.textColor }}>
            {prop.icon ? (
              <>
                <i className={prop.icon} />
                <p>{prop.name}</p>
              </>
            ) : (
              <>
                <span className="sidebar-mini-icon">{prop.mini}</span>
                <span className="sidebar-normal">{prop.name}</span>
              </>
            )}
          </Link>
        </li>
      );
    });
  };

  const activeRoute = (routeName) => {
    return window.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  }, []);

  React.useEffect(() => {
    setCollapseStates(getCollapseStates(props.routes));
  }, []);

  return (
    <div
      className="sidebar"
      data-active-color={theme.primaryColor || props.activeColor}
      style={{
        backgroundColor: theme.backgroundColor || "#f5f5f5",
        color: theme.textColor || "#333333",
      }}
    >
      <div className="logo">
        <a href="#" className="simple-text logo-mini">
          <div className="logo-img">
            <img src={theme.logo || defaultLogo} alt="Logo" />
          </div>
        </a>
        <div className="logo-normal-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <a href="#" className="simple-text logo-normal">
            {theme.empresaNombre || "CreatiBox"}
          </a>
        </div>
      </div>

      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>{createLinks(props.routes)}</Nav>
      </div>
    </div>
  );
}

export default Sidebar;