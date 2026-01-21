import React from "react";
import "../../assets/styles/CartPurchaseItem.css";
import regaloImg from "../../assets/regalo.png"; // Imagen de respaldo

const CartPurchaseItem = ({ product, handlePriceChange, handleQuantityChange, removeItem }) => {
  
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  console.log("CartPurchaseItem", product);
  console.log("CartPurchaseItem FILES_API:", FILES_API);

  // Verificar si la imagen existe, si no, usar imagen de respaldo
  const productImage = () => {
    if (product.foto && product.foto !== "Foto no disponible") {
      // Si ya es URL completa (Cloudinary), usarla directamente
      if (product.foto.startsWith('http')) {
        return product.foto;
      }
      const imageUrl = `${FILES_API}${product.foto}`;
      console.log("CartPurchaseItem - Usando imagen del servidor:", imageUrl);
      return imageUrl; // URL del servidor de archivos
    } else {
      console.log("CartPurchaseItem - Usando imagen por defecto, foto:", product.foto);
      return regaloImg; // Imagen por defecto
    }
  };

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
          value={product.cantidad}
          onChange={(e) => handleQuantityChange(product, parseInt(e.target.value, 10) || 1)}
          min="1"
        />
      </div>

      {/* Campo para precio de compra */}
      <div className="cart-item-input-group">
        <label className="cart-item-label">Costo</label>
        <input
          type="number"
          className="cart-item-input"
          value={product.precio}
          onChange={(e) => handlePriceChange(product, parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </div>

      {/* Símbolo "=" */}
      <div className="cart-item-equal">=</div>

      {/* Precio Total (cantidad * precio de compra) */}
      <div className="cart-item-price-total">Q{(product.precio * product.cantidad).toFixed(2)}</div>

      {/* Botón de eliminar */}
      <button className="cart-item-delete-btn" onClick={() => removeItem(product)}>
        <i className="fa fa-trash" />
      </button>
    </div>
  );
};

export default CartPurchaseItem;