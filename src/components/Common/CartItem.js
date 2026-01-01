import React from "react";
import "../../assets/styles/CartItem.css";
import regaloImg from "../../assets/regalo.png"; // Imagen de respaldo
import { useTheme } from "../../context/ThemeContext";
import { Button } from "reactstrap";

const CartItem = ({ item, increaseQuantity, decreaseQuantity }) => {

  const { theme } = useTheme();
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  console.log("CartItem", item);
  console.log("CartItem FILES_API:", FILES_API);

  const itemImage = () => {
    if (item.foto && item.foto !== "Foto no disponible") {
      const imageUrl = `${FILES_API}${item.foto}`;
      console.log("CartItem - Usando imagen del servidor:", imageUrl);
      return imageUrl;
    } else {
      console.log("CartItem - Usando imagen por defecto, foto:", item.foto);
      return regaloImg;
    }
  };

  // Manejar el aumento de cantidad
  const handleIncrease = () => {
    // Si es un producto, verificar stock
    if (item.itemType === 'producto' && item.stock <= 0) {
      console.log("No hay stock suficiente");
      return;
    }

    increaseQuantity(item);
  }

  // Manejar la disminución de cantidad
  const handleDecrease = () => {
    decreaseQuantity(item);
  }

  // Obtener precio de forma segura
  const precioUnitario = Number(item.precio || 0);
  const precioTotal = precioUnitario * item.cantidad;

  return (
    <div className="cart-item">
      {/* Imagen */}
      <div className="cart-item-img-container">
        <img
          src={itemImage()}
          alt={item.nombre}
          className="cart-item-img"
        />
      </div>

      {/* Información */}
      <div className="cart-item-info">
        <span className="cart-item-name">{item.nombre}</span>
        <p className="cart-item-description">{item.descripcion}</p>
        {/* Mostrar badge si es producto compuesto */}
        {item.itemType === 'producto_compuesto' && (
          <span style={{
            display: 'inline-block',
            backgroundColor: '#51cbce',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            marginTop: '4px'
          }}>
            Producto Compuesto
          </span>
        )}
      </div>

      {/* Precio Unitario */}
      <div className="cart-item-price-unit">Q{precioUnitario.toFixed(2)}</div>

      {/* Campo para cantidad */}
      <div className="cart-item-input-group">
        <label className="cart-item-label">Cantidad</label>
        <input
          type="number"
          className="cart-item-input"
          value={item.cantidad}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value, 10) || 1;
            const currentQuantity = item.cantidad;
            
            if (newQuantity > currentQuantity) {
              // Aumentar cantidad
              for (let i = 0; i < (newQuantity - currentQuantity); i++) {
                handleIncrease();
              }
            } else if (newQuantity < currentQuantity) {
              // Disminuir cantidad
              for (let i = 0; i < (currentQuantity - newQuantity); i++) {
                handleDecrease();
              }
            }
          }}
          min="1"
        />
      </div>

      {/* Símbolo "=" */}
      <div className="cart-item-equal">=</div>

      {/* Precio Total */}
      <div className="cart-item-price-total">Q{precioTotal.toFixed(2)}</div>
    </div>
  );
};

export default CartItem;










