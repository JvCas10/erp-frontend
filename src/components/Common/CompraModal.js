import React, { useState, useEffect } from "react";
import Filters from "../Common/Filters";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { createCompra } from "../../api/compras";

const CompraModal = ({ isOpen, onClose, products, proveedores, fetchProducts, fetchCompras }) => {
    
    if (!isOpen) return null;

    const [productos, setProductos] = useState(products);
    const [cartItems, setCartItems] = useState([]);
    const [activeTab, setActiveTab] = useState('productos');

    const [filters, setFilters] = useState({
        search: "",
        priceRange: { min: 0, max: 10000 },
        stockRange: { min: 0, max: 1000 },
        selectedColors: [],
        selectedCategories: [],
        selectedSegments: [],
        selectedProducts: []
    });

    const handleFilter = (updatedFilters) => {
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        let filteredProducts = products.filter((producto) => {
            return !cartItems.some((item) => item.producto_id === producto.producto_id);
        });

        if (newFilters.search !== "") {
            const search = newFilters.search.toLowerCase();
            filteredProducts = filteredProducts.filter((producto) => {
                return (
                    producto.nombre.toLowerCase().includes(search) ||
                    producto.descripcion.toLowerCase().includes(search) ||
                    producto.categoria.toLowerCase().includes(search) ||
                    producto.segmento.toLowerCase().includes(search) ||
                    producto.color.toLowerCase().includes(search) ||
                    producto.precio.toString().includes(search) ||
                    producto.stock.toString().includes(search) ||
                    producto.producto_id.toString().includes(search)
                );
            });
        }

        filteredProducts = filteredProducts.filter((producto) => {
            return producto.precio >= newFilters.priceRange.min && producto.precio <= newFilters.priceRange.max;
        });

        filteredProducts = filteredProducts.filter((producto) => {
            return producto.stock >= newFilters.stockRange.min && producto.stock <= newFilters.stockRange.max;
        });

        if (newFilters.selectedColors.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedColors.includes(producto.color);
            });
        }

        if (newFilters.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedCategories.includes(producto.categoria);
            });
        }

        if (newFilters.selectedSegments.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedSegments.includes(producto.segmento);
            });
        }

        setProductos(filteredProducts);
    }

    const addToCart = (item, itemType) => {
        if (itemType !== "producto") return;

        const newCartItems = [...cartItems];

        newCartItems.push({
            ...item,
            cantidad: 1,
            precio: item.precio,
            precio_original: item.precio
        });

        setCartItems(newCartItems);

        const newProducts = productos.filter((product) => product.producto_id !== item.producto_id);
        setProductos(newProducts);
    };

    const handlePriceChange = (producto, precio) => {
        const newCartItems = cartItems.map((item) => {
            if (item.producto_id === producto.producto_id) {
                return { ...item, precio };
            }
            return item;
        });

        setCartItems(newCartItems);
    }

    const handleQuantityChange = (producto, cantidad) => {
        const newCartItems = cartItems.map((item) => {
            if (item.producto_id === producto.producto_id) {
                return { ...item, cantidad };
            }
            return item;
        });

        setCartItems(newCartItems);
    }

    const removeFromCart = (producto) => {
        const newCartItems = cartItems.filter((item) => item.producto_id !== producto.producto_id);
        setCartItems(newCartItems);

        const restoredProduct = {
            ...producto,
            cantidad: undefined,
            precio: producto.precio_original ?? producto.precio,
            precio_original: undefined
        };

        const newProducts = [...productos, restoredProduct];
        setProductos(newProducts);
    };

    const handlePurchase = async (cartItems, provider, total) => {
        if (!provider || cartItems.length === 0 || total <= 0) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        const compraData = {
            proveedor_id: provider.proveedor_id,
            fecha: getCurrentDateTime(),
            total: total,
            detalles: cartItems.map((item) => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio
            }))
        }

        const response = await createCompra(compraData);
        alert(response.message);

        if (response.success) {
            onClose();
            fetchProducts();
            fetchCompras();
        }
    }

    return (
        <>
            <style>{`
                .compra-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 0;
                }
                
                .compra-modal {
                    background-color: #f8f9fa;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (min-width: 768px) {
                    .compra-modal-overlay {
                        padding: 20px;
                    }
                    .compra-modal {
                        border-radius: 16px;
                        max-width: 900px;
                        max-height: 90vh;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    }
                }
                
                .compra-header {
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                
                .compra-header-title {
                    color: #fff;
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .compra-close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #fff;
                    font-size: 18px;
                    transition: all 0.2s;
                }
                
                .compra-close-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }
                
                .compra-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 1px solid #e0e0e0;
                    padding: 0;
                    flex-shrink: 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .compra-tab {
                    flex: 1;
                    padding: 12px 8px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    color: #888;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                    position: relative;
                    border-bottom: 3px solid transparent;
                }
                
                .compra-tab:hover {
                    background: #f5f5f5;
                }
                
                .compra-tab.active {
                    color: #11998e;
                    background: #e6f9f5;
                    border-bottom-color: #11998e;
                }
                
                .compra-tab-icon {
                    font-size: 22px;
                }
                
                .compra-tab-label {
                    font-size: 11px;
                }
                
                @media (min-width: 500px) {
                    .compra-tab {
                        flex-direction: row;
                        gap: 8px;
                        font-size: 14px;
                    }
                    .compra-tab-icon {
                        font-size: 18px;
                    }
                    .compra-tab-label {
                        font-size: 14px;
                    }
                }
                
                .compra-tab-badge {
                    position: absolute;
                    top: 6px;
                    right: 50%;
                    transform: translateX(25px);
                    background: #11998e;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                    font-weight: 700;
                }
                
                @media (min-width: 500px) {
                    .compra-tab-badge {
                        position: static;
                        transform: none;
                        margin-left: 5px;
                    }
                }
                
                .compra-tab.cart-tab.active {
                    background: #fff3e0;
                    color: #e65100;
                    border-bottom-color: #e65100;
                }
                
                .compra-tab.cart-tab .compra-tab-badge {
                    background: #e65100;
                }
                
                .compra-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }
                
                .compra-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow-y: auto;
                    padding: 20px;
                    -webkit-overflow-scrolling: touch;
                    display: none;
                    background: #f8f9fa;
                }
                
                .compra-panel.active {
                    display: block;
                }
                
                .compra-section-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .compra-section-title i {
                    color: #11998e;
                }
                
                .compra-products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 15px;
                }
                
                @media (min-width: 768px) {
                    .compra-products-grid {
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                        gap: 20px;
                    }
                }
                
                .compra-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: #999;
                }
                
                .compra-empty i {
                    font-size: 48px;
                    margin-bottom: 15px;
                    opacity: 0.5;
                }
                
                .compra-empty p {
                    font-size: 16px;
                    margin: 0;
                }
            `}</style>
            
            <div className="compra-modal-overlay">
                <div className="compra-modal">
                    {/* Header */}
                    <div className="compra-header">
                        <h2 className="compra-header-title">
                            <i className="fa fa-truck" />
                            Nueva Compra
                        </h2>
                        <button className="compra-close-btn" onClick={onClose}>
                            <i className="fa fa-times" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="compra-tabs">
                        <button 
                            className={`compra-tab ${activeTab === 'filtros' ? 'active' : ''}`}
                            onClick={() => setActiveTab('filtros')}
                        >
                            <i className="fa fa-filter compra-tab-icon" />
                            <span className="compra-tab-label">Filtros</span>
                        </button>
                        <button 
                            className={`compra-tab ${activeTab === 'productos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('productos')}
                        >
                            <i className="fa fa-box compra-tab-icon" />
                            <span className="compra-tab-label">Productos</span>
                            {productos.length > 0 && (
                                <span className="compra-tab-badge">{productos.length}</span>
                            )}
                        </button>
                        <button 
                            className={`compra-tab cart-tab ${activeTab === 'carrito' ? 'active' : ''}`}
                            onClick={() => setActiveTab('carrito')}
                        >
                            <i className="fa fa-shopping-cart compra-tab-icon" />
                            <span className="compra-tab-label">Carrito</span>
                            {cartItems.length > 0 && (
                                <span className="compra-tab-badge">{cartItems.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="compra-content">
                        {/* Panel Filtros */}
                        <div className={`compra-panel ${activeTab === 'filtros' ? 'active' : ''}`}>
                            <h2 className="compra-section-title">
                                <i className="fa fa-filter" />
                                Filtrar Productos
                            </h2>
                            <Filters
                                showSearchBar={true}
                                showPriceRange={true}
                                showStockRange={true}
                                showColors={true}
                                showCategories={true}
                                showSegments={true}
                                onFilterChange={handleFilter}
                            />
                        </div>

                        {/* Panel Productos */}
                        <div className={`compra-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="compra-section-title">
                                <i className="fa fa-box" />
                                Productos para Comprar ({productos.length})
                            </h2>
                            
                            {productos.length > 0 ? (
                                <div className="compra-products-grid">
                                    {productos.map((product) => (
                                        <ProductCard
                                            key={product.producto_id}
                                            product={product}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="compra-empty">
                                    <i className="fa fa-box-open" />
                                    <p>No hay productos disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Panel Carrito */}
                        <div className={`compra-panel ${activeTab === 'carrito' ? 'active' : ''}`}>
                            <Cart
                                cartItems={cartItems}
                                providers={proveedores}
                                isPurchase={true}
                                handlePriceChange={handlePriceChange}
                                handleQuantityChange={handleQuantityChange}
                                handleRemoveCart={removeFromCart}
                                handleSubmit={handlePurchase}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompraModal;