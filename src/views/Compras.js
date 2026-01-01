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
import CompraModal from "../components/Common/CompraModal";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import { getCompras, deleteCompra } from "../api/compras";
import { obtenerInventario } from "../api/inventario";
import { getProveedores } from "../api/proveedores";
import DetallesCompraModal from "../components/Common/DetallesCompraModal";

function Compras() {
  const { theme } = useTheme();
  const [compras, setCompras] = useState([]);
  const [comprasOriginal, setComprasOriginal] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [detallesSeleccionados, setDetallesSeleccionados] = useState([]);

  const fetchCompras = async () => {
    try {
      const data = await getCompras();
      console.log("Compras obtenidas:", data);
      setComprasOriginal(data);
      const formatted = data.map((compra) => ({
        id: compra.compra_id,
        proveedor: compra.proveedor.nombre,
        total: compra.total,
        fecha: compra.fecha.split("T")[0],
        acciones: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="info"
              size="sm"
              className="btn-round"
              onClick={() => {
                setDetallesSeleccionados(compra.detalles);
                setIsDetallesOpen(true);
              }}
            >
              <i className="fa fa-eye" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(compra.compra_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        )
      }));
      setCompras(formatted);
    } catch (error) {
      console.error("Error al obtener compras:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const data = await obtenerInventario();
      const activos = data.filter((p) => p.estado === "activo");
      setProductos(activos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const data = await getProveedores();
      const activos = data.filter((p) => p.estado === "activo");
      setProveedores(activos);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  useEffect(() => {
    fetchCompras();
    fetchProductos();
    fetchProveedores();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta compra?")) return;
    try {
      const response = await deleteCompra(id);
      alert(response.message);
      if (response.success) {
        fetchCompras();
        fetchProductos();
      }
    } catch (error) {
      console.error("Error al eliminar compra:", error);
    }
  };

  const handleExport = () => {
    const exportData = [];

    comprasOriginal.forEach((compra) => {
      compra.detalles.forEach((detalle) => {
        exportData.push({
          fecha: compra.fecha,
          total_compra: compra.total,
          proveedor_id: compra.proveedor.proveedor_id,
          nombre_proveedor: compra.proveedor.nombre,
          correo_proveedor: compra.proveedor.correo,
          telefono_proveedor: compra.proveedor.telefono,
          producto_id: detalle.producto_id,
          nombre_producto: detalle.nombre,
          cantidad_producto: detalle.cantidad,
          precio_unitario_producto: detalle.precio_unitario,
          compra_id: compra.compra_id,
        });
      });
    });

    exportJson2Csv(exportData, `compras_${getCurrentDateTime()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12" style={{ width: "100%" }}>
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Compras</CardTitle>
              <div>
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
                  <i className="fa fa-download" /> Exportar Compras
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nueva Compra
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={compras}
                columns={[
                  { Header: "ID", accessor: "id", show: false },
                  { Header: "Proveedor", accessor: "proveedor" },
                  {
                    Header: "Total", accessor: "total",
                    Cell: ({ value }) => `Q${Number(value).toFixed(2)}`
                  },
                  { Header: "Fecha", accessor: "fecha" },
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

      {/* Modal de compras */}
      {isModalOpen && (
        <CompraModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          products={productos}
          proveedores={proveedores}
          fetchProducts={fetchProductos}
          fetchCompras={fetchCompras}
        />
      )}

      {/* Modal de detalles de compra */}
      {isDetallesOpen && (
        <DetallesCompraModal
          isOpen={isDetallesOpen}
          onClose={() => setIsDetallesOpen(false)}
          detalles={detallesSeleccionados}
        />
      )}
    </div>
  );
}

export default Compras;