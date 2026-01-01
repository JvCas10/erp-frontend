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
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../api/clientes";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import { useTheme } from "../context/ThemeContext";

function Clientes() {
  const [clientesOriginal, setClientesOriginal] = useState([]);
  const [dataState, setDataState] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  const [clienteActual, setClienteActual] = useState({
    cliente_id: null,
    nombre_completo: "",
    correo: "",
    telefono: "",
    direccion: "",
    instagram_usuario: "",
    fecha_registro: "",
    estado: "activo",
  });

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientesOriginal(data);
      const formatted = data.map((cliente) => ({
        id: cliente.cliente_id,
        nombre: cliente.nombre_completo,
        correo: cliente.correo,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        instagram: cliente.instagram_usuario,
        actions: (
          <div className="actions-right">
            <Button
              color="success"
              size="sm"
              className="btn-round mr-1"
              onClick={() => handleEdit(cliente)}
            >
              <i className="fa fa-edit" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(cliente.cliente_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        ),
      }));
      setDataState(formatted);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleInputChange = (e) => {
    setClienteActual({ ...clienteActual, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (clienteActual.cliente_id) {
        response = await updateCliente(clienteActual);
      } else {
        const clienteConFecha = {
          ...clienteActual,
          fecha_registro: getCurrentDateTime(),
        };
        response = await createCliente(clienteConFecha);
      }

      alert(response.message);
      if (response.success) {
        setIsModalOpen(false);
        resetForm();
        fetchClientes();
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const handleEdit = (cliente) => {
    setClienteActual(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este cliente?")) return;
    try {
      const response = await deleteCliente(id);
      alert(response.message);
      if (response.success) fetchClientes();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const resetForm = () => {
    setClienteActual({
      cliente_id: null,
      nombre_completo: "",
      correo: "",
      telefono: "",
      direccion: "",
      instagram_usuario: "",
      fecha_registro: "",
      estado: "activo",
    });
  };

  const isFormValid =
    clienteActual.nombre_completo.trim() &&
    clienteActual.correo.trim() &&
    String(clienteActual.telefono).trim() &&
    clienteActual.direccion.trim() &&
    clienteActual.instagram_usuario.trim();

  const handleExport = () => {
    if (!clientesOriginal.length) {
      alert("No hay datos para exportar.");
      return;
    }

    const exportData = clientesOriginal.map(c => ({
      ID: c.cliente_id,
      Nombre: c.nombre_completo,
      Correo: c.correo,
      Teléfono: c.telefono,
      Dirección: c.direccion,
      Instagram: c.instagram_usuario
    }));

    exportJson2Csv(exportData, `clientes_${Date.now()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Clientes</CardTitle>
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
                  <i className="fa fa-download" /> Exportar Clientes
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Cliente
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={dataState}
                columns={[
                  { Header: "ID", accessor: "id" },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Correo", accessor: "correo" },
                  { Header: "Teléfono", accessor: "telefono" },
                  { Header: "Dirección", accessor: "direccion" },
                  { Header: "Instagram", accessor: "instagram" },
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
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
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

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          {clienteActual.cliente_id ? "Editar Cliente" : "Agregar Nuevo Cliente"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre Completo</Label>
                  <Input
                    name="nombre_completo"
                    value={clienteActual.nombre_completo}
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
                    value={clienteActual.correo}
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
                    value={clienteActual.telefono}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Dirección</Label>
                  <Input
                    name="direccion"
                    value={clienteActual.direccion}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label>Instagram</Label>
                  <Input
                    name="instagram_usuario"
                    value={clienteActual.instagram_usuario}
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
            {clienteActual.cliente_id ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Clientes;