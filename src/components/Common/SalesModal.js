import React, { useState, useEffect } from "react";
import "../../assets/styles/SalesModal.css";
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
    const [activeTab, setActiveTab] = useState('productos'); // Para móvil
    const [showFilters, setShowFilters] = useState(false); // Toggle filtros en móvil

    const [filters, setFilters] = useState({
        search: "",
        priceRange: { min: 0, max: 10000 },
        stockRange: { min: 0, max: 1000 },
        selectedColors: [],
        selectedCategories: [],
        selectedSegments: [],
        selectedProducts: []
    });

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
            console.log("Productos compuestos cargados:", data);
            setProductosCompuestos(data);
        } catch (error) {
            console.error("Error al cargar productos compuestos:", error);
        }
    };

    // Filtrar los datos dinámicamente
    const handleFilter = (updatedFilters) => {
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        // Actualizar el stock de los productos basado en el carrito
        let updatedStockProducts = products.map((producto) => {
            const cartItem = cartItems.find((item) => item.producto_id === producto.producto_id && item.itemType === "producto");
            if (cartItem) {
                return { ...producto, stock: cartItem.stock };
            }
            return producto;
        });

        // Filtrar productos sin stock
        updatedStockProducts = updatedStockProducts.filter(producto => producto.stock > 0);

        // Aplicar filtros sobre los productos con stock actualizado
        let filteredProducts = [...updatedStockProducts];
        let filteredServices = [...servicios];
        let filteredCompuestos = [...productosCompuestos];

        // Filtrar productos y servicios por búsqueda
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

        // Filtrar por rango de precio
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

        // Filtrar por stock
        if (newFilters.stockRange.min >= 0 && newFilters.stockRange.max >= 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return producto.stock >= newFilters.stockRange.min && producto.stock <= newFilters.stockRange.max;
            });
        }

        // Filtrar por colores seleccionados
        if (newFilters.selectedColors.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedColors.includes(producto.color);
            });
        }

        // Filtrar por categorías seleccionadas
        if (newFilters.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedCategories.includes(producto.categoria);
            });
        }

        // Filtrar por segmentos seleccionados
        if (newFilters.selectedSegments.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedSegments.includes(producto.segmento);
            });
        }

        // Filtrar por productos seleccionados
        if (newFilters.selectedProducts.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedProducts.includes(producto.nombre);
            });
        }

        setServicios(filteredServices);
        setProductos(filteredProducts);
        setProductosCompuestos(filteredCompuestos);
    };

    // Verificar si hay stock suficiente de los componentes de un producto compuesto
    const verificarStockCompuesto = (compuesto, cantidadSolicitada = 1) => {
        if (!compuesto.componentes || compuesto.componentes.length === 0) {
            return false;
        }

        for (const componente of compuesto.componentes) {
            const productoEnInventario = products.find(p => p.producto_id === componente.producto_id);
            
            if (!productoEnInventario) {
                console.log(`Componente ${componente.producto_id} no encontrado en inventario`);
                return false;
            }

            // Calcular cuánto se ha usado ya en el carrito
            const cantidadEnCarrito = cartItems
                .filter(item => item.itemType === "producto_compuesto")
                .reduce((total, item) => {
                    const comp = item.componentes?.find(c => c.producto_id === componente.producto_id);
                    return total + (comp ? comp.cantidad * item.cantidad : 0);
                }, 0);

            const stockNecesario = componente.cantidad * cantidadSolicitada;
            const stockDisponible = productoEnInventario.stock - cantidadEnCarrito;

            console.log(`Componente ${componente.nombre}: necesita ${stockNecesario}, disponible ${stockDisponible}`);

            if (stockDisponible < stockNecesario) {
                return false;
            }
        }

        return true;
    };

    // Agregar producto, servicio o compuesto al carrito
    const addToCart = (item, itemType) => {
        console.log("Agregando al carrito:", item, itemType);

        // Validar stock para productos normales
        if (itemType === "producto" && item.stock <= 0) {
            alert("No hay stock suficiente de este producto");
            return;
        }

        // Validar stock de componentes para productos compuestos
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
            // Validar stock antes de incrementar
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

        // Actualizar stock de productos normales
        if (itemType === "producto") {
            const updatedProducts = productos.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductos(updatedProducts.filter((producto) => producto.stock > 0));
        }
    };

    // Aumentar cantidad
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

        // Validar stock
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

        // Actualizar stock de productos
        if (item.itemType === "producto") {
            const updatedProducts = productos.map((producto) =>
                producto.producto_id === item.producto_id
                    ? { ...producto, stock: producto.stock - 1 }
                    : producto
            );
            setProductos(updatedProducts.filter((producto) => producto.stock > 0));
        }
    };

    // Disminuir cantidad
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

        // Actualizar stock de productos
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

    // Manejar el registro de la venta
    const handleSell = async (cartItems, client, paymentmethod, total) => {
        if (!client || !paymentmethod || cartItems.length === 0 || total <= 0) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        console.log("Cart items antes de enviar:", cartItems);

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

        console.log("Venta Data enviada:", ventaData);

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

    // Estilos responsive inline
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '10px',
        },
        modal: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1400px',
            height: '95vh',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        },
        closeBtn: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff4757',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#fff',
            fontSize: '18px',
        },
        mobileNav: {
            display: 'none',
            padding: '10px',
            gap: '5px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
        },
        tabBtn: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
        },
        container: {
            display: 'grid',
            gridTemplateColumns: '250px 1fr 1fr 350px',
            gap: '15px',
            padding: '15px',
            height: 'calc(100% - 50px)',
            overflow: 'hidden',
        },
        section: {
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#333',
            position: 'sticky',
            top: 0,
            backgroundColor: '#f8f9fa',
            paddingBottom: '10px',
            zIndex: 1,
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px',
        },
        filterToggle: {
            display: 'none',
            padding: '10px 15px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
        },
    };

    // Media query styles (aplicados condicionalmente)
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth <= 1024 && window.innerWidth > 768;

    if (isMobile) {
        styles.mobileNav.display = 'flex';
        styles.container.gridTemplateColumns = '1fr';
        styles.container.padding = '10px';
        styles.container.height = 'calc(100% - 110px)';
        styles.filterToggle.display = 'block';
    } else if (isTablet) {
        styles.container.gridTemplateColumns = '200px 1fr 300px';
    }

    return (
        <div style={styles.overlay} className="sales-modal-overlay">
            <div style={styles.modal} className="sales-modal">
                <button style={styles.closeBtn} onClick={onClose}>
                    <i className="fa fa-times" />
                </button>

                {/* Navegación móvil con tabs */}
                <div style={styles.mobileNav} className="mobile-nav">
                    <button 
                        style={{
                            ...styles.tabBtn,
                            backgroundColor: activeTab === 'filtros' ? '#667eea' : '#e9ecef',
                            color: activeTab === 'filtros' ? '#fff' : '#495057',
                        }}
                        onClick={() => setActiveTab('filtros')}
                    >
                        <i className="fa fa-filter" /> Filtros
                    </button>
                    <button 
                        style={{
                            ...styles.tabBtn,
                            backgroundColor: activeTab === 'productos' ? '#667eea' : '#e9ecef',
                            color: activeTab === 'productos' ? '#fff' : '#495057',
                        }}
                        onClick={() => setActiveTab('productos')}
                    >
                        <i className="fa fa-box" /> Productos ({productos.length})
                    </button>
                    <button 
                        style={{
                            ...styles.tabBtn,
                            backgroundColor: activeTab === 'servicios' ? '#667eea' : '#e9ecef',
                            color: activeTab === 'servicios' ? '#fff' : '#495057',
                        }}
                        onClick={() => setActiveTab('servicios')}
                    >
                        <i className="fa fa-concierge-bell" /> Servicios ({servicios.length})
                    </button>
                    <button 
                        style={{
                            ...styles.tabBtn,
                            backgroundColor: activeTab === 'carrito' ? '#28a745' : '#e9ecef',
                            color: activeTab === 'carrito' ? '#fff' : '#495057',
                        }}
                        onClick={() => setActiveTab('carrito')}
                    >
                        <i className="fa fa-shopping-cart" /> Carrito ({cartItems.length})
                    </button>
                </div>

                <div style={styles.container} className="sales-container">
                    {/* Filtros */}
                    <div 
                        style={{
                            ...styles.section,
                            display: isMobile ? (activeTab === 'filtros' ? 'flex' : 'none') : 'flex',
                        }} 
                        className="filters-section"
                    >
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

                    {/* Lista de Productos */}
                    <div 
                        style={{
                            ...styles.section,
                            display: isMobile ? (activeTab === 'productos' ? 'flex' : 'none') : 'flex',
                        }}
                        className="products-section"
                    >
                        <h2 style={styles.sectionTitle}>Productos</h2>
                        <div style={styles.grid} className="products-grid">
                            {productos.map((product) => (
                                <ProductCard 
                                    key={product.producto_id} 
                                    product={product} 
                                    onAddToCart={addToCart} />
                            ))}
                        </div>

                        {/* Productos Compuestos */}
                        {productosCompuestos.length > 0 && (
                            <>
                                <h2 style={{ ...styles.sectionTitle, marginTop: '20px', borderTop: '2px solid #dee2e6', paddingTop: '15px' }}>
                                    Productos Compuestos
                                </h2>
                                <div style={styles.grid} className="products-grid">
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

                    {/* Lista de Servicios */}
                    <div 
                        style={{
                            ...styles.section,
                            display: isMobile ? (activeTab === 'servicios' ? 'flex' : 'none') : 'flex',
                        }}
                        className="services-section"
                    >
                        <h2 style={styles.sectionTitle}>Servicios</h2>
                        <div style={styles.grid} className="services-grid">
                            {servicios.map((service) => (
                                <ServiceCard 
                                    key={service.servicio_id} 
                                    service={service} 
                                    onAddToCart={addToCart} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* Carrito */}
                    <div 
                        style={{
                            ...styles.section,
                            display: isMobile ? (activeTab === 'carrito' ? 'flex' : 'none') : 'flex',
                            backgroundColor: '#fff',
                            border: '2px solid #28a745',
                        }}
                        className="cart-section"
                    >
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

            <style>{`
                @media (max-width: 768px) {
                    .sales-modal-overlay .mobile-nav {
                        display: flex !important;
                    }
                    .sales-modal-overlay .sales-container {
                        grid-template-columns: 1fr !important;
                        height: calc(100% - 110px) !important;
                    }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .sales-modal-overlay .sales-container {
                        grid-template-columns: 200px 1fr 300px !important;
                    }
                    .sales-modal-overlay .services-section {
                        display: none;
                    }
                }
                @media (min-width: 769px) {
                    .sales-modal-overlay .mobile-nav {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SalesModal;