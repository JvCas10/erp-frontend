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
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    const [filters, setFilters] = useState({
        search: "",
        priceRange: { min: 0, max: 10000 },
        stockRange: { min: 0, max: 1000 },
        selectedColors: [],
        selectedCategories: [],
        selectedSegments: [],
        selectedProducts: []
    });

    // Detectar cambios de tamaño de ventana
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 768;

    // Filtrar los datos dinamicamente
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
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 0;
                }
                
                .compra-modal {
                    background-color: #f5f5f5;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (min-width: 1025px) {
                    .compra-modal-overlay {
                        padding: 20px;
                    }
                    .compra-modal {
                        border-radius: 12px;
                        max-width: 1200px;
                        max-height: 95vh;
                        height: auto;
                    }
                }
                
                .compra-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #ff4757;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100;
                    color: #fff;
                    font-size: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                
                .compra-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 2px solid #e0e0e0;
                    padding: 0;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    flex-shrink: 0;
                }
                
                .compra-tab {
                    flex: 1;
                    min-width: 100px;
                    padding: 15px 10px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    color: #666;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.2s;
                    position: relative;
                    white-space: nowrap;
                }
                
                .compra-tab.active {
                    color: #17a2b8;
                    background: #e3f7fa;
                }
                
                .compra-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #17a2b8;
                }
                
                .compra-tab-icon {
                    font-size: 20px;
                }
                
                .compra-tab-badge {
                    position: absolute;
                    top: 5px;
                    right: 20px;
                    background: #17a2b8;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
                
                .compra-tab.cart-tab {
                    background: #fff3e0;
                }
                
                .compra-tab.cart-tab.active {
                    background: #ffe0b2;
                    color: #e65100;
                }
                
                .compra-tab.cart-tab.active::after {
                    background: #e65100;
                }
                
                .compra-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .compra-panel {
                    display: none;
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    -webkit-overflow-scrolling: touch;
                }
                
                .compra-panel.active {
                    display: block;
                }
                
                .compra-section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: #333;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #17a2b8;
                    display: flex;
                    align-items: center;
                }
                
                .compra-products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 12px;
                }
                
                @media (max-width: 400px) {
                    .compra-products-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                }
                
                /* Desktop Layout */
                @media (min-width: 769px) {
                    .compra-tabs {
                        display: none;
                    }
                    
                    .compra-content {
                        flex-direction: row;
                        padding: 15px;
                        gap: 15px;
                    }
                    
                    .compra-panel {
                        display: block !important;
                        border-radius: 8px;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    .compra-panel.filters-panel {
                        width: 250px;
                        flex-shrink: 0;
                    }
                    
                    .compra-panel.products-panel {
                        flex: 1;
                    }
                    
                    .compra-panel.cart-panel {
                        width: 350px;
                        flex-shrink: 0;
                        border: 2px solid #e65100;
                    }
                }
            `}</style>
            
            <div className="compra-modal-overlay">
                <div className="compra-modal">
                    <button className="compra-close-btn" onClick={onClose}>
                        <i className="fa fa-times" />
                    </button>

                    {/* Tabs para móvil */}
                    <div className="compra-tabs">
                        <button 
                            className={`compra-tab ${activeTab === 'filtros' ? 'active' : ''}`}
                            onClick={() => setActiveTab('filtros')}
                        >
                            <i className="fa fa-filter compra-tab-icon" />
                            <span>Filtros</span>
                        </button>
                        <button 
                            className={`compra-tab ${activeTab === 'productos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('productos')}
                        >
                            <i className="fa fa-box compra-tab-icon" />
                            <span>Productos</span>
                            <span className="compra-tab-badge">{productos.length}</span>
                        </button>
                        <button 
                            className={`compra-tab cart-tab ${activeTab === 'carrito' ? 'active' : ''}`}
                            onClick={() => setActiveTab('carrito')}
                        >
                            <i className="fa fa-shopping-cart compra-tab-icon" />
                            <span>Carrito</span>
                            {cartItems.length > 0 && (
                                <span className="compra-tab-badge" style={{background: '#e65100'}}>
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="compra-content">
                        {/* Panel Filtros */}
                        <div className={`compra-panel filters-panel ${activeTab === 'filtros' ? 'active' : ''}`}>
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
                        <div className={`compra-panel products-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="compra-section-title">
                                <i className="fa fa-box" style={{marginRight: '10px', color: '#17a2b8'}} />
                                Productos Disponibles ({productos.length})
                            </h2>
                            <div className="compra-products-grid">
                                {productos.map((product) => (
                                    <ProductCard
                                        key={product.producto_id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Panel Carrito */}
                        <div className={`compra-panel cart-panel ${activeTab === 'carrito' ? 'active' : ''}`}>
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