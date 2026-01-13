import React from "react";
import classnames from "classnames";
import { useLocation } from "react-router-dom";
import {
  Button,
  NavbarBrand,
  Navbar,
  Container,
} from "reactstrap";
import { useTheme } from "../../context/ThemeContext";

function AdminNavbar(props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  React.useEffect(() => {
    if (
      window.outerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
  }, [location]);

  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Navbar
        className="navbar-absolute fixed-top"
        expand="lg"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <Container fluid>
          <div className="navbar-wrapper">
            <div className="navbar-minimize">
              <Button
                className="btn-icon btn-round"
                color="default"
                id="minimizeSidebar"
                onClick={props.handleMiniClick}
              >
                <i className="nc-icon nc-minimal-right text-center visible-on-sidebar-mini" />
                <i className="nc-icon nc-minimal-left text-center visible-on-sidebar-regular" />
              </Button>
            </div>
            <div
              className={classnames("navbar-toggle", {
                toggled: sidebarOpen,
              })}
            >
              <button
                className="navbar-toggler"
                type="button"
                onClick={toggleSidebar}
              >
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </button>
            </div>
            <NavbarBrand href="#pablo" onClick={(e) => e.preventDefault()}>
              <span className="d-none d-md-block">
                {theme.empresaNombre || "Dashboard"}
              </span>
              <span className="d-block d-md-none">ERP</span>
            </NavbarBrand>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;