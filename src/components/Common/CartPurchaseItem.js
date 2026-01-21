import React from "react";
import { useTheme } from "../../context/ThemeContext";

// Imagen por defecto en base64
const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmOGY5ZmEiLz48cGF0aCBkPSJNNTAgMjBjLTUgMC0xMCAzLTEyIDhIMjV2MTJoNXY0MGg0MFY0MGg1VjI4SDYyYy0yLTUtNy04LTEyLTh6bTAgNGMzIDAgNiAyIDcgNWgtMTRjMS0zIDQtNSA3LTV6TTMwIDMyaDQwdjRIMzB2LTR6bTUgOGgzMHYzMkgzNVY0MHoiIGZpbGw9IiNmZjZiNmIiLz48cGF0aCBkPSJNNDUgNDBoMTB2MzJINDVWNDB6IiBmaWxsPSIjZmY2YjZiIi8+PC9zdmc+";

const CartPurchaseItem = ({ product, handleQuantityChange, removeItem }) => {
  
  const { theme } = useTheme();
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES || '';

  // Helper para obtener URL de imagen (Cloudinary o local)
  const getImageUrl = (foto) => {
    if (!foto || foto === "Foto no disponible") {
      return DEFAULT_IMAGE;
    }
    if (foto.startsWith('http')) {
      return foto;
    }
    return `${FILES_API}${foto}`;
  };

  const costo = Number(product?.costo || 0);
  const cantidad = Number(product?.cantidad || 1);
  const total = costo * cantidad;

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      paddingRight: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      gap: '12px',
      position: 'relative',
      border: '1px solid #eee'
    },
    removeBtn: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#ff4757',
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      padding: '0',
      lineHeight: '1',
      zIndex: 10
    },
    image: {
      width: '55px',
      height: '55px',
      borderRadius: '8px',
      objectFit: 'cover',
      backgroundColor: '#f5f5f5',
      flexShrink: 0
    },
    details: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden'
    },
    name: {
      fontWeight: 600,
      fontSize: '14px',
      color: '#333333',
      margin: '0 0 2px 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    desc: {
      fontSize: '12px',
      color: '#888888',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    costoWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px'
    },
    costoLabel: {
      fontSize: '10px',
      color: '#888888',
      margin: 0
    },
    costoValue: {
      fontWeight: 600,
      fontSize: '14px',
      color: '#333333',
      backgroundColor: '#f0f0f0',
      padding: '6px 12px',
      borderRadius: '6px',
      whiteSpace: 'nowrap'
    },
    quantityWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px'
    },
    quantityLabel: {
      fontSize: '10px',
      color: '#888888',
      margin: 0
    },
    quantityInput: {
      width: '60px',
      textAlign: 'center',
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '6px',
      fontSize: '14px',
      backgroundColor: '#fff'
    },
    equal: {
      color: '#888888',
      fontSize: '16px',
      margin: '0 5px'
    },
    total: {
      fontWeight: 700,
      fontSize: '16px',
      color: '#11998e',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={styles.container}>
      {/* Botón eliminar */}
      <button 
        style={styles.removeBtn}
        onClick={() => removeItem && removeItem(product)}
        title="Eliminar del carrito"
        type="button"
      >
        ✕
      </button>
      
      {/* Imagen */}
      <img
        src={getImageUrl(product?.foto)}
        alt={product?.nombre || 'Producto'}
        style={styles.image}
        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
      />

      {/* Info */}
      <div style={styles.details}>
        <p style={styles.name}>{product?.nombre || 'Sin nombre'}</p>
        <p style={styles.desc}>{product?.descripcion || ''}</p>
      </div>

      {/* Costo (NO EDITABLE) */}
      <div style={styles.costoWrapper}>
        <label style={styles.costoLabel}>Costo</label>
        <span style={styles.costoValue}>Q{costo.toFixed(2)}</span>
      </div>

      {/* Cantidad (EDITABLE) */}
      <div style={styles.quantityWrapper}>
        <label style={styles.quantityLabel}>Cantidad</label>
        <input
          type="number"
          style={styles.quantityInput}
          value={cantidad}
          onChange={(e) => handleQuantityChange && handleQuantityChange(product, parseInt(e.target.value, 10) || 1)}
          min="1"
        />
      </div>

      {/* = */}
      <span style={styles.equal}>=</span>

      {/* Total */}
      <div style={styles.total}>Q{total.toFixed(2)}</div>
    </div>
  );
};

export default CartPurchaseItem;