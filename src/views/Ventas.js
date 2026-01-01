import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
import { useTheme } from "../context/ThemeContext";

import ReactTable from "components/ReactTable/ReactTable.js";
import SalesModal from "../components/Common/SalesModal";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import { getVentas, deleteVenta } from "../api/ventas";
import { obtenerInventario } from "../api/inventario";
import { getClientes } from "../api/clientes";
import { getServices } from "../api/servicios";
import DetallesVentaModal from "../components/Common/DetallesVentaModal";


function Ventas() {
  const { theme } = useTheme();

  const [ventas, setVentas] = useState([]);
  const [rawVentas, setRawVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [ventaDetalles, setVentaDetalles] = useState([]);
  const [ventaServicios, setVentaServicios] = useState([]);
  const [ventaCompuestos, setVentaCompuestos] = useState([]);


  const fetchData = async () => {
    try {
      const [v, p, s, c] = await Promise.all([
        getVentas(),
        obtenerInventario(),
        getServices(),
        getClientes(),
      ]);

      setProductos(p.filter((prod) => prod.estado === "activo"));
      setServicios(s.filter((srv) => srv.estado === "activo"));
      setClientes(c.filter((cl) => cl.estado === "activo"));

      setRawVentas(v);
      const formatted = v.map((venta) => ({
        id: venta.venta_id,
        cliente: venta.cliente?.nombre_completo || "N/A",
        total: venta.total,
        fecha: venta.fecha?.split("T")[0] || "",
        metodo: venta.metodo_pago,
        acciones: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="info"
              size="sm"
              className="btn-round"
              onClick={() => {
                setVentaDetalles(venta.detalles || []);
                setVentaServicios(venta.detalles_servicio || []);
                setVentaCompuestos(venta.detalles_compuesto || []);
                setIsDetallesOpen(true);
              }}
            >
              <i className="fa fa-eye" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(venta.venta_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        )
      }));
      setVentas(formatted);
    } catch (err) {
      console.error("Error al obtener datos de ventas:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta venta?")) return;
    try {
      const res = await deleteVenta(id);
      alert(res.message);
      if (res.success) fetchData();
    } catch (err) {
      console.error("Error al eliminar venta:", err);
    }
  };

  const handleExport = () => {
    const exportData = [];

    rawVentas.forEach((venta) => {
      const base = {
        venta_id: venta.venta_id,
        fecha: venta.fecha,
        total_venta: venta.total,
        metodo_pago: venta.metodo_pago,
        cliente_id: venta.cliente?.cliente_id,
        nombre_cliente: venta.cliente?.nombre_completo,
        correo_cliente: venta.cliente?.correo,
        telefono_cliente: venta.cliente?.telefono,
      };

      if (Array.isArray(venta.detalles)) {
        venta.detalles.forEach((d) => {
          exportData.push({
            ...base,
            tipo: d.tipo,
            nombre_item: d.nombre,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            producto_id: d.id,
            servicio_id: null,
            producto_compuesto_id: null,
          });
        });
      }

      if (Array.isArray(venta.detalles_compuesto)) {
        venta.detalles_compuesto.forEach((c) => {
          exportData.push({
            ...base,
            tipo: c.tipo,
            nombre_item: c.nombre,
            cantidad: c.cantidad,
            precio_unitario: c.precio_unitario,
            producto_id: null,
            servicio_id: null,
            producto_compuesto_id: c.id,
          });
        });
      }

      if (Array.isArray(venta.detalles_servicio)) {
        venta.detalles_servicio.forEach((s) => {
          exportData.push({
            ...base,
            tipo: s.tipo,
            nombre_item: s.nombre,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario,
            producto_id: null,
            servicio_id: s.id,
            producto_compuesto_id: null,
          });
        });
      }
    });

    exportJson2Csv(exportData, `ventas_${getCurrentDateTime()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4" className="w-100 text-center m-0">Ventas</CardTitle>
              <div style={{ position: "absolute", right: "1.5rem", top: "1.25rem" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleExport}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.primaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-download" /> Exportar Ventas
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                    marginLeft: "0.5rem",
                  }}
                >
                  <i className="fa fa-plus" /> Nueva Venta
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={ventas}
                columns={[
                  { Header: "ID", accessor: "id" },
                  { Header: "Cliente", accessor: "cliente" },
                  { Header: "Total", accessor: "total" },
                  { Header: "Fecha", accessor: "fecha" },
                  { Header: "Método de Pago", accessor: "metodo" },
                  {
                    Header: () => (
                      <div style={{ textAlign: "center", width: "100%" }}>
                        ACCIONES
                      </div>
                    ),
                    accessor: "acciones",
                    sortable: false,
                    filterable: false,
                  },
                ]}
                className="-striped -highlight primary-pagination"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Modal para crear/editar ventas */}
      {isModalOpen && (
        <SalesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fetchVentas={fetchData}
          fetchProducts={() => { }}
          fetchServices={() => { }}
          products={productos}
          services={servicios}
          clientes={clientes}
        />
      )}

      {/* Modal para detalles de venta */}
      {isDetallesOpen && (
        <DetallesVentaModal
          isOpen={isDetallesOpen}
          onClose={() => setIsDetallesOpen(false)}
          detalles={ventaDetalles}
          detallesServicio={ventaServicios}
          detallesCompuestos={ventaCompuestos}
        />
      )}
    </div>
  );
}

export default Ventas;