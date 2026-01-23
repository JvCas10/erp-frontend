import React, { useState, useEffect, useCallback } from "react";
import Filters from "../Common/Filters";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { createCompra } from "../../api/compras";

const CompraModal = ({ isOpen, onClose, products, proveedores, fetchProducts, fetchCompras }) => {
    
    if (!isOpen) return null;

    // productos filtrados para mostrar
    const [productosVisibles, setProductosVisibles] = useState([]);
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

    // Función para aplicar todos los filtros
    const aplicarFiltros = useCallback((currentFilters, productosOriginales, itemsEnCarrito) => {
        // Empezar con todos los productos originales, excluyendo los que están en el carrito
        let resultado = productosOriginales.filter((producto) => {
            return !itemsEnCarrito.some((item) => item.producto_id === producto.producto_id);
        });

        // Filtrar por búsqueda
        if (currentFilters.search && currentFilters.search.trim() !== "") {
            const search = currentFilters.search.toLowerCase().trim();
            resultado = resultado.filter((producto) => {
                return (
                    (producto.nombre && producto.nombre.toLowerCase().includes(search)) ||
                    (producto.descripcion && producto.descripcion.toLowerCase().includes(search)) ||
                    (producto.categoria && producto.categoria.toLowerCase().includes(search)) ||
                    (producto.segmento && producto.segmento.toLowerCase().includes(search)) ||
                    (producto.color && producto.color.toLowerCase().includes(search)) ||
                    (producto.precio && producto.precio.toString().includes(search)) ||
                    (producto.stock && producto.stock.toString().includes(search)) ||
                    (producto.producto_id && producto.producto_id.toString().includes(search))
                );
            });
        }

        // Filtrar por rango de precios (solo si los valores son válidos)
        if (currentFilters.priceRange && 
            typeof currentFilters.priceRange.min === 'number' && 
            typeof currentFilters.priceRange.max === 'number' &&
            currentFilters.priceRange.max >= currentFilters.priceRange.min) {
            resultado = resultado.filter((producto) => {
                const precio = Number(producto.precio) || 0;
                return precio >= currentFilters.priceRange.min && precio <= currentFilters.priceRange.max;
            });
        }

        // Filtrar por rango de stock (solo si los valores son válidos)
        if (currentFilters.stockRange && 
            typeof currentFilters.stockRange.min === 'number' && 
            typeof currentFilters.stockRange.max === 'number' &&
            currentFilters.stockRange.max >= currentFilters.stockRange.min) {
            resultado = resultado.filter((producto) => {
                const stock = Number(producto.stock) || 0;
                return stock >= currentFilters.stockRange.min && stock <= currentFilters.stockRange.max;
            });
        }

        // Filtrar por colores (solo si hay colores seleccionados)
        if (currentFilters.selectedColors && currentFilters.selectedColors.length > 0) {
            resultado = resultado.filter((producto) => {
                if (!producto.color) return false;
                // Comparación case-insensitive y trim
                return currentFilters.selectedColors.some(
                    color => color.toLowerCase().trim() === producto.color.toLowerCase().trim()
                );
            });
        }

        // Filtrar por categorías (solo si hay categorías seleccionadas)
        if (currentFilters.selectedCategories && currentFilters.selectedCategories.length > 0) {
            resultado = resultado.filter((producto) => {
                if (!producto.categoria) return false;
                // Comparación case-insensitive y trim
                return currentFilters.selectedCategories.some(
                    cat => cat.toLowerCase().trim() === producto.categoria.toLowerCase().trim()
                );
            });
        }

        // Filtrar por segmentos (solo si hay segmentos seleccionados)
        if (currentFilters.selectedSegments && currentFilters.selectedSegments.length > 0) {
            resultado = resultado.filter((producto) => {
                if (!producto.segmento) return false;
                // Comparación case-insensitive y trim
                return currentFilters.selectedSegments.some(
                    seg => seg.toLowerCase().trim() === producto.segmento.toLowerCase().trim()
                );
            });
        }

        // Filtrar por nombre de producto (solo si hay productos seleccionados)
        if (currentFilters.selectedProducts && currentFilters.selectedProducts.length > 0) {
            resultado = resultado.filter((producto) => {
                if (!producto.nombre) return false;
                // Comparación case-insensitive y trim
                return currentFilters.selectedProducts.some(
                    name => name.toLowerCase().trim() === producto.nombre.toLowerCase().trim()
                );
            });
        }

        return resultado;
    }, []);

    // Inicializar productos visibles cuando se abre el modal
    useEffect(() => {
        if (isOpen && products) {
            const filtrados = aplicarFiltros(filters, products, cartItems);
            setProductosVisibles(filtrados);
        }
    }, [isOpen, products]);

    // Handler para cambios de filtro
    const handleFilter = (updatedFilters) => {
        // Merge de filtros nuevos con los existentes
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        // Aplicar filtros usando los productos ORIGINALES (props)
        const filtrados = aplicarFiltros(newFilters, products, cartItems);
        setProductosVisibles(filtrados);
        
        // Debug: mostrar en consola qué está pasando
        console.log('Filtros aplicados:', newFilters);
        console.log('Productos originales:', products.length);
        console.log('Productos filtrados:', filtrados.length);
    };

    const addToCart = (item, itemType) => {
        if (itemType !== "producto") return;

        const newCartItems = [...cartItems];

        newCartItems.push({
            ...item,
            cantidad: 1,
            precio: item.costo,
            precio_original: item.costo
        });

        setCartItems(newCartItems);

        // Quitar el producto de la lista visible
        const newProductosVisibles = productosVisibles.filter(
            (product) => product.producto_id !== item.producto_id
        );
        setProductosVisibles(newProductosVisibles);
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

        // Re-aplicar filtros para que el producto vuelva a aparecer si cumple los criterios
        const filtrados = aplicarFiltros(filters, products, newCartItems);
        setProductosVisibles(filtrados);
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
                    color: #fff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                
                .compra-close-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .compra-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 1px solid #e0e0e0;
                    flex-shrink: 0;
                    overflow-x: auto;
                }
                
                .compra-tab {
                    flex: 1;
                    min-width: 80px;
                    padding: 12px 8px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    color: #666;
                    transition: all 0.2s;
                    border-bottom: 3px solid transparent;
                    position: relative;
                }
                
                .compra-tab.active {
                    color: #11998e;
                    background: #e8f5e9;
                    border-bottom-color: #11998e;
                }
                
                .compra-tab-icon {
                    font-size: 18px;
                }
                
                .compra-tab-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                @media (min-width: 500px) {
                    .compra-tab {
                        flex-direction: row;
                        gap: 8px;
                        padding: 12px 16px;
                    }
                    .compra-tab-label {
                        font-size: 13px;
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
                            {productosVisibles.length > 0 && (
                                <span className="compra-tab-badge">{productosVisibles.length}</span>
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
                                showColorOptions={true}
                                showCategories={true}
                                showSegments={true}
                                showProductName={true}
                                onFilterChange={handleFilter}
                            />
                        </div>

                        {/* Panel Productos */}
                        <div className={`compra-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="compra-section-title">
                                <i className="fa fa-box" />
                                Productos para Comprar ({productosVisibles.length})
                            </h2>
                            
                            {productosVisibles.length > 0 ? (
                                <div className="compra-products-grid">
                                    {productosVisibles.map((product) => (
                                        <ProductCard
                                            key={product.producto_id}
                                            product={{...product, precio: product.costo}}
                                            onAddToCart={(prod, type) => addToCart({...prod, precio: product.precio, costo: product.costo}, type)}
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