import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Button
} from "reactstrap";

const DetallesCompraModal = ({ isOpen, onClose, detalles }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Detalles de la Compra</ModalHeader>
      <ModalBody>
        <Table responsive>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle, idx) => (
              <tr key={idx}>
                <td>{detalle.nombre}</td>
                <td>{detalle.cantidad}</td>
                <td>Q{detalle.precio_unitario}</td>
                <td>Q{(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="text-right mt-3">
          <Button color="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DetallesCompraModal;