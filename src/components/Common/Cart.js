import React, { useState } from "react";
import CartItem from "./CartItem";
import CartPurchaseItem from "./CartPurchaseItem";
import { Button } from "reactstrap";

const Cart = ({ cartItems, increaseQuantity, decreaseQuantity, removeItem, isPurchase, clients, providers, handlePriceChange, handleQuantityChange, handleRemoveCart, handleSubmit }) => {
  const [selectedClientOrProvider, setSelectedClientOrProvider] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const totalPrice = cartItems.reduce((acc, product) => acc + (isPurchase ? product.precio : product.precio) * product.cantidad, 0);

  const isCheckoutEnabled = cartItems.length > 0 && selectedClientOrProvider && (!isPurchase ? paymentMethod : true) && totalPrice > 0;

  return (
    <>
      <style>{`
        .cart-master-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          height: 100%;
        }
        
        .cart-section {
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .cart-section-title {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #51cbce;
        }
        
        .cart-products-list {
          max-height: 300px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .cart-empty {
          text-align: center;
          padding: 30px 20px;
          color: #999;
        }
        
        .cart-empty i {
          font-size: 40px;
          margin-bottom: 10px;
          opacity: 0.5;
        }
        
        .cart-empty p {
          margin: 0;
          font-size: 14px;
        }
        
        .cart-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 10px;
          background: #fff;
          cursor: pointer;
        }
        
        .cart-select:focus {
          outline: none;
          border-color: #51cbce;
        }
        
        .cart-client-info {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .cart-client-info p {
          margin: 5px 0;
          font-size: 13px;
          color: #666;
        }
        
        .cart-client-info strong {
          color: #333;
        }
        
        .cart-checkout-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
          padding: 15px 20px;
          border-radius: 12px;
          margin-top: 10px;
        }
        
        .cart-total-price {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        
        .cart-checkout-btn {
          background: rgba(255,255,255,0.2) !important;
          border: 2px solid #fff !important;
          color: #fff !important;
          padding: 10px 25px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }
        
        .cart-checkout-btn:hover:not(:disabled) {
          background: #fff !important;
          color: #ff6b6b !important;
        }
        
        .cart-checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 500px) {
          .cart-checkout-footer {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .cart-checkout-btn {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="cart-master-container">
        {/* Lista de productos */}
        <div className="cart-section">
          <h3 className="cart-section-title">
            {isPurchase ? "Productos a Comprar" : "Tu Carrito"}
          </h3>
          <div className="cart-products-list">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <i className="fa fa-shopping-cart" />
                <p>No hay productos en el carrito</p>
              </div>
            ) : (
              cartItems.map((cartItem) => {
                const itemIdKey = cartItem.itemType === "producto" 
                  ? cartItem.producto_id 
                  : cartItem.itemType === "servicio"
                  ? cartItem.servicio_id
                  : cartItem.producto_compuesto_id;

                return isPurchase ? (
                  <CartPurchaseItem
                    key={cartItem.producto_id}
                    product={cartItem}
                    handlePriceChange={handlePriceChange}
                    handleQuantityChange={handleQuantityChange}
                    removeItem={handleRemoveCart}
                  />
                ) : (
                  <CartItem
                    key={`${cartItem.itemType}-${itemIdKey}`}
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
        <div className="cart-section">
          <h3 className="cart-section-title">
            Seleccionar {isPurchase ? "Proveedor" : "Cliente"}
          </h3>
          
          <select
            className="cart-select"
            onChange={(e) => {
              const entity = isPurchase
                ? providers.find((p) => p.proveedor_id === Number(e.target.value))
                : clients.find((c) => c.cliente_id === Number(e.target.value));
              setSelectedClientOrProvider(entity);
            }}
          >
            <option value="">Selecciona {isPurchase ? "un proveedor" : "un cliente"}</option>
            {(isPurchase ? providers : clients)?.map((entity) => (
              <option 
                key={isPurchase ? entity.proveedor_id : entity.cliente_id} 
                value={isPurchase ? entity.proveedor_id : entity.cliente_id}
              >
                {isPurchase ? entity.nombre : entity.nombre_completo}
              </option>
            ))}
          </select>

          {!isPurchase && (
            <select 
              className="cart-select" 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecciona un método de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          )}

          {selectedClientOrProvider && (
            <div className="cart-client-info">
              <p><strong>ID:</strong> {isPurchase ? selectedClientOrProvider.proveedor_id : selectedClientOrProvider.cliente_id}</p>
              <p><strong>Email:</strong> {selectedClientOrProvider.correo}</p>
              <p><strong>Teléfono:</strong> {selectedClientOrProvider.telefono}</p>
              <p><strong>Dirección:</strong> {selectedClientOrProvider.direccion}</p>
              {!isPurchase && selectedClientOrProvider.instagram_usuario && (
                <p><strong>Instagram:</strong> @{selectedClientOrProvider.instagram_usuario}</p>
              )}
              {!isPurchase && paymentMethod && (
                <p><strong>Método de Pago:</strong> {paymentMethod}</p>
              )}
            </div>
          )}
        </div>

        {/* Resumen y Checkout */}
        <div className="cart-section">
          <h3 className="cart-section-title">Resumen</h3>
          <div className="cart-checkout-footer">
            <span className="cart-total-price">Q{totalPrice.toFixed(2)}</span>
            <Button
              className="cart-checkout-btn"
              disabled={!isCheckoutEnabled}
              onClick={() => {
                isPurchase
                  ? handleSubmit(cartItems, selectedClientOrProvider, totalPrice.toFixed(2))
                  : handleSubmit(cartItems, selectedClientOrProvider, paymentMethod, totalPrice.toFixed(2));
              }}
            >
              {isPurchase ? "REGISTRAR COMPRA" : "REGISTRAR VENTA"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;