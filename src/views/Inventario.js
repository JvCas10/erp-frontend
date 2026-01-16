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
} from "reactstrap";
import ReactTable, { RangeSliderFilter } from "components/ReactTable/ReactTable.js";
import {
  obtenerInventario,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../api/inventario";

import { getCategoriasProductos } from "../api/filters";
import { getCurrentDateTime } from "../utils/dateUtils";
import { useTheme } from "../context/ThemeContext";

function Inventario() {
  const [dataState, setDataState] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const { theme } = useTheme();

  const [inventarioOriginal, setInventarioOriginal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    producto_id: null,
    nombre: "",
    descripcion: "",
    categoria: "",
    segmento: "",
    precio: "",
    costo: "",
    stock: "",
    color: "",
    foto: null,
    foto_original: "",
    fecha_registro: null,
  });


  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  // Helper para obtener la URL correcta de la imagen
  const getImageUrl = (foto) => {
    if (!foto) return null;
    // Si ya es una URL completa (Cloudinary), usarla directamente
    if (foto.startsWith('http')) return foto;
    // Si es un archivo local, usar FILES_API
    return `${FILES_API}/${foto}`;
  };

  // Cargar inventario
  const fetchInventario = async () => {
    try {
      const data = await obtenerInventario();
      setInventarioOriginal(data);
      const formattedData = data.map((item) => ({
        id: item.producto_id,
        foto: item.foto || "",
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        color: item.color || "",
        categoria: item.categoria,
        segmento: item.segmento,
        precio: item.precio,
        costo: item.costo ?? 0,
        utilidad: Number(item.precio) - Number(item.costo ?? 0),
        stock: item.stock,
        producto_id: item.producto_id,
        fecha_registro: item.fecha_registro,
        actions: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
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
              onClick={() => handleDelete(item.producto_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        ),
      }));
      setDataState(formattedData);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await getCategoriasProductos();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    fetchInventario();
    fetchCategorias();
  }, []);

  // Manejo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Preparar los datos para enviar (objeto, no FormData)
      const productoData = {
        nombre: nuevoProducto.nombre || "",
        descripcion: nuevoProducto.descripcion || "",
        segmento: nuevoProducto.segmento || "",
        categoria: nuevoProducto.categoria || "",
        precio: nuevoProducto.precio || "",
        costo: nuevoProducto.costo || "",
        stock: nuevoProducto.stock || "",
        color: nuevoProducto.color || "",
        fecha_registro: nuevoProducto.fecha_registro || getCurrentDateTime(),
      };

      // Agregar producto_id solo si estamos editando
      if (isEditing && nuevoProducto.producto_id != null) {
        productoData.producto_id = nuevoProducto.producto_id;
      }

      // Manejar la foto
      if (nuevoProducto.foto instanceof File) {
        productoData.foto = nuevoProducto.foto;
      } else if (isEditing && nuevoProducto.foto_original) {
        productoData.foto_actual = nuevoProducto.foto_original;
      }

      // El servicio se encarga de convertir a FormData
      const response = isEditing
        ? await actualizarProducto(productoData)
        : await crearProducto(productoData);

      console.log("Respuesta del servidor:", response);

      if (response.success || response.status === "success") {
        alert(response.message || "Operación realizada con éxito");
        setIsModalOpen(false);
        fetchInventario();
        resetForm();
        setIsEditing(false);
      } else {
        alert(response.message || "Error en la operación");
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto: " + (error.message || error));
    }
  };

  const handleEdit = (producto) => {
    setIsEditing(true);
    setNuevoProducto({
      producto_id: Number(producto.producto_id),
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      segmento: producto.segmento || "",
      categoria: producto.categoria || "",
      precio: producto.precio != null ? Number(producto.precio) : "",
      costo: producto.costo != null ? Number(producto.costo) : "",
      stock: producto.stock != null ? Number(producto.stock) : "",
      color: producto.color || "",
      foto_original: producto.foto || "",
      foto: null,
      fecha_registro: producto.fecha_registro || getCurrentDateTime(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este producto?")) return;
    try {
      const response = await eliminarProducto(id);
      alert(response.message);
      if (response.success) fetchInventario();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const resetForm = () => {
    setNuevoProducto({
      producto_id: null,
      nombre: "",
      descripcion: "",
      categoria: "",
      segmento: "",
      precio: "",
      stock: "",
      color: "",
      foto: null,
      foto_original: "",
      fecha_registro: null,
    });
  };

  const openNuevoProducto = () => {
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Validación: todos los campos requeridos llenos
  const isFormValid =
    String(nuevoProducto.nombre || "").trim() &&
    String(nuevoProducto.descripcion || "").trim() &&
    String(nuevoProducto.categoria || "").trim() &&
    String(nuevoProducto.segmento || "").trim() &&
    nuevoProducto.precio !== "" &&
    nuevoProducto.stock !== "" &&
    nuevoProducto.costo !== "" &&
    String(nuevoProducto.color || "").trim();

  // Exportar Inventario
  const handleExport = () => {
    if (!inventarioOriginal.length) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Nombre",
      "Descripción",
      "Categoría",
      "Segmento",
      "Precio",
      "Stock",
      "Color",
    ];

    const rows = inventarioOriginal.map((item) => [
      item.producto_id,
      item.nombre,
      item.descripcion || "",
      item.categoria || "",
      item.segmento || "",
      item.precio,
      item.stock,
      item.color || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="content">
      <Row>
        <Col md="12" style={{ width: "100%" }}>
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Inventario</CardTitle>
              <div>
                <Button
                  size="sm"
                  onClick={handleExport}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.primaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-download" /> Exportar Inventario
                </Button>

                <Button
                  size="sm"
                  onClick={openNuevoProducto}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Producto
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={dataState}
                columns={[
                  { Header: "ID", accessor: "id" },
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
                            src={getImageUrl(value)}
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
                  { Header: "Descripción", accessor: "descripcion" },
                  { Header: "Categoría", accessor: "categoria" },
                  { Header: "Segmento", accessor: "segmento" },
                  { Header: "Color", accessor: "color" },
                  {
                    Header: "Precio",
                    accessor: "precio",
                    Filter: RangeSliderFilter,
                    filter: "precio",
                    Cell: ({ value }) => `Q${Number(value).toFixed(2)}`,
                  },
                  {
                    Header: "Costo",
                    accessor: "costo",
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
                    Header: "Stock",
                    accessor: "stock",
                  },
                  {
                    Header: "ACCIONES",
                    accessor: "actions",
                    disableFilters: true,
                    disableSortBy: true,
                    width: 160,
                    minWidth: 160,
                    maxWidth: 160,
                    Cell: ({ value }) => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        {value}
                      </div>
                    ),
                  }

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
          {isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre *</Label>
                  <Input
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Descripción *</Label>
                  <Input
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Segmento *</Label>
                  <Input
                    type="text"
                    name="segmento"
                    value={nuevoProducto.segmento}
                    onChange={handleInputChange}
                    placeholder="Escribe el segmento"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Categoría *</Label>
                  <Input
                    list="categoriasList"
                    name="categoria"
                    value={nuevoProducto.categoria}
                    onChange={handleInputChange}
                    required
                  />
                  <datalist id="categoriasList">
                    {categorias.map((cat, index) => (
                      <option key={index} value={cat} />
                    ))}
                  </datalist>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Precio *</Label>
                  <Input
                    type="number"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Costo *</Label>
                  <Input
                    type="number"
                    name="costo"
                    value={nuevoProducto.costo}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    name="stock"
                    value={nuevoProducto.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Color *</Label>
                  <Input
                    name="color"
                    value={nuevoProducto.color}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Foto</Label>
                  <Input
                    type="file"
                    name="foto"
                    accept="image/*"
                    onChange={(e) =>
                      setNuevoProducto((prev) => ({
                        ...prev,
                        foto: e.target.files[0],
                      }))
                    }
                  />
                  {isEditing && !nuevoProducto.foto && nuevoProducto.foto_original && (
                    <div style={{ marginTop: "8px" }}>
                      <small>Foto actual:</small>
                      <img 
                        src={getImageUrl(nuevoProducto.foto_original)} 
                        alt="Foto actual"
                        style={{ 
                          width: "60px", 
                          height: "60px", 
                          objectFit: "cover",
                          borderRadius: "5px",
                          marginLeft: "10px"
                        }}
                      />
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="success" onClick={handleSubmit} disabled={!isFormValid}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Inventario;