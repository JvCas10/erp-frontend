import Inventario from "views/Inventario";
import Clientes from "views/Clientes.js";
import Ventas from "views/Ventas.js";
import Servicios from "views/Servicios.js";
import Compras from "views/Compras.js";
import Proveedores from "views/Proveedores.js";
import Empleados from "views/Empleados.js";
import Config from "views/Config.js";
import ProductosCompuestos from "views/ProductosCompuestos.js";

const routes = [
  {
    path: "/inventario",
    name: "Inventario",
    icon: "nc-icon nc-single-copy-04",
    component: <Inventario />,
    layout: "/admin",
  },
  {
    path: "/productos-compuestos",
    name: "Prod. Compuestos",
    icon: "nc-icon nc-single-copy-04",  // ← MISMO ÍCONO QUE INVENTARIO
    component: <ProductosCompuestos />,
    layout: "/admin",
  },
  {
    path: "/clientes",
    name: "Clientes",
    icon: "nc-icon nc-circle-10",
    component: <Clientes />,
    layout: "/admin",
  },
  {
    path: "/ventas",
    name: "Ventas",
    icon: "nc-icon nc-cart-simple",
    component: <Ventas />,
    layout: "/admin",
  },
  {
    path: "/compras",
    name: "Compras",
    icon: "nc-icon nc-box-2",
    component: <Compras />,
    layout: "/admin",
  },
  {
    path: "/proveedores",
    name: "Proveedores",
    icon: "nc-icon nc-delivery-fast",
    component: <Proveedores />,
    layout: "/admin",
  },
  {
    path: "/empleados",
    name: "Empleados",
    icon: "nc-icon nc-badge",
    component: <Empleados />,
    layout: "/admin",
  },
  {
    path: "/servicios",
    name: "Servicios",
    icon: "nc-icon nc-bulb-63",
    component: <Servicios />,
    layout: "/admin",
  },
  {
    path: "/config",
    name: "Configuración",
    icon: "nc-icon nc-settings-gear-65",
    component: <Config />,
    layout: "/admin",
  }
];

export default routes;