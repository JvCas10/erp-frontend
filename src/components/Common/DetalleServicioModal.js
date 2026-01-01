import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Button,
  ModalFooter
} from "reactstrap";

const DetalleServicioModal = ({ isOpen, onClose, detalles = [] }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Detalles del Servicio</ModalHeader>
      <ModalBody>
        {detalles.length === 0 ? (
          <p>No hay productos asignados a este servicio.</p>
        ) : (
          <Table responsive striped>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Depreciación (%)</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((item, index) => (
                <tr key={index}>
                  <td>{item.producto_id}</td>
                  <td>{item.producto || "Sin nombre"}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.depreciacion}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DetalleServicioModal;