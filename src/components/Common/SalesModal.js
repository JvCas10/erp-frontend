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
    const isTablet = windowWidth > 768 && windowWidth <= 1024;

    // Cargar productos compuestos al abrir el modal
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

    // Filtrar los datos dinámicamente
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
        let filteredServices = [...servicios];
        let filteredCompuestos = [...productosCompuestos];

        if (newFilters.search !== "") {
            const search = newFilters.search.toLowerCase();
            filteredProducts = filteredProducts.filter((producto) => {
                return (
                    producto.nombre.toLowerCase().includes(search) ||
                    producto.descripcion?.toLowerCase().includes(search) ||
                    producto.categoria?.toLowerCase().includes(search) ||
                    producto.segmento?.toLowerCase().includes(search)
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

        if (newFilters.stockRange.min >= 0 && newFilters.stockRange.max >= 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return producto.stock >= newFilters.stockRange.min && producto.stock <= newFilters.stockRange.max;
            });
        }

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

        if (newFilters.selectedProducts.length > 0) {
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

    // Calcular total del carrito
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
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 0;
                }
                
                .sales-modal {
                    background-color: #f5f5f5;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (min-width: 1025px) {
                    .sales-modal-overlay {
                        padding: 20px;
                    }
                    .sales-modal {
                        border-radius: 12px;
                        max-width: 1400px;
                        max-height: 95vh;
                        height: auto;
                    }
                }
                
                .sales-close-btn {
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
                
                .sales-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 2px solid #e0e0e0;
                    padding: 0;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    flex-shrink: 0;
                }
                
                .sales-tab {
                    flex: 1;
                    min-width: 80px;
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
                
                .sales-tab.active {
                    color: #667eea;
                    background: #f0f4ff;
                }
                
                .sales-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #667eea;
                }
                
                .sales-tab-icon {
                    font-size: 20px;
                }
                
                .sales-tab-badge {
                    position: absolute;
                    top: 5px;
                    right: 15px;
                    background: #667eea;
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
                
                .sales-tab.cart-tab {
                    background: #e8f5e9;
                }
                
                .sales-tab.cart-tab.active {
                    background: #c8e6c9;
                    color: #2e7d32;
                }
                
                .sales-tab.cart-tab.active::after {
                    background: #2e7d32;
                }
                
                .sales-content {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .sales-panel {
                    display: none;
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    -webkit-overflow-scrolling: touch;
                }
                
                .sales-panel.active {
                    display: block;
                }
                
                .sales-section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: #333;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #667eea;
                    display: flex;
                    align-items: center;
                }
                
                .sales-products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 12px;
                }
                
                @media (max-width: 400px) {
                    .sales-products-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }
                }
                
                .sales-divider {
                    margin: 25px 0 15px;
                    padding-top: 20px;
                    border-top: 2px dashed #ddd;
                }
                
                /* Desktop Layout */
                @media (min-width: 1025px) {
                    .sales-tabs {
                        display: none;
                    }
                    
                    .sales-content {
                        flex-direction: row;
                        padding: 15px;
                        gap: 15px;
                    }
                    
                    .sales-panel {
                        display: block !important;
                        border-radius: 8px;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    .sales-panel.filters-panel {
                        width: 250px;
                        flex-shrink: 0;
                    }
                    
                    .sales-panel.products-panel {
                        flex: 1;
                    }
                    
                    .sales-panel.services-panel {
                        width: 300px;
                        flex-shrink: 0;
                    }
                    
                    .sales-panel.cart-panel {
                        width: 350px;
                        flex-shrink: 0;
                        border: 2px solid #2e7d32;
                    }
                }
                
                /* Tablet Layout */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .sales-tabs {
                        display: none;
                    }
                    
                    .sales-content {
                        flex-direction: row;
                        flex-wrap: wrap;
                        padding: 10px;
                        gap: 10px;
                    }
                    
                    .sales-panel {
                        display: block !important;
                        border-radius: 8px;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    .sales-panel.filters-panel {
                        width: 200px;
                        flex-shrink: 0;
                    }
                    
                    .sales-panel.products-panel {
                        flex: 1;
                        min-width: 300px;
                    }
                    
                    .sales-panel.services-panel {
                        width: 100%;
                        order: 4;
                        max-height: 200px;
                    }
                    
                    .sales-panel.cart-panel {
                        width: 280px;
                        flex-shrink: 0;
                        border: 2px solid #2e7d32;
                    }
                }
            `}</style>
            
            <div className="sales-modal-overlay">
                <div className="sales-modal">
                    <button className="sales-close-btn" onClick={onClose}>
                        <i className="fa fa-times" />
                    </button>

                    {/* Tabs para móvil */}
                    <div className="sales-tabs">
                        <button 
                            className={`sales-tab ${activeTab === 'filtros' ? 'active' : ''}`}
                            onClick={() => setActiveTab('filtros')}
                        >
                            <i className="fa fa-filter sales-tab-icon" />
                            <span>Filtros</span>
                        </button>
                        <button 
                            className={`sales-tab ${activeTab === 'productos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('productos')}
                        >
                            <i className="fa fa-box sales-tab-icon" />
                            <span>Productos</span>
                            <span className="sales-tab-badge">{productos.length}</span>
                        </button>
                        <button 
                            className={`sales-tab ${activeTab === 'servicios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('servicios')}
                        >
                            <i className="fa fa-concierge-bell sales-tab-icon" />
                            <span>Servicios</span>
                            <span className="sales-tab-badge">{servicios.length}</span>
                        </button>
                        <button 
                            className={`sales-tab cart-tab ${activeTab === 'carrito' ? 'active' : ''}`}
                            onClick={() => setActiveTab('carrito')}
                        >
                            <i className="fa fa-shopping-cart sales-tab-icon" />
                            <span>Carrito</span>
                            {cartItems.length > 0 && (
                                <span className="sales-tab-badge" style={{background: '#2e7d32'}}>
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="sales-content">
                        {/* Panel Filtros */}
                        <div className={`sales-panel filters-panel ${activeTab === 'filtros' ? 'active' : ''}`}>
                            <Filters
                                showSearchBar={true}
                                showPriceRange={true}
                                showProductName={true}
                                showColorOptions={true}
                                showCategories={true}
                                showEmployeeNames={true}
                                showSegments={true}
                                onFilterChange={handleFilter}
                            />
                        </div>

                        {/* Panel Productos */}
                        <div className={`sales-panel products-panel ${activeTab === 'productos' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
                                <i className="fa fa-box" style={{marginRight: '10px', color: '#667eea'}} />
                                Productos ({productos.length})
                            </h2>
                            <div className="sales-products-grid">
                                {productos.map((product) => (
                                    <ProductCard 
                                        key={product.producto_id} 
                                        product={product} 
                                        onAddToCart={addToCart} 
                                    />
                                ))}
                            </div>

                            {productosCompuestos.length > 0 && (
                                <>
                                    <h2 className="sales-section-title sales-divider">
                                        <i className="fa fa-boxes" style={{marginRight: '10px', color: '#667eea'}} />
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
                        <div className={`sales-panel services-panel ${activeTab === 'servicios' ? 'active' : ''}`}>
                            <h2 className="sales-section-title">
                                <i className="fa fa-concierge-bell" style={{marginRight: '10px', color: '#667eea'}} />
                                Servicios ({servicios.length})
                            </h2>
                            <div className="sales-products-grid">
                                {servicios.map((service) => (
                                    <ServiceCard 
                                        key={service.servicio_id} 
                                        service={service} 
                                        onAddToCart={addToCart} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Panel Carrito */}
                        <div className={`sales-panel cart-panel ${activeTab === 'carrito' ? 'active' : ''}`}>
                            <Cart
                                cartItems={cartItems}
                                clients={clientes}
                                increaseQuantity={increaseQuantity}
                                decreaseQuantity={decreaseQuantity}
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