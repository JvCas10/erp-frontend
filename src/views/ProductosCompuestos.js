import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
} from "reactstrap";
import ReactTable from "components/ReactTable/ReactTable.js";
import { useTheme } from "../context/ThemeContext";
import SweetAlert from "react-bootstrap-sweetalert";
import axiosInstance from "../api/axiosConfig";
import axios from "axios";

import {
  crearProductoCompuesto,
  actualizarProductoCompuesto,
} from "../api/productosCompuestos";


function ProductosCompuestos() {
  const [dataState, setDataState] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const { theme } = useTheme();
  const [alert, setAlert] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoCompuesto, setNuevoCompuesto] = useState({
    producto_compuesto_id: null,
    nombre: "",
    descripcion: "",
    precio_venta: "",
    foto: null,
    foto_original: "",
    componentes: [],
  });

  const [componenteActual, setComponenteActual] = useState({
    producto_id: "",
    cantidad: "",
  });

  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  // Cargar productos compuestos
  const fetchProductosCompuestos = async () => {
    try {
      const response = await axiosInstance.get("/productos-compuestos");
      const data = response.data.productos || [];

      const formattedData = data.map((item) => ({
        id: item.producto_compuesto_id,
        foto: item.foto || "",
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        precio_venta: item.precio_venta,
        costo_estimado: item.costo_estimado,
        utilidad: Number(item.precio_venta || 0) - Number(item.costo_estimado || 0),
        componentes: item.componentes,
        actions: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="info"
              size="sm"
              className="btn-round mr-1"
              onClick={() => verDetalles(item)}
            >
              <i className="fa fa-eye" />
            </Button>
            <Button
              color="success"
              size="sm"
              className="btn-round mr-1"
              onClick={() => handleEdit(item)}
            >
              <i className="fa fa-edit" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(item.producto_compuesto_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        ),
      }));
      setDataState(formattedData);
    } catch (error) {
      console.error("Error al obtener productos compuestos:", error);
      showAlert("error", "Error", "No se pudieron cargar los productos compuestos");
    }
  };

  // Cargar productos disponibles para componentes
  const fetchProductosDisponibles = async () => {
    try {
      const response = await axiosInstance.get("/inventario");
      const data = response.data.productos || [];
      setProductosDisponibles(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    fetchProductosCompuestos();
    fetchProductosDisponibles();
  }, []);

  const showAlert = (type, title, text) => {
    setAlert(
      <SweetAlert
        type={type}
        style={{ display: "block", marginTop: "-100px" }}
        title={title}
        onConfirm={() => setAlert(null)}
        onCancel={() => setAlert(null)}
        confirmBtnBsStyle="info"
      >
        {text}
      </SweetAlert>
    );
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setNuevoCompuesto({
      producto_compuesto_id: null,
      nombre: "",
      descripcion: "",
      precio_venta: "",
      foto: null,
      foto_original: "",
      componentes: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setNuevoCompuesto({
      producto_compuesto_id: item.producto_compuesto_id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio_venta: item.precio_venta,
      foto: null,
      foto_original: item.foto,
      componentes: item.componentes || [],
    });
    setIsModalOpen(true);
  };

  const verDetalles = (item) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={item.nombre}
        onConfirm={() => setAlert(null)}
        confirmBtnBsStyle="info"
      >
        <div style={{ textAlign: "left" }}>
          <p><strong>DescripciÃ³n:</strong> {item.descripcion}</p>
          <p><strong>Precio de Venta:</strong> Q{Number(item.precio_venta).toFixed(2)}</p>
          <p><strong>Costo Estimado:</strong> Q{Number(item.costo_estimado).toFixed(2)}</p>
          <p><strong>Componentes:</strong></p>
          <ul>
            {item.componentes && item.componentes.map((comp, idx) => (
              <li key={idx}>
                {comp.nombre}: {comp.cantidad} unidades (Stock: {comp.stock_disponible})
              </li>
            ))}
          </ul>
        </div>
      </SweetAlert>
    );
  };

  const agregarComponente = () => {
    if (!componenteActual.producto_id || !componenteActual.cantidad) {
      showAlert("warning", "AtenciÃ³n", "Debe seleccionar un producto y especificar la cantidad");
      return;
    }

    const productoSeleccionado = productosDisponibles.find(
      (p) => p.producto_id === parseInt(componenteActual.producto_id)
    );

    if (!productoSeleccionado) return;

    const nuevoComponente = {
      producto_id: productoSeleccionado.producto_id,
      nombre: productoSeleccionado.nombre,
      cantidad: parseFloat(componenteActual.cantidad),
      stock_disponible: productoSeleccionado.stock,
    };

    setNuevoCompuesto({
      ...nuevoCompuesto,
      componentes: [...nuevoCompuesto.componentes, nuevoComponente],
    });

    setComponenteActual({ producto_id: "", cantidad: "" });
  };

  const eliminarComponente = (index) => {
    const nuevosComponentes = nuevoCompuesto.componentes.filter((_, i) => i !== index);
    setNuevoCompuesto({ ...nuevoCompuesto, componentes: nuevosComponentes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevoCompuesto.nombre || !nuevoCompuesto.precio_venta) {
      showAlert("warning", "AtenciÃ³n", "Complete todos los campos requeridos");
      return;
    }

    if (!nuevoCompuesto.componentes.length) {
      showAlert("warning", "AtenciÃ³n", "Debe agregar al menos un componente");
      return;
    }

    try {
      const data = {
        producto_compuesto_id: nuevoCompuesto.producto_compuesto_id,
        nombre: nuevoCompuesto.nombre,
        descripcion: nuevoCompuesto.descripcion,
        precio_venta: nuevoCompuesto.precio_venta,
        foto: nuevoCompuesto.foto,
        foto_original: nuevoCompuesto.foto_original,
        componentes: nuevoCompuesto.componentes.map((c) => ({
          producto_id: c.producto_id,
          cantidad: c.cantidad,
        })),
      };

      const response = isEditing
        ? await actualizarProductoCompuesto(data)
        : await crearProductoCompuesto(data);

      showAlert("success", "Ã‰xito", response.message || "OperaciÃ³n exitosa");
      setIsModalOpen(false);
      fetchProductosCompuestos();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", "Error al guardar el producto compuesto");
    }
  };



  const handleDelete = (id) => {
    setAlert(
      <SweetAlert
        warning
        style={{ display: "block", marginTop: "-100px" }}
        title="Â¿EstÃ¡ seguro?"
        onConfirm={() => confirmarEliminar(id)}
        onCancel={() => setAlert(null)}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="SÃ­, eliminar"
        cancelBtnText="Cancelar"
        showCancel
      >
        Esta acciÃ³n no se puede deshacer
      </SweetAlert>
    );
  };

  const confirmarEliminar = async (id) => {
    try {
      await axiosInstance.delete(`/productos-compuestos/${id}`);
      showAlert("success", "Eliminado", "Producto compuesto eliminado correctamente");
      fetchProductosCompuestos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showAlert("error", "Error", "No se pudo eliminar el producto compuesto");
    }
  };

  return (
    <>
      <div className="content">
        {alert}
        <Row>
          <Col md="12">
            <Card className="w-100">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle tag="h4">Productos Compuestos</CardTitle>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleOpenModal}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Producto Compuesto
                </Button>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={dataState}
                  columns={[
                    {
                      Header: "ID",
                      accessor: "id",
                    },
                    {
                      Header: "Foto",
                      accessor: "foto",
                      Cell: ({ value }) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {value ? (
                            <img
                              src={`${FILES_API}/${value}`}
                              alt="Producto"
                              style={{
                                width: "70px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "5px",
                              }}
                            />
                          ) : (
                            "Sin foto"
                          )}
                        </div>
                      ),
                      sortable: false,
                      filterable: false,
                    },
                    { Header: "Nombre", accessor: "nombre" },
                    { Header: "DescripciÃ³n", accessor: "descripcion" },
                    {
                      Header: "Precio Venta",
                      accessor: "precio_venta",
                      Cell: ({ value }) => `Q${Number(value).toFixed(2)}`,
                    },
                    {
                      Header: "Costo Estimado",
                      accessor: "costo_estimado",
                      Cell: ({ value }) => `Q${Number(value).toFixed(2)}`,
                    },
                    {
                      Header: "Utilidad",
                      accessor: "utilidad",
                      Cell: ({ value }) => (
                        <span style={{
                          color: value >= 0 ? "#2ecc71" : "#e74c3c",
                          fontWeight: "bold"
                        }}>
                          Q{Number(value).toFixed(2)}
                        </span>
                      ),
                    },
                    {
                      Header: () => (
                        <div style={{ textAlign: "center", width: "100%" }}>
                          ACCIONES
                        </div>
                      ),
                      accessor: "actions",
                      sortable: false,
                      filterable: false,
                      Cell: ({ value }) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {value}
                        </div>
                      ),
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modal Agregar/Editar */}
        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg">
          <ModalHeader toggle={() => setIsModalOpen(false)}>
            {isEditing ? "Editar Producto Compuesto" : "Nuevo Producto Compuesto"}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label>Nombre *</Label>
                    <Input
                      type="text"
                      value={nuevoCompuesto.nombre}
                      onChange={(e) =>
                        setNuevoCompuesto({ ...nuevoCompuesto, nombre: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Precio de Venta *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={nuevoCompuesto.precio_venta}
                      onChange={(e) =>
                        setNuevoCompuesto({ ...nuevoCompuesto, precio_venta: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>DescripciÃ³n</Label>
                <Input
                  type="textarea"
                  value={nuevoCompuesto.descripcion}
                  onChange={(e) =>
                    setNuevoCompuesto({ ...nuevoCompuesto, descripcion: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Foto del producto</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNuevoCompuesto({
                      ...nuevoCompuesto,
                      foto: e.target.files[0],
                    })
                  }
                />
              </FormGroup>

              {(nuevoCompuesto.foto || nuevoCompuesto.foto_original) && (
                <div style={{ marginBottom: "15px" }}>
                  <img
                    src={
                      nuevoCompuesto.foto
                        ? URL.createObjectURL(nuevoCompuesto.foto)
                        : `${FILES_API}/${nuevoCompuesto.foto_original}`
                    }
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              )}

              <hr />
              <h5>Componentes</h5>

              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label>Producto</Label>
                    <Input
                      type="select"
                      value={componenteActual.producto_id}
                      onChange={(e) =>
                        setComponenteActual({ ...componenteActual, producto_id: e.target.value })
                      }
                    >
                      <option value="">Seleccione un producto</option>
                      {productosDisponibles.map((p) => (
                        <option key={p.producto_id} value={p.producto_id}>
                          {p.nombre} (Stock: {p.stock})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={componenteActual.cantidad}
                      onChange={(e) =>
                        setComponenteActual({ ...componenteActual, cantidad: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md="2" className="d-flex align-items-end">
                  <Button color="success" onClick={agregarComponente} block>
                    <i className="fa fa-plus" />
                  </Button>
                </Col>
              </Row>

              {nuevoCompuesto.componentes.length > 0 && (
                <Table size="sm" striped>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Stock Disponible</th>
                      <th>AcciÃ³n</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nuevoCompuesto.componentes.map((comp, index) => (
                      <tr key={index}>
                        <td>{comp.nombre}</td>
                        <td>{comp.cantidad}</td>
                        <td>{comp.stock_disponible}</td>
                        <td>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => eliminarComponente(index)}
                          >
                            <i className="fa fa-times" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button color="primary" type="submit">
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default ProductosCompuestos;