import React from "react";
import "../../assets/styles/CartPurchaseItem.css";
import regaloImg from "../../assets/regalo.png"; // Imagen de respaldo

const CartPurchaseItem = ({ product, handleQuantityChange, removeItem }) => {
  
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  // Verificar si la imagen existe, si no, usar imagen de respaldo
  const productImage = () => {
    if (product.foto && product.foto !== "Foto no disponible") {
      const imageUrl = `${FILES_API}${product.foto}`;
      return imageUrl;
    } else {
      return regaloImg;
    }
  };

  const costo = Number(product.costo || 0);
  const cantidad = Number(product.cantidad || 1);
  const total = costo * cantidad;

  return (
    <div className="cart-item">
      {/* Imagen */}
      <div className="cart-item-img-container">
        <img src={productImage()} alt={product.nombre} className="cart-item-img" />
      </div>

      {/* Información */}
      <div className="cart-item-info">
        <span className="cart-item-name">{product.nombre}</span>
        <p className="cart-item-description">{product.descripcion}</p>
      </div>

      {/* Campo para cantidad */}
      <div className="cart-item-input-group">
        <label className="cart-item-label">Cantidad</label>
        <input
          type="number"
          className="cart-item-input"
          value={cantidad}
          onChange={(e) => handleQuantityChange(product, parseInt(e.target.value, 10) || 1)}
          min="1"
        />
      </div>

      {/* Costo - NO EDITABLE */}
      <div className="cart-item-input-group">
        <label className="cart-item-label">Costo</label>
        <span className="cart-item-input" style={{ 
          backgroundColor: '#f0f0f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'not-allowed'
        }}>
          Q{costo.toFixed(2)}
        </span>
      </div>

      {/* Símbolo "=" */}
      <div className="cart-item-equal">=</div>

      {/* Precio Total (cantidad * costo) */}
      <div className="cart-item-price-total">Q{total.toFixed(2)}</div>

      {/* Botón de eliminar */}
      <button className="cart-item-delete-btn" onClick={() => removeItem(product)}>
        <i className="fa fa-trash" />
      </button>
    </div>
  );
};

export default CartPurchaseItem;