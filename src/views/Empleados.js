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
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api/empleados";
import { getCurrentDateTime } from "../utils/dateUtils";
import { exportJson2Csv } from "../utils/exportUtils";
import { useTheme } from "../context/ThemeContext";

function Employees() {
  const { theme } = useTheme();

  const initialEmployee = {
    empleado_id: null,
    nombre_completo: "",
    telefono: "",
    correo: "",
    costo: "",
    fecha_registro: "",
  };

  const [empleados, setEmpleados] = useState([]);
  const [empleadosRaw, setEmpleadosRaw] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState(initialEmployee);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmpleadosRaw(data);
      const formatted = data.map((emp) => ({
        id: emp.empleado_id,
        nombre: emp.nombre_completo,
        correo: emp.correo,
        telefono: emp.telefono,
        costo: emp.costo,
        acciones: (
          <div className="actions-right" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="success"
              size="sm"
              className="btn-round mr-1"
              onClick={() => handleEdit(emp)}
            >
              <i className="fa fa-edit" />
            </Button>
            <Button
              color="danger"
              size="sm"
              className="btn-round"
              onClick={() => handleDelete(emp.empleado_id)}
            >
              <i className="fa fa-times" />
            </Button>
          </div>
        ),
      }));
      setEmpleados(formatted);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (empleado) => {
    setEmpleadoActual(empleado);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;
    try {
      const response = await deleteEmployee(id);
      alert(response.message);
      if (response.success) fetchEmployees();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const handleInputChange = (e) => {
    setEmpleadoActual({ ...empleadoActual, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const empleadoData = {
      ...empleadoActual,
      fecha_registro: getCurrentDateTime(),
    };

    try {
      let response;
      if (empleadoActual.empleado_id) {
        response = await updateEmployee(empleadoData);
      } else {
        response = await createEmployee(empleadoData);
      }

      alert(response.message);
      if (response.success) {
        setIsModalOpen(false);
        fetchEmployees();
        setEmpleadoActual(initialEmployee);
      }
    } catch (error) {
      console.error("Error al guardar empleado:", error);
    }
  };

  const isFormValid =
    empleadoActual.nombre_completo.trim() &&
    empleadoActual.correo.trim() &&
    String(empleadoActual.telefono).trim() &&
    empleadoActual.costo;

  const handleExport = () => {
    if (!empleadosRaw.length) {
      alert("No hay datos para exportar.");
      return;
    }
    exportJson2Csv(empleadosRaw, `empleados_${getCurrentDateTime()}.csv`);
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card className="w-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Empleados</CardTitle>
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
                  <i className="fa fa-download" /> Exportar Empleados
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    setEmpleadoActual(initialEmployee);
                    setIsModalOpen(true);
                  }}
                  style={{
                    backgroundColor: theme.secondaryColor,
                    borderColor: theme.secondaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="fa fa-plus" /> Nuevo Empleado
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <ReactTable
                data={empleados}
                columns={[
                  { Header: "ID", accessor: "id" },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Correo", accessor: "correo" },
                  { Header: "Teléfono", accessor: "telefono" },
                  { Header: "Costo", accessor: "costo" },
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
          {empleadoActual.empleado_id ? "Editar Empleado" : "Nuevo Empleado"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre Completo</Label>
                  <Input
                    name="nombre_completo"
                    value={empleadoActual.nombre_completo}
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
                    value={empleadoActual.correo}
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
                    value={empleadoActual.telefono}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Costo</Label>
                  <Input
                    name="costo"
                    type="number"
                    min="0"
                    value={empleadoActual.costo}
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
            {empleadoActual.empleado_id ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Employees;