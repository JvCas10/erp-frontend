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
import { useTheme } from "../context/ThemeContext";

import ReactTable from "components/ReactTable/ReactTable.js";
import DynamicModal from "../components/Common/DynamicModal";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../api/servicios";
import { getEmployees } from "../api/empleados";
import { obtenerInventario } from "../api/inventario";
import DetalleServicioModal from "../components/Common/DetalleServicioModal";


function Services() {
  const { theme } = useTheme();

  const initialService = {
    nombre: "",
    descripcion: "",
    costo: "",
    precio: "",
    foto: null,
    foto_original: "",
    detalles: [],
    empleado_id: "",
  };

  const FILES_API = process.env.REACT_APP_SERVER_FILES;

  const [services, setServices] = useState([]);
  const [rawServices, setRawServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState(initialService);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [detallesServicio, setDetallesServicio] = useState([]);


  const fetchData = async () => {
    try {
      const [data, productsData, employeesData] = await Promise.all([
        getServices(),
        obtenerInventario(),
        getEmployees(),
      ]);

      console.log("Servicios obtenidos:", data);

      setRawServices(data);
      setProducts(productsData);
      setEmployees(employeesData);

      const formatted = data.map((srv) => ({
        id: srv.servicio_id,
        nombre: srv.nombre,
        foto: srv.foto || "Foto no disponible",
        descripcion: srv.descripcion,
        empleado: srv.empleado?.nombre_completo || "Sin asignar",
        costo: srv.costo,
        precio: srv.precio,
        acciones: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="info"
              size="sm"
              className="btn-round p-1"
              style={{ minWidth: "38px", minHeight: "38px" }}
              onClick={() => {
                setDetallesServicio(srv.detalles || []);
                setIsDetallesOpen(true);
              }}
            >
              <i className="fa fa-eye" />
            </Button>
            <Button
              color="success"
              size="sm"
              className="btn-round mr-1 p-1"
              style={{ minWidth: "38px", minHeight: "38px" }}
              onClick={() => handleEdit(srv)}
            >
              <i className="fa fa-edit" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round p-1"
              style={{ minWidth: "38px", minHeight: "38px" }}
              onClick={() => handleDelete(srv.servicio_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        )
      }));
      setServices(formatted);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (index, field, value) => {
    const detallesActualizados = serviceForm.detalles.map((detalle, i) =>
      i === index ? { ...detalle, [field]: value } : detalle
    );
    setServiceForm({ ...serviceForm, detalles: detallesActualizados });
  };

  const handleAddDetail = () => {
    setServiceForm({
      ...serviceForm,
      detalles: [
        ...serviceForm.detalles,
        { producto_id: "", cantidad: 1, depreciacion: 0 },
      ],
    });
  };

  const handleRemoveDetail = (index) => {
    const nuevosDetalles = [...serviceForm.detalles];
    nuevosDetalles.splice(index, 1);
    setServiceForm({ ...serviceForm, detalles: nuevosDetalles });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceForm(prev => ({
        ...prev,
        foto: file,
        foto_original: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!serviceForm.nombre || !serviceForm.descripcion ||
        !serviceForm.precio || !serviceForm.costo ||
        !serviceForm.detalles || serviceForm.detalles.length === 0 ||
        !serviceForm.empleado_id) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }

      const formData = new FormData();

      // Agregar campos básicos
      formData.append('nombre', serviceForm.nombre.trim());
      formData.append('descripcion', serviceForm.descripcion.trim());
      formData.append('precio', Number(serviceForm.precio).toString());
      formData.append('costo', Number(serviceForm.costo).toString());
      formData.append('empleado_id', serviceForm.empleado_id);

      // Si es una actualización, incluir el ID
      if (serviceForm.servicio_id) {
        formData.append('servicio_id', serviceForm.servicio_id.toString());
      }

      // Agregar foto si existe una nueva, sino mantener la actual
      if (serviceForm.foto instanceof File) {
        formData.append('foto', serviceForm.foto);
      } else if (serviceForm.foto_actual) { // Usamos foto_actual en lugar de foto_original
        formData.append('foto_actual', serviceForm.foto_actual);
      }

      // Agregar detalles con cantidades como números
      const detallesFormateados = serviceForm.detalles.map(d => ({
        ...d,
        cantidad: Number(d.cantidad),
        depreciacion: Number(d.depreciacion)
      }));
      formData.append('detalles', JSON.stringify(detallesFormateados));

      const response = serviceForm.servicio_id
        ? await updateService(formData)
        : await createService(formData);

      alert(response.message);
      if (response.success) {
        setIsModalOpen(false);
        fetchData();
        setServiceForm(initialService);
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    }
  };

  const handleEdit = (srv) => {
    const srvEditado = {
      ...srv,
      empleado_id: srv.empleado?.empleado_id || "",
      foto: null,
      foto_actual: srv.foto || "", // Guardamos el nombre del archivo actual
      foto_original: srv.foto ? `${FILES_API}/${srv.foto}` : "", // URL para mostrar la imagen usando FILES_API
      detalles: srv.detalles.map((d) => ({
        producto_id: d.producto_id || "",
        cantidad: d.cantidad || 1,
        depreciacion: d.depreciacion || 0,
      })),
    };

    setServiceForm(srvEditado);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const response = await deleteService(id);
      alert(response.message);
      if (response.success) fetchData();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
    }
  };

  const handleExport = () => {
    const rows = [];
    rawServices.forEach((srv) => {
      srv.detalles.forEach((d) => {
        rows.push({
          servicio_id: srv.servicio_id,
          nombre: srv.nombre,
          descripcion: srv.descripcion,
          precio: srv.precio,
          costo: srv.costo,
          estado: srv.estado,
          empleado_id: srv.empleado?.empleado_id,
          nombre_empleado: srv.empleado?.nombre_completo,
          correo: srv.empleado?.correo,
          telefono: srv.empleado?.telefono,
          producto_id: d.producto_id,
          producto: d.producto,
          cantidad: d.cantidad,
          depreciacion: d.depreciacion,
        });
      });
    });

    exportJson2Csv(rows, `servicios_${getCurrentDateTime()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Servicios</CardTitle>
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
                  <i className="fa fa-download" /> Exportar Servicios
                </Button>
                <Button
                  color="success"
                  size="sm"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                  onClick={() => {
                    setServiceForm({
                      ...initialService,
                      detalles: [{ producto_id: "", cantidad: 1, depreciacion: 0 }],
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Servicio
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={services}
                defaultPageSize={10}
                showPageSizeOptions={false}
                columns={[
                  {
                    Header: "ID",
                    accessor: "id"
                  },
                  {
                    Header: "Foto",
                    accessor: "foto",
                    Cell: ({ value }) => (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                  },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Descripción", accessor: "descripcion" },
                  { Header: "Empleado", accessor: "empleado" },
                  { Header: "Costo", accessor: "costo" },
                  { Header: "Precio", accessor: "precio" },
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

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          {serviceForm.servicio_id ? "Editar Servicio" : "Nuevo Servicio"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre</Label>
                  <Input
                    name="nombre"
                    value={serviceForm.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Empleado</Label>
                  <Input
                    type="select"
                    name="empleado_id"
                    value={serviceForm.empleado_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {employees.map((e) => (
                      <option key={e.empleado_id} value={e.empleado_id}>
                        {e.nombre_completo}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label>Descripción</Label>
              <Input
                name="descripcion"
                value={serviceForm.descripcion}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Precio de Venta</Label>
                  <Input
                    type="number"
                    name="precio"
                    value={serviceForm.precio}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Costo</Label>
                  <Input
                    type="number"
                    name="costo"
                    value={serviceForm.costo}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <FormGroup>
                  <Label>Foto del Servicio</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {serviceForm.foto_original && (
                    <img
                      src={serviceForm.foto_original}
                      alt="Vista previa"
                      style={{
                        marginTop: '10px',
                        maxWidth: '200px',
                        maxHeight: '200px'
                      }}
                    />
                  )}
                </FormGroup>
              </Col>
            </Row>

            <hr />
            <h5>Detalles del Servicio</h5>
            {serviceForm.detalles.map((detalle, index) => (
              <Row key={index} className="align-items-end">
                <Col md="4">
                  <FormGroup>
                    <Label>Producto</Label>
                    <Input
                      type="select"
                      value={detalle.producto_id}
                      onChange={(e) =>
                        handleDetailChange(index, "producto_id", e.target.value)
                      }
                      required
                    >
                      <option value="">Seleccione...</option>
                      {products.map((p) => (
                        <option key={p.producto_id} value={p.producto_id}>
                          {p.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md="2">
                  <FormGroup>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      value={detalle.cantidad}
                      onChange={(e) =>
                        handleDetailChange(index, "cantidad", e.target.value)
                      }
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md="2">
                  <FormGroup>
                    <Label>Depreciación</Label>
                    <Input
                      type="number"
                      value={detalle.depreciacion}
                      onChange={(e) =>
                        handleDetailChange(index, "depreciacion", e.target.value)
                      }
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md="2">
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleRemoveDetail(index)}
                    style={{ marginTop: "30px" }}
                  >
                    <i className="fa fa-trash" /> Eliminar
                  </Button>
                </Col>
              </Row>
            ))}

            <Button color="info" size="sm" onClick={handleAddDetail}>
              + Agregar Detalle
            </Button>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="success" onClick={handleSubmit}>
            {serviceForm.servicio_id ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </Modal>

      { /* Modal para detalles de servicio */}
      <DetalleServicioModal
        isOpen={isDetallesOpen}
        onClose={() => setIsDetallesOpen(false)}
        detalles={detallesServicio}
      />
    </div>
  );
}

export default Services;