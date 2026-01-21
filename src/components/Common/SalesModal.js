import React, { useState, useEffect } from "react";
import Filters from "./Filters";
import ProductCard from "./ProductCard";
import ServiceCard from "./ServiceCard";
import Cart from "./Cart";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { createVenta } from "../../api/ventas";
import axiosInstance from "../../api/axiosConfig";

const SalesModal = ({ isOpen, onClose, products, services, clientes, fetchProducts, fetchServices, fetchVentas }) => {

    if (!isOpen) return null;

    const [productos, setProductos] = useState(products);
    const [productosCompuestos, setProductosCompuestos] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [servicios, setServicios] = useState(services);
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
        } catch (error) {
            console.error("Error al cargar productos compuestos:", error);
        }
    };

    const handleFilter = (updatedFilters) => {
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        let updatedStockProducts = products.map((producto) => {
            const cartItem = cartItems.find((item) => item.producto_id === producto.producto_id && item.itemType === "producto");
            if (cartItem) {
                return { ...producto, stock: cartItem.stock };
            }
            return producto;
        });

        updatedStockProducts = updatedStockProducts.filter(producto => producto.stock > 0);

        let filteredProducts = [...updatedStockProducts];
        let filteredServices = [...services];
        let filteredCompuestos = [...productosCompuestos];

        // Filtrar por búsqueda
        if (newFilters.search !== "") {
            const search = newFilters.search.toLowerCase();
            filteredProducts = filteredProducts.filter((producto) => {
                return (
                    producto.nombre.toLowerCase().includes(search) ||
                    producto.descripcion?.toLowerCase().includes(search) ||
                    producto.categoria?.toLowerCase().includes(search) ||
                    producto.segmento?.toLowerCase().includes(search) ||
                    producto.color?.toLowerCase().includes(search)
                );
            });
            filteredServices = filteredServices.filter((servicio) => {
                return (
                    servicio.nombre.toLowerCase().includes(search) ||
                    servicio.descripcion?.toLowerCase().includes(search)
                );
            });
            filteredCompuestos = filteredCompuestos.filter((compuesto) => {
                return (
                    compuesto.nombre.toLowerCase().includes(search) ||
                    compuesto.descripcion?.toLowerCase().includes(search)
                );
            });
        }

        // Filtrar por rango de precios
        if (newFilters.priceRange.min >= 0 && newFilters.priceRange.max >= 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return producto.precio >= newFilters.priceRange.min && producto.precio <= newFilters.priceRange.max;
            });
            filteredServices = filteredServices.filter((servicio) => {
                return servicio.precio >= newFilters.priceRange.min && servicio.precio <= newFilters.priceRange.max;
            });
            filteredCompuestos = filteredCompuestos.filter((compuesto) => {
                return compuesto.precio_venta >= newFilters.priceRange.min && compuesto.precio_venta <= newFilters.priceRange.max;
            });
        }

        // Filtrar por rango de stock
        if (newFilters.stockRange.min >= 0 && newFilters.stockRange.max >= 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return producto.stock >= newFilters.stockRange.min && producto.stock <= newFilters.stockRange.max;
            });
        }

        // Filtrar por colores
        if (newFilters.selectedColors && newFilters.selectedColors.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedColors.includes(producto.color);
            });
        }

        // Filtrar por categorías
        if (newFilters.selectedCategories && newFilters.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedCategories.includes(producto.categoria);
            });
        }

        // Filtrar por segmentos
        if (newFilters.selectedSegments && newFilters.selectedSegments.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedSegments.includes(producto.segmento);
            });
        }

        // Filtrar por nombre de producto
        if (newFilters.selectedProducts && newFilters.selectedProducts.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedProducts.includes(producto.nombre);
            });
        }

        setServicios(filteredServices);
        setProductos(filteredProducts);
        setProductosCompuestos(filteredCompuestos);
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
            const updatedProducts = productos.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductos(updatedProducts.filter((producto) => producto.stock > 0));
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
            const updatedProducts = productos.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductos(updatedProducts.filter((producto) => producto.stock > 0));
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
            let updatedProducts = productos.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock + 1 }
                    : producto
            );

            if (!productos.some((p) => p.producto_id === item.producto_id) && item.stock > 0) {
                updatedProducts = [...updatedProducts, { ...item, stock: item.stock }];
            }

            setProductos(updatedProducts);
        }
    };

    // Eliminar item del carrito completamente
    const removeFromCart = (item) => {
        const itemIdKey = item.itemType === "producto" ? "producto_id" : 
                         item.itemType === "servicio" ? "servicio_id" : 
                         "producto_compuesto_id";

        const newCartItems = cartItems.filter(
            (cartItem) => !(cartItem[itemIdKey] === item[itemIdKey] && cartItem.itemType === item.itemType)
        );

        setCartItems(newCartItems);

        // Restaurar stock si es producto
        if (item.itemType === "producto") {
            const originalProduct = products.find(p => p.producto_id === item.producto_id);
            if (originalProduct) {
                const restoredProduct = { ...originalProduct };
                const updatedProducts = productos.some(p => p.producto_id === item.producto_id)
                    ? productos.map(p => p.producto_id === item.producto_id ? restoredProduct : p)
                    : [...productos, restoredProduct];
                setProductos(updatedProducts);
            }
        }

        // Restaurar servicio si fue eliminado
        if (item.itemType === "servicio") {
            const originalService = services.find(s => s.servicio_id === item.servicio_id);
            if (originalService && !servicios.some(s => s.servicio_id === item.servicio_id)) {
                setServicios([...servicios, originalService]);
            }
        }
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

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

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
                            {productos.length > 0 && (
                                <span className="sales-tab-badge">{productos.length}</span>
                            )}
                        </button>
                        <button 
                            className={`sales-tab ${activeTab === 'servicios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('servicios')}
                        >
                            <i className="fa fa-concierge-bell sales-tab-icon" />
                            <span className="sales-tab-label">Servicios</span>
                            {servicios.length > 0 && (
                                <span className="sales-tab-badge">{servicios.length}</span>
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
                                onFilterChange={handleFilter}
                            />
                        </div>

                        {/* Panel Productos */}
                        <div className={`sales-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
                                <i className="fa fa-box" />
                                Productos Disponibles ({productos.length})
                            </h2>
                            
                            {productos.length > 0 ? (
                                <div className="sales-products-grid">
                                    {productos.map((product) => (
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

                            {productosCompuestos.length > 0 && (
                                <>
                                    <h2 className="sales-section-title sales-divider">
                                        <i className="fa fa-boxes" />
                                        Productos Compuestos ({productosCompuestos.length})
                                    </h2>
                                    <div className="sales-products-grid">
                                        {productosCompuestos.map((compuesto) => (
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
                                Servicios Disponibles ({servicios.length})
                            </h2>
                            
                            {servicios.length > 0 ? (
                                <div className="sales-products-grid">
                                    {servicios.map((service) => (
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