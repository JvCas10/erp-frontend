import React from "react";
import regaloImg from "../../assets/regalo.png";
import { useTheme } from "../../context/ThemeContext";

const ProductCard = ({ product, onAddToCart }) => {

  const { theme } = useTheme();
  const FILES_API = import.meta.env?.VITE_SERVER_FILES || process.env.REACT_APP_SERVER_FILES;

  // Helper para obtener URL de imagen (Cloudinary o local)
  const getImageUrl = (foto) => {
    if (!foto || foto === "Foto no disponible") {
      return regaloImg;
    }
    // Si es URL de Cloudinary (empieza con http)
    if (foto.startsWith('http')) {
      return foto;
    }
    // Si es ruta local
    return `${FILES_API}${foto}`;
  };

  return (
    <>
      <style>{`
        .product-card-container {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .product-card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .product-card-stock {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ff6b6b;
          color: #fff;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          z-index: 2;
        }
        
        .product-card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 75%;
          background: #f8f9fa;
          overflow: hidden;
        }
        
        .product-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .product-card-container:hover .product-card-image {
          transform: scale(1.05);
        }
        
        .product-card-content {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .product-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #333;
          margin: 0 0 4px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-card-desc {
          font-size: 12px;
          color: #888;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }
        
        .product-card-price {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        
        .product-card-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ff6b6b;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .product-card-btn:hover {
          background: #ff5252;
          transform: scale(1.1);
        }
        
        .product-card-btn:active {
          transform: scale(0.95);
        }
        
        .product-card-btn svg {
          width: 20px;
          height: 20px;
          fill: #fff;
        }
        
        @media (max-width: 400px) {
          .product-card-content {
            padding: 10px;
          }
          
          .product-card-title {
            font-size: 13px;
          }
          
          .product-card-footer {
            padding: 10px;
          }
          
          .product-card-price {
            font-size: 16px;
          }
          
          .product-card-btn {
            width: 38px;
            height: 38px;
          }
          
          .product-card-btn svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
      
      <div className="product-card-container">
        {/* Imagen */}
        <div className="product-card-image-wrapper">
          <span className="product-card-stock">{product.stock}</span>
          <img 
            src={getImageUrl(product.foto)} 
            alt={product.nombre}
            className="product-card-image"
          />
        </div>
        
        {/* Contenido */}
        <div className="product-card-content">
          <h3 className="product-card-title">{product.nombre}</h3>
          <p className="product-card-desc">{product.descripcion}</p>
        </div>
        
        {/* Footer */}
        <div className="product-card-footer">
          <span className="product-card-price">Q{Number(product.precio).toFixed(2)}</span>
          <button 
            className="product-card-btn"
            onClick={() => onAddToCart(product, "producto")}
            style={{ backgroundColor: theme?.primaryColor || '#ff6b6b' }}
            title="Agregar al carrito"
          >
            <svg viewBox="0 0 20 20">
              <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z"></path>
              <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z"></path>
              <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z"></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductCard;