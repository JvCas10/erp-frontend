import React from "react";
import classnames from "classnames";
import { useLocation } from "react-router-dom";
import {
  Button,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Form,
  Input,
  InputGroupText,
  InputGroup,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
} from "reactstrap";
import { useTheme } from "../../context/ThemeContext";

function AdminNavbar(props) {
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [color, setColor] = React.useState("navbar-transparent");
  const [currentTenant, setCurrentTenant] = React.useState(
    localStorage.getItem('tenant') || 'prueba'
  );
  const location = useLocation();
  const { theme } = useTheme();

  React.useEffect(() => {
    window.addEventListener("resize", updateColor);
    return () => window.removeEventListener("resize", updateColor);
  }, [collapseOpen]);

  React.useEffect(() => {
    if (
      window.outerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
  }, [location]);

  const updateColor = () => {
    if (window.innerWidth < 993 && collapseOpen) {
      setColor("bg-white");
    } else {
      setColor("navbar-transparent");
    }
  };

  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setColor(!collapseOpen ? "bg-white" : "navbar-transparent");
    setCollapseOpen(!collapseOpen);
  };

  const handleTenantChange = (e) => {
    const newTenant = e.target.value;
    setCurrentTenant(newTenant);
    localStorage.setItem('tenant', newTenant);
    // Recargar página para aplicar cambio
    window.location.reload();
  };

  return (
    <>
      <Navbar
        className={classnames("navbar-absolute fixed-top", color)}
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
              <span className="d-block d-md-none">PD PRO React</span>
            </NavbarBrand>
          </div>
          <button
            aria-controls="navigation-index"
            aria-expanded={collapseOpen}
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-toggle="collapse"
            type="button"
            onClick={toggleCollapse}
          >
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
          </button>
          <Collapse
            className="justify-content-end"
            navbar
            isOpen={collapseOpen}
          >
            <Form>
              <InputGroup className="no-border">
                <Input defaultValue="" placeholder="Search..." type="text" />
                <InputGroupText addonType="append">
                  <InputGroupText>
                    <i className="nc-icon nc-zoom-split" />
                  </InputGroupText>
                </InputGroupText>
              </InputGroup>
            </Form>
            <Nav navbar>
              {/* 🆕 SELECTOR DE TENANT */}
              <NavItem style={{ marginRight: '15px' }}>
                <select
                  value={currentTenant}
                  onChange={handleTenantChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <option value="prueba">🏢 Prueba</option>
                  <option value="negocio2">🏢 Negocio 2</option>
                  <option value="negocioDemo">🏢 Negocio Demo</option>
                  <option value="negocio1">🏢 Negocio 1</option>
                  <option value="demo">🏢 Demo</option>
                </select>
              </NavItem>

              <NavItem>
                <NavLink
                  className="btn-magnify"
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="nc-icon nc-layout-11" />
                  <p>
                    <span className="d-lg-none d-md-block">Stats</span>
                  </p>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown className="btn-rotate" nav>
                <DropdownToggle
                  aria-haspopup={true}
                  caret
                  color="default"
                  data-toggle="dropdown"
                  id="navbarDropdownMenuLink"
                  nav
                >
                  <i className="nc-icon nc-bell-55" />
                  <p>
                    <span className="d-lg-none d-md-block">Notificaciones</span>
                  </p>
                </DropdownToggle>
                <DropdownMenu
                  persist
                  aria-labelledby="navbarDropdownMenuLink"
                  right
                >
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    Action
                  </DropdownItem>
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    Another action
                  </DropdownItem>
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    Something else here
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink
                  className="btn-rotate"
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="nc-icon nc-settings-gear-65" />
                  <p>
                    <span className="d-lg-none d-md-block">Account</span>
                  </p>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;