import React, { useState } from "react";
import CartItem from "./CartItem"; // Para ventas
import CartPurchaseItem from "./CartPurchaseItem"; // Para compras
import "../../assets/styles/Cart.css"; // Archivo de estilos
import { Button } from "reactstrap";

const Cart = ({ cartItems, increaseQuantity, decreaseQuantity, isPurchase, clients, providers, handleQuantityChange, handleRemoveCart, removeItem, handleSubmit }) => {
  const [selectedClientOrProvider, setSelectedClientOrProvider] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Calcular el total dinámico - COSTO para compras, PRECIO para ventas
  const totalPrice = cartItems.reduce((acc, product) => {
    const unitPrice = isPurchase ? Number(product.costo || 0) : Number(product.precio || 0);
    return acc + unitPrice * product.cantidad;
  }, 0);

  // Verificar si el botón debe estar habilitado (solo en ventas)
  const isCheckoutEnabled = cartItems.length > 0 && selectedClientOrProvider && (!isPurchase ? paymentMethod : true) && totalPrice > 0;

  return (
    <div className="master-container">
      {/* Carrito de compras o compras */}
      <div className="card-venta cart">
        <label className="title">{isPurchase ? "Productos a Comprar" : "Tu Carrito"}</label>
        <div className="products">
          {cartItems.length === 0 ? (
            <p className="empty-cart">No hay productos o servicios en el carrito</p>
          ) : (
            cartItems.map((cartItem) => {
              const itemIdKey = cartItem.itemType === "producto" ? cartItem.producto_id : cartItem.servicio_id;

              return isPurchase ? (
                <CartPurchaseItem
                  key={cartItem.producto_id}
                  product={cartItem}
                  handleQuantityChange={handleQuantityChange}
                  removeItem={handleRemoveCart}
                />
              ) : (
                <CartItem
                  key={itemIdKey}
                  item={cartItem}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                  removeItem={removeItem}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Selección de Cliente o Proveedor */}
      <div className="card-venta client-selection">
        <label className="title">Seleccionar {isPurchase ? "Proveedor" : "Cliente"}</label>
        <select
          className="client-select"
          onChange={(e) => {
            const entity = isPurchase
              ? providers.find((p) => p.proveedor_id === Number(e.target.value))
              : clients.find((c) => c.cliente_id === Number(e.target.value));
            setSelectedClientOrProvider(entity);
          }}
        >
          <option value="">Selecciona {isPurchase ? "un proveedor" : "un cliente"}</option>
          {(isPurchase ? providers : clients).map((entity) => (
            <option key={isPurchase ? entity.proveedor_id : entity.cliente_id} value={isPurchase ? entity.proveedor_id : entity.cliente_id}>
              {isPurchase ? entity.nombre : entity.nombre_completo}
            </option>
          ))}
        </select>

        {!isPurchase && (
          <select className="payment-select" onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Selecciona un método de pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        )}
      </div>

      {/* Resumen */}
      <div className="card-venta checkout">
        <label className="title">Datos</label>
        {selectedClientOrProvider && (
          <div className="client-info">
            <p><strong>ID:</strong> {isPurchase ? selectedClientOrProvider.proveedor_id : selectedClientOrProvider.cliente_id}</p>
            <p><strong>Email:</strong> {selectedClientOrProvider.correo}</p>
            <p><strong>Teléfono:</strong> {selectedClientOrProvider.telefono}</p>
            <p><strong>Dirección:</strong> {selectedClientOrProvider.direccion}</p>
            {!isPurchase && <p><strong>Instagram:</strong> @{selectedClientOrProvider.instagram_usuario}</p>}
            {!isPurchase && <p><strong>Método de Pago:</strong> {paymentMethod} </p>}
          </div>
        )}
        <div className="checkout--footer">
          <label className="price">Q{totalPrice.toFixed(2)}</label>
          <Button
            className="checkout-btn"
            disabled={!isCheckoutEnabled}
            onClick={() => {
              isPurchase
                ? handleSubmit(cartItems, selectedClientOrProvider, totalPrice.toFixed(2))
                : handleSubmit(cartItems, selectedClientOrProvider, paymentMethod, totalPrice.toFixed(2));
            }}
          >
            {isPurchase ? "Registrar Compra" : "Registrar Venta"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;