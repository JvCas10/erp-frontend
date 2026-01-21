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


        // Filtrar por bÃºsqueda
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
            costo: item.costo || 0  // Usamos el COSTO del producto, no el precio
        });

        setCartItems(newCartItems);

        const newProducts = productos.filter((product) => product.producto_id !== item.producto_id);
        setProductos(newProducts);
    };


    // Manejar el cambio de la cantidad
    const handleQuantityChange = (producto, cantidad) => {
        // Actualizar la cantidad del producto en el carrito
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

        // Restaurar el producto a la lista
        const newProducts = [...productos, producto];
        setProductos(newProducts);
    };


    // Manejar el registro de la compra y cerrar el modal
    const handlePurchase = async (cartItems, provider, total) => {
        if (!provider || cartItems.length === 0 || total <= 0) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        // Construir el JSON con el formato esperado por la API
        const compraData = {
            proveedor_id: provider.proveedor_id,
            fecha: getCurrentDateTime(),
            total: total,
            detalles: cartItems.map((item) => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.costo  // Usamos el COSTO, no el precio
            }))
        }

        console.log("Envia la compra:", compraData);

        // Llamar a la API para crear la compra
        const response = await createCompra(compraData);

        // Mostrar el mensaje del backend en un alert
        alert(response.message);

        if (response.success) {
            onClose();
            fetchProducts();
            fetchCompras();
        }
    }

    return (
        <div className="compra-modal-overlay">
            <div className="compra-modal">
                <button className="close-btn" onClick={onClose}>
                    <i className="fa fa-times" />
                </button>

                <div className="compra-container">
                    {/* Filtros */}
                    <div className="filters-section">
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
                    <div className="products-section">
                        <h2>Productos</h2>
                        <div className="products-grid">
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
                    <div className="cart-section">
                        <Cart
                            cartItems={cartItems}
                            providers={proveedores}
                            isPurchase={true}
                            handleQuantityChange={handleQuantityChange}
                            handleRemoveCart={removeFromCart}
                            handleSubmit={handlePurchase}
                        />
                    </div>
                </div>

            </div>
        </div>

    );
};

export default CompraModal;