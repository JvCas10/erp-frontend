import React from "react";
import { useTheme } from "../../context/ThemeContext";

// Imagen por defecto en base64 (regalo/gift box)
const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmOGY5ZmEiLz48cGF0aCBkPSJNNTAgMjBjLTUgMC0xMCAzLTEyIDhIMjV2MTJoNXY0MGg0MFY0MGg1VjI4SDYyYy0yLTUtNy04LTEyLTh6bTAgNGMzIDAgNiAyIDcgNWgtMTRjMS0zIDQtNSA3LTV6TTMwIDMyaDQwdjRIMzB2LTR6bTUgOGgzMHYzMkgzNVY0MHoiIGZpbGw9IiNmZjZiNmIiLz48cGF0aCBkPSJNNDUgNDBoMTB2MzJINDVWNDB6IiBmaWxsPSIjZmY2YjZiIi8+PC9zdmc+";

const ProductCard = ({ product, onAddToCart }) => {

  const { theme } = useTheme();
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES || '';

  // Helper para obtener URL de imagen (Cloudinary o local)
  const getImageUrl = (foto) => {
    if (!foto || foto === "Foto no disponible") {
      return DEFAULT_IMAGE;
    }
    // Si es URL de Cloudinary (empieza con http)
    if (foto.startsWith('http')) {
      return foto;
    }
    // Si es ruta local
    return `${FILES_API}${foto}`;
  };

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid #eee'
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      paddingTop: '75%',
      backgroundColor: '#f8f9fa',
      overflow: 'hidden'
    },
    stock: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: '#ff6b6b',
      color: '#ffffff',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 700,
      zIndex: 2
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    content: {
      padding: '12px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#333333',
      margin: '0 0 4px 0',
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    desc: {
      fontSize: '12px',
      color: '#888888',
      margin: 0,
      flex: 1,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    },
    price: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#333333',
      margin: 0
    },
    button: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      backgroundColor: theme?.primaryColor || '#ff6b6b',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s ease'
    },
    buttonSvg: {
      width: '20px',
      height: '20px',
      fill: '#ffffff'
    }
  };

  return (
    <div style={styles.card}>
      {/* Imagen */}
      <div style={styles.imageWrapper}>
        <span style={styles.stock}>{product?.stock ?? 0}</span>
        <img 
          src={getImageUrl(product?.foto)} 
          alt={product?.nombre || 'Producto'}
          style={styles.image}
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        />
      </div>
      
      {/* Contenido */}
      <div style={styles.content}>
        <h3 style={styles.title}>{product?.nombre || 'Sin nombre'}</h3>
        <p style={styles.desc}>{product?.descripcion || ''}</p>
      </div>
      
      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.price}>Q{Number(product?.precio || 0).toFixed(2)}</span>
        <button 
          style={styles.button}
          onClick={() => onAddToCart && onAddToCart(product, "producto")}
          title="Agregar al carrito"
          type="button"
        >
          <svg style={styles.buttonSvg} viewBox="0 0 20 20">
            <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z"></path>
            <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z"></path>
            <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;