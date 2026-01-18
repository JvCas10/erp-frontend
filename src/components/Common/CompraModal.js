import React, { useState } from "react";
import "../../assets/styles/CompraModal.css";
import Filters from "../Common/Filters";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { getCurrentDateTime } from "../../utils/dateUtils";
import { createCompra } from "../../api/compras";

const CompraModal = ({ isOpen, onClose, products, proveedores, fetchProducts, fetchCompras }) => {
    
    if (!isOpen) return null;

    const [productos, setProductos] = useState(products);
    const [cartItems, setCartItems] = useState([]);
    const [activeTab, setActiveTab] = useState('productos'); // Para móvil

    const [filters, setFilters] = useState({
        search: "",
        priceRange: { min: 0, max: 10000 },
        stockRange: { min: 0, max: 1000 },
        selectedColors: [],
        selectedCategories: [],
        selectedSegments: [],
        selectedProducts: []
    });

    // Filtrar los datos dinamicamente
    const handleFilter = (updatedFilters) => {
        const newFilters = { ...filters, ...updatedFilters };
        setFilters(newFilters);

        // Primero, actualizar el stock de los productos basado en el carrito
        let filteredProducts = products.filter((producto) => {
            return !cartItems.some((item) => item.producto_id === producto.producto_id);
        });


        // Filtrar por búsqueda
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

        // Filtrar por rango de precios
        filteredProducts = filteredProducts.filter((producto) => {
            return producto.precio >= newFilters.priceRange.min && producto.precio <= newFilters.priceRange.max;
        });

        // Filtrar por rango de stock
        filteredProducts = filteredProducts.filter((producto) => {
            return producto.stock >= newFilters.stockRange.min && producto.stock <= newFilters.stockRange.max;
        });

        // Filtrar por colores
        if (newFilters.selectedColors.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedColors.includes(producto.color);
            });
        }

        // Filtrar por categorias
        if (newFilters.selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedCategories.includes(producto.categoria);
            });
        }

        // Filtrar por segmentos
        if (newFilters.selectedSegments.length > 0) {
            filteredProducts = filteredProducts.filter((producto) => {
                return newFilters.selectedSegments.includes(producto.segmento);
            });
        }

        setProductos(filteredProducts);
    }

    // Agregar un producto al carrito de compra a proveedores
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


    // Manejar el cambio de precio
    const handlePriceChange = (producto, precio) => {
        const newCartItems = cartItems.map((item) => {
            if (item.producto_id === producto.producto_id) {
                return { ...item, precio };
            }
            return item;
        });

        setCartItems(newCartItems);
    }

    // Manejar el cambio de la cantidad
    const handleQuantityChange = (producto, cantidad) => {
        const newCartItems = cartItems.map((item) => {
            if (item.producto_id === producto.producto_id) {
                return { ...item, cantidad };
            }
            return item;
        });

        setCartItems(newCartItems);
    }

    // Manejar el remove del producto, se retira del carrito
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


    // Manejar el registro de la compra y cerrar el modal
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

        console.log("Envia la compra:", compraData);

        const response = await createCompra(compraData);

        alert(response.message);

        if (response.success) {
            onClose();
            fetchProducts();
            fetchCompras();
        }
    }

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
            maxWidth: '1200px',
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
            gridTemplateColumns: '250px 1fr 350px',
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
    };

    // Detectar si es móvil
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <div style={styles.overlay} className="compra-modal-overlay">
            <div style={styles.modal} className="compra-modal">
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
                            backgroundColor: activeTab === 'carrito' ? '#28a745' : '#e9ecef',
                            color: activeTab === 'carrito' ? '#fff' : '#495057',
                        }}
                        onClick={() => setActiveTab('carrito')}
                    >
                        <i className="fa fa-shopping-cart" /> Carrito ({cartItems.length})
                    </button>
                </div>

                <div style={styles.container} className="compra-container">
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
                            showStockRange={true}
                            showColors={true}
                            showCategories={true}
                            showSegments={true}
                            onFilterChange={handleFilter}
                        />
                    </div>

                    {/* Productos */}
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
                            border: '2px solid #17a2b8',
                        }}
                        className="cart-section"
                    >
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

            <style>{`
                @media (max-width: 768px) {
                    .compra-modal-overlay .mobile-nav {
                        display: flex !important;
                    }
                    .compra-modal-overlay .compra-container {
                        grid-template-columns: 1fr !important;
                        height: calc(100% - 110px) !important;
                    }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .compra-modal-overlay .compra-container {
                        grid-template-columns: 200px 1fr 300px !important;
                    }
                }
                @media (min-width: 769px) {
                    .compra-modal-overlay .mobile-nav {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CompraModal;