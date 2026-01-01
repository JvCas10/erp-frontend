import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Button
} from "reactstrap";

const DetallesVentaModal = ({ isOpen, onClose, detalles = [], detallesServicio = [], detallesCompuestos = [] }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Detalles de la Venta</ModalHeader>
      <ModalBody>
        {detalles.length > 0 && (
          <>
            <h5>Productos</h5>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>Q{Number(item.precio_unitario).toFixed(2)}</td>
                    <td>Q{(item.cantidad * Number(item.precio_unitario)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {detallesCompuestos && detallesCompuestos.length > 0 && (
          <>
            <h5 className="mt-4">
              Productos Compuestos
              <span style={{
                marginLeft: '10px',
                fontSize: '12px',
                backgroundColor: '#51cbce',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Compuesto
              </span>
            </h5>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detallesCompuestos.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.nombre}
                      <br />
                      <small style={{ color: '#666' }}>
                        {item.descripcion || 'Producto compuesto'}
                      </small>
                    </td>
                    <td>{item.cantidad}</td>
                    <td>Q{Number(item.precio_unitario).toFixed(2)}</td>
                    <td>Q{(item.cantidad * Number(item.precio_unitario)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {detallesServicio.length > 0 && (
          <>
            <h5 className="mt-4">Servicios</h5>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detallesServicio.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>Q{Number(item.precio_unitario).toFixed(2)}</td>
                    <td>Q{(item.cantidad * Number(item.precio_unitario)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {detalles.length === 0 && detallesServicio.length === 0 && (!detallesCompuestos || detallesCompuestos.length === 0) && (
          <p className="text-center text-muted">No hay detalles disponibles para esta venta.</p>
        )}

        <div className="text-right mt-3">
          <Button color="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DetallesVentaModal;