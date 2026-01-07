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

import ReactTable from "components/ReactTable/ReactTable.js";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../api/proveedores";
import { useTheme } from "../context/ThemeContext";

function Proveedores() {
  const { theme } = useTheme();

  const initialProveedor = {
    proveedor_id: null,
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    fecha_registro: "",
  };

  const [proveedores, setProveedores] = useState([]);
  const [proveedoresRaw, setProveedoresRaw] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(initialProveedor);

  const fetchProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedoresRaw(data);
      const formatted = data.map((prov) => ({
        id: prov.proveedor_id,
        nombre: prov.nombre,
        correo: prov.correo,
        telefono: prov.telefono,
        direccion: prov.direccion,
        acciones: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="success"
              size="sm"
              className="btn-round mr-1"
              onClick={() => handleEdit(prov)}
            >
              <i className="fa fa-edit" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(prov.proveedor_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        ),
      }));
      setProveedores(formatted);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleEdit = (proveedor) => {
    setProveedorActual(proveedor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proveedor?")) return;
    try {
      const response = await deleteProveedor(id);
      alert(response.message);
      fetchProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // SOLO validar que teléfono sea numérico
    if (name === 'telefono') {
      // Si no está vacío Y no es número, no actualizar
      if (value !== '' && !/^\d+$/.test(value)) {
        alert("El teléfono solo puede contener números");
        return;
      }
    }
    
    setProveedorActual({ ...proveedorActual, [name]: value });
  };

  const handleSubmit = async () => {
    const proveedorData = {
      ...proveedorActual,
      fecha_registro: getCurrentDateTime(),
    };

    try {
      let response;
      if (proveedorActual.proveedor_id) {
        response = await updateProveedor(proveedorData);
      } else {
        response = await createProveedor(proveedorData);
      }

      alert(response.message);
      setIsModalOpen(false);
      fetchProveedores();
      setProveedorActual(initialProveedor);
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  const isFormValid =
    proveedorActual.nombre.trim() &&
    proveedorActual.correo.trim() &&
    String(proveedorActual.telefono).trim() &&
    proveedorActual.direccion.trim();

  const handleExport = () => {
    if (!proveedoresRaw.length) {
      alert("No hay datos para exportar.");
      return;
    }
    exportJson2Csv(proveedoresRaw, `proveedores_${getCurrentDateTime()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Proveedores</CardTitle>
              <div>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleExport}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.primaryColor,
                    color: "#fff",
                    marginRight: "10px",
                  }}
                >
                  <i className="fa fa-download" /> Exportar Proveedores
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    setProveedorActual(initialProveedor);
                    setIsModalOpen(true);
                  }}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Proveedor
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={proveedores}
                columns={[
                  { Header: "ID", accessor: "id" },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Correo", accessor: "correo" },
                  { Header: "Teléfono", accessor: "telefono" },
                  { Header: "Dirección", accessor: "direccion" },
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
          {proveedorActual.proveedor_id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre</Label>
                  <Input
                    name="nombre"
                    value={proveedorActual.nombre}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Correo</Label>
                  <Input
                    name="correo"
                    type="email"
                    value={proveedorActual.correo}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Teléfono</Label>
                  <Input
                    name="telefono"
                    value={proveedorActual.telefono}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Dirección</Label>
                  <Input
                    name="direccion"
                    value={proveedorActual.direccion}
                    onChange={handleInputChange}
                  />
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
            {proveedorActual.proveedor_id ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Proveedores;