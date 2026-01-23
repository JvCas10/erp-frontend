import React, { useState, useEffect, useCallback } from "react";
import Filters from "./Filters";
import ProductCard from "./ProductCard";
import ServiceCard from "./ServiceCard";
import Cart from "./Cart";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { createVenta } from "../../api/ventas";
import axiosInstance from "../../api/axiosConfig";

const SalesModal = ({ isOpen, onClose, products, services, clientes, fetchProducts, fetchServices, fetchVentas }) => {

    if (!isOpen) return null;

    // Estados para productos/servicios visibles (filtrados)
    const [productosVisibles, setProductosVisibles] = useState([]);
    const [serviciosVisibles, setServiciosVisibles] = useState([]);
    const [productosCompuestos, setProductosCompuestos] = useState([]);
    const [productosCompuestosVisibles, setProductosCompuestosVisibles] = useState([]);
    
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

    useEffect(() => {
        if (isOpen) {
            fetchProductosCompuestos();
        }
    }, [isOpen]);

    const fetchProductosCompuestos = async () => {
        try {
            const response = await axiosInstance.get("/productos-compuestos");
            const data = response.data.productos || [];
            setProductosCompuestos(data);
            setProductosCompuestosVisibles(data);
        } catch (error) {
            console.error("Error al cargar productos compuestos:", error);
        }
    };

    // Función para aplicar filtros
    const aplicarFiltros = useCallback((currentFilters, productosOriginales, serviciosOriginales, compuestosOriginales, itemsEnCarrito) => {
        // Calcular stock actualizado para productos en carrito
        let productosConStock = productosOriginales.map((producto) => {
            const cartItem = itemsEnCarrito.find((item) => item.producto_id === producto.producto_id && item.itemType === "producto");
            if (cartItem) {
                return { ...producto, stock: cartItem.stock };
            }
            return producto;
        });

        // Solo mostrar productos con stock > 0
        productosConStock = productosConStock.filter(producto => producto.stock > 0);

        let filteredProducts = [...productosConStock];
        let filteredServices = [...serviciosOriginales];
        let filteredCompuestos = [...compuestosOriginales];

        // Filtrar por búsqueda
        if (currentFilters.search && currentFilters.search.trim() !== "") {
            const search = currentFilters.search.toLowerCase().trim();
            filteredProducts = filteredProducts.filter((producto) => {
                return (
                    (producto.nombre && producto.nombre.toLowerCase().includes(search)) ||
                    (producto.descripcion && producto.descripcion?.toLowerCase().includes(search)) ||
                    (producto.categoria && producto.categoria?.toLowerCase().includes(search)) ||
                    (producto.segmento && producto.segmento?.toLowerCase().includes(search)) ||
                    (producto.color && producto.color?.toLowerCase().includes(search))
                );
            });
            filteredServices = filteredServices.filter((servicio) => {
                return (
                    (servicio.nombre && servicio.nombre.toLowerCase().includes(search)) ||
                    (servicio.descripcion && servicio.descripcion?.toLowerCase().includes(search))
                );
            });
            filteredCompuestos = filteredCompuestos.filter((compuesto) => {
                return (
                    (compuesto.nombre && compuesto.nombre.toLowerCase().includes(search)) ||
                    (compuesto.descripcion && compuesto.descripcion?.toLowerCase().includes(search))
                );
            });
        }

        // Filtrar por rango de precios
        if (currentFilters.priceRange && 
            typeof currentFilters.priceRange.min === 'number' && 
            typeof currentFilters.priceRange.max === 'number' &&
            currentFilters.priceRange.max >= currentFilters.priceRange.min) {
            filteredProducts = filteredProducts.filter((producto) => {
                const precio = Number(producto.precio) || 0;
                return precio >= currentFilters.priceRange.min && precio <= currentFilters.priceRange.max;
            });
            filteredServices = filteredServices.filter((servicio) => {
                const precio = Number(servicio.precio) || 0;
                return precio >= currentFilters.priceRange.min && precio <= currentFilters.priceRange.max;
            });
            filteredCompuestos = filteredCompuestos.filter((compuesto) => {
                const precio = Number(compuesto.precio_venta) || 0;
                return precio >= currentFilters.priceRange.min && precio <= currentFilters.priceRange.max;
            });
        }

        // Filtrar por rango de stock (solo productos)
        if (currentFilters.stockRange && 
            typeof currentFilters.stockRange.min === 'number' && 
            typeof currentFilters.stockRange.max === 'number' &&
            currentFilters.stockRange.max >= currentFilters.stockRange.min) {
            filteredProducts = filteredProducts.filter((producto) => {
                const stock = Number(producto.stock) || 0;
                return stock >= currentFilters.stockRange.min && stock <= currentFilters.stockRange.max;
            });
        }

        // Filtrar por colores (solo productos)
        if (currentFilters.selectedColors && currentFilters.selectedColors.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                if (!producto.color) return false;
                return currentFilters.selectedColors.some(
                    color => color.toLowerCase().trim() === producto.color.toLowerCase().trim()
                );
            });
        }

        // Filtrar por categorías (solo productos)
        if (currentFilters.selectedCategories && currentFilters.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                if (!producto.categoria) return false;
                return currentFilters.selectedCategories.some(
                    cat => cat.toLowerCase().trim() === producto.categoria.toLowerCase().trim()
                );
            });
        }

        // Filtrar por segmentos (solo productos)
        if (currentFilters.selectedSegments && currentFilters.selectedSegments.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                if (!producto.segmento) return false;
                return currentFilters.selectedSegments.some(
                    seg => seg.toLowerCase().trim() === producto.segmento.toLowerCase().trim()
                );
            });
        }

        // Filtrar por nombre de producto
        if (currentFilters.selectedProducts && currentFilters.selectedProducts.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                if (!producto.nombre) return false;
                return currentFilters.selectedProducts.some(
                    name => name.toLowerCase().trim() === producto.nombre.toLowerCase().trim()
                );
            });
        }

        return { filteredProducts, filteredServices, filteredCompuestos };
    }, []);

    // Inicializar productos visibles
    useEffect(() => {
        if (isOpen && products && services) {
            const { filteredProducts, filteredServices, filteredCompuestos } = aplicarFiltros(
                filters, products, services, productosCompuestos, cartItems
            );
            setProductosVisibles(filteredProducts);
            setServiciosVisibles(filteredServices);
            setProductosCompuestosVisibles(filteredCompuestos);
        }
    }, [isOpen, products, services, productosCompuestos]);

    const handleFilter = (updatedFilters) => {
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        const { filteredProducts, filteredServices, filteredCompuestos } = aplicarFiltros(
            newFilters, products, services, productosCompuestos, cartItems
        );
        
        setProductosVisibles(filteredProducts);
        setServiciosVisibles(filteredServices);
        setProductosCompuestosVisibles(filteredCompuestos);

        console.log('Filtros aplicados:', newFilters);
        console.log('Productos filtrados:', filteredProducts.length);
        console.log('Servicios filtrados:', filteredServices.length);
    };

    const verificarStockCompuesto = (compuesto, cantidadSolicitada = 1) => {
        if (!compuesto.componentes || compuesto.componentes.length === 0) {
            return false;
        }

        for (const componente of compuesto.componentes) {
            const productoEnInventario = products.find(p => p.producto_id === componente.producto_id);
            
            if (!productoEnInventario) {
                return false;
            }

            const cantidadEnCarrito = cartItems
                .filter(item => item.itemType === "producto_compuesto")
                .reduce((total, item) => {
                    const comp = item.componentes?.find(c => c.producto_id === componente.producto_id);
                    return total + (comp ? comp.cantidad * item.cantidad : 0);
                }, 0);

            const stockNecesario = componente.cantidad * cantidadSolicitada;
            const stockDisponible = productoEnInventario.stock - cantidadEnCarrito;

            if (stockDisponible < stockNecesario) {
                return false;
            }
        }

        return true;
    };

    const addToCart = (item, itemType) => {
        if (itemType === "producto" && item.stock <= 0) {
            alert("No hay stock suficiente de este producto");
            return;
        }

        if (itemType === "producto_compuesto") {
            const stockSuficiente = verificarStockCompuesto(item, 1);
            if (!stockSuficiente) {
                alert("No hay stock suficiente de los componentes para este producto compuesto");
                return;
            }
        }

        const newCartItems = [...cartItems];
        const itemIdKey = itemType === "producto" ? "producto_id" : 
                         itemType === "servicio" ? "servicio_id" : 
                         "producto_compuesto_id";

        const existingItem = newCartItems.find(
            (cartItem) => cartItem[itemIdKey] === item[itemIdKey] && cartItem.itemType === itemType
        );

        if (existingItem) {
            if (itemType === "producto_compuesto") {
                const stockSuficiente = verificarStockCompuesto(item, existingItem.cantidad + 1);
                if (!stockSuficiente) {
                    alert("No hay stock suficiente de los componentes para agregar más unidades");
                    return;
                }
            }
            
            existingItem.cantidad++;
            if (itemType === "producto") {
                existingItem.stock--;
            }
        } else {
            newCartItems.push({
                ...item,
                cantidad: 1,
                itemType,
                stock: itemType === "producto" ? item.stock - 1 : undefined,
                precio: itemType === "producto_compuesto" ? item.precio_venta : item.precio
            });
        }

        setCartItems(newCartItems);

        if (itemType === "producto") {
            const updatedProducts = productosVisibles.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductosVisibles(updatedProducts.filter((producto) => producto.stock > 0));
        }
    };

    const increaseQuantity = (item) => {
        const newCartItems = [...cartItems];
        const itemIdKey = item.itemType === "producto" ? "producto_id" : 
                         item.itemType === "servicio" ? "servicio_id" : 
                         "producto_compuesto_id";

        const existingItem = newCartItems.find(
            (cartItem) =>
                cartItem[itemIdKey] === item[itemIdKey] &&
                cartItem.itemType === item.itemType
        );

        if (!existingItem) return;

        if (item.itemType === "producto" && existingItem.stock <= 0) {
            alert("No hay stock suficiente");
            return;
        }

        if (item.itemType === "producto_compuesto") {
            const stockSuficiente = verificarStockCompuesto(item, existingItem.cantidad + 1);
            if (!stockSuficiente) {
                alert("No hay stock suficiente de los componentes para agregar más unidades");
                return;
            }
        }

        existingItem.cantidad++;
        if (item.itemType === "producto") {
            existingItem.stock--;
        }

        setCartItems(newCartItems);

        if (item.itemType === "producto") {
            const updatedProducts = productosVisibles.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductosVisibles(updatedProducts.filter((producto) => producto.stock > 0));
        }
    };

    const decreaseQuantity = (item) => {
        const newCartItems = [...cartItems];
        const itemIdKey = item.itemType === "producto" ? "producto_id" : 
                         item.itemType === "servicio" ? "servicio_id" : 
                         "producto_compuesto_id";

        const existingItem = newCartItems.find(
            (cartItem) =>
                cartItem[itemIdKey] === item[itemIdKey] &&
                cartItem.itemType === item.itemType
        );

        if (!existingItem) return;

        if (existingItem.cantidad > 1) {
            existingItem.cantidad--;
            if (item.itemType === "producto") {
                existingItem.stock++;
            }
        } else {
            newCartItems.splice(newCartItems.indexOf(existingItem), 1);
        }

        setCartItems(newCartItems);

        if (item.itemType === "producto") {
            // Re-aplicar filtros para restaurar el producto
            const { filteredProducts } = aplicarFiltros(filters, products, services, productosCompuestos, newCartItems);
            setProductosVisibles(filteredProducts);
        }
    };

    const removeFromCart = (item) => {
        const itemIdKey = item.itemType === "producto" ? "producto_id" : 
                         item.itemType === "servicio" ? "servicio_id" : 
                         "producto_compuesto_id";

        const newCartItems = cartItems.filter(
            (cartItem) => !(cartItem[itemIdKey] === item[itemIdKey] && cartItem.itemType === item.itemType)
        );

        setCartItems(newCartItems);

        // Re-aplicar filtros para restaurar productos/servicios
        const { filteredProducts, filteredServices, filteredCompuestos } = aplicarFiltros(
            filters, products, services, productosCompuestos, newCartItems
        );
        setProductosVisibles(filteredProducts);
        setServiciosVisibles(filteredServices);
        setProductosCompuestosVisibles(filteredCompuestos);
    };

    const handleSell = async (cartItems, client, paymentmethod, total) => {
        if (!client || !paymentmethod || cartItems.length === 0 || total <= 0) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        const ventaData = {
            fecha: getCurrentDateTime(),
            total: total,
            metodo_pago: paymentmethod,
            cliente_id: client.cliente_id,
            detalles: cartItems.map((item) => {
                if (item.itemType === 'servicio') {
                    return {
                        servicio_id: item.servicio_id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio
                    };
                } else if (item.itemType === 'producto') {
                    return {
                        producto_id: item.producto_id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio
                    };
                } else if (item.itemType === 'producto_compuesto') {
                    return {
                        producto_compuesto_id: item.producto_compuesto_id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio
                    };
                }
                return null;
            }).filter(detalle => detalle !== null)
        };

        try {
            const response = await createVenta(ventaData);
            alert(response.message);

            if (response.success) {
                onClose();
                fetchProducts();
                fetchServices();
                fetchVentas();
            }
        } catch (error) {
            console.error("Error al crear venta:", error);
            alert("Error al registrar la venta: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <>
            <style>{`
                .sales-modal-overlay {
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
                
                .sales-modal {
                    background-color: #f8f9fa;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (min-width: 768px) {
                    .sales-modal-overlay {
                        padding: 20px;
                    }
                    .sales-modal {
                        border-radius: 16px;
                        max-width: 1000px;
                        max-height: 90vh;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    }
                }
                
                .sales-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                
                .sales-header-title {
                    color: #fff;
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .sales-close-btn {
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
                
                .sales-close-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }
                
                .sales-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 1px solid #e0e0e0;
                    padding: 0;
                    flex-shrink: 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .sales-tab {
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
                
                .sales-tab:hover {
                    background: #f5f5f5;
                }
                
                .sales-tab.active {
                    color: #667eea;
                    background: #f0f4ff;
                    border-bottom-color: #667eea;
                }
                
                .sales-tab-icon {
                    font-size: 22px;
                }
                
                .sales-tab-label {
                    font-size: 11px;
                }
                
                @media (min-width: 500px) {
                    .sales-tab {
                        flex-direction: row;
                        gap: 8px;
                        font-size: 14px;
                    }
                    .sales-tab-icon {
                        font-size: 18px;
                    }
                    .sales-tab-label {
                        font-size: 14px;
                    }
                }
                
                .sales-tab-badge {
                    position: absolute;
                    top: 6px;
                    right: 50%;
                    transform: translateX(20px);
                    background: #667eea;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                    font-weight: 700;
                }
                
                @media (min-width: 500px) {
                    .sales-tab-badge {
                        position: static;
                        transform: none;
                        margin-left: 5px;
                    }
                }
                
                .sales-tab.cart-tab.active {
                    background: #e8f5e9;
                    color: #2e7d32;
                    border-bottom-color: #2e7d32;
                }
                
                .sales-tab.cart-tab .sales-tab-badge {
                    background: #2e7d32;
                }
                
                .sales-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }
                
                .sales-panel {
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
                
                .sales-panel.active {
                    display: block;
                }
                
                .sales-section-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .sales-section-title i {
                    color: #667eea;
                }
                
                .sales-products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 15px;
                }
                
                @media (min-width: 768px) {
                    .sales-products-grid {
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                        gap: 20px;
                    }
                }
                
                .sales-divider {
                    margin: 30px 0 20px;
                    padding-top: 25px;
                    border-top: 2px dashed #ddd;
                }
                
                .sales-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: #999;
                }
                
                .sales-empty i {
                    font-size: 48px;
                    margin-bottom: 15px;
                    opacity: 0.5;
                }
                
                .sales-empty p {
                    font-size: 16px;
                    margin: 0;
                }
            `}</style>
            
            <div className="sales-modal-overlay">
                <div className="sales-modal">
                    {/* Header */}
                    <div className="sales-header">
                        <h2 className="sales-header-title">
                            <i className="fa fa-cash-register" />
                            Nueva Venta
                        </h2>
                        <button className="sales-close-btn" onClick={onClose}>
                            <i className="fa fa-times" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="sales-tabs">
                        <button 
                            className={`sales-tab ${activeTab === 'filtros' ? 'active' : ''}`}
                            onClick={() => setActiveTab('filtros')}
                        >
                            <i className="fa fa-filter sales-tab-icon" />
                            <span className="sales-tab-label">Filtros</span>
                        </button>
                        <button 
                            className={`sales-tab ${activeTab === 'productos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('productos')}
                        >
                            <i className="fa fa-box sales-tab-icon" />
                            <span className="sales-tab-label">Productos</span>
                            {productosVisibles.length > 0 && (
                                <span className="sales-tab-badge">{productosVisibles.length}</span>
                            )}
                        </button>
                        <button 
                            className={`sales-tab ${activeTab === 'servicios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('servicios')}
                        >
                            <i className="fa fa-concierge-bell sales-tab-icon" />
                            <span className="sales-tab-label">Servicios</span>
                            {serviciosVisibles.length > 0 && (
                                <span className="sales-tab-badge">{serviciosVisibles.length}</span>
                            )}
                        </button>
                        <button 
                            className={`sales-tab cart-tab ${activeTab === 'carrito' ? 'active' : ''}`}
                            onClick={() => setActiveTab('carrito')}
                        >
                            <i className="fa fa-shopping-cart sales-tab-icon" />
                            <span className="sales-tab-label">Carrito</span>
                            {cartItems.length > 0 && (
                                <span className="sales-tab-badge">{cartItems.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="sales-content">
                        {/* Panel Filtros */}
                        <div className={`sales-panel ${activeTab === 'filtros' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
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
                        <div className={`sales-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
                                <i className="fa fa-box" />
                                Productos Disponibles ({productosVisibles.length})
                            </h2>
                            
                            {productosVisibles.length > 0 ? (
                                <div className="sales-products-grid">
                                    {productosVisibles.map((product) => (
                                        <ProductCard 
                                            key={product.producto_id} 
                                            product={product} 
                                            onAddToCart={addToCart} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="sales-empty">
                                    <i className="fa fa-box-open" />
                                    <p>No hay productos disponibles</p>
                                </div>
                            )}

                            {productosCompuestosVisibles.length > 0 && (
                                <>
                                    <h2 className="sales-section-title sales-divider">
                                        <i className="fa fa-boxes" />
                                        Productos Compuestos ({productosCompuestosVisibles.length})
                                    </h2>
                                    <div className="sales-products-grid">
                                        {productosCompuestosVisibles.map((compuesto) => (
                                            <ProductCard 
                                                key={`compuesto-${compuesto.producto_compuesto_id}`}
                                                product={{
                                                    ...compuesto,
                                                    producto_id: compuesto.producto_compuesto_id,
                                                    precio: compuesto.precio_venta,
                                                    stock: 999,
                                                    descripcion: compuesto.descripcion || "Producto compuesto"
                                                }}
                                                onAddToCart={() => addToCart(compuesto, "producto_compuesto")}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Panel Servicios */}
                        <div className={`sales-panel ${activeTab === 'servicios' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
                                <i className="fa fa-concierge-bell" />
                                Servicios Disponibles ({serviciosVisibles.length})
                            </h2>
                            
                            {serviciosVisibles.length > 0 ? (
                                <div className="sales-products-grid">
                                    {serviciosVisibles.map((service) => (
                                        <ServiceCard 
                                            key={service.servicio_id} 
                                            service={service} 
                                            onAddToCart={addToCart} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="sales-empty">
                                    <i className="fa fa-concierge-bell" />
                                    <p>No hay servicios disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Panel Carrito */}
                        <div className={`sales-panel ${activeTab === 'carrito' ? 'active' : ''}`}>
                            <Cart
                                cartItems={cartItems}
                                clients={clientes}
                                increaseQuantity={increaseQuantity}
                                decreaseQuantity={decreaseQuantity}
                                removeItem={removeFromCart}
                                isPurchase={false}
                                handleSubmit={handleSell}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesModal;