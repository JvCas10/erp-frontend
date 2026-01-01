import React, { useState, useEffect } from 'react';
import '../../assets/styles/Filters.css';

import { getClientesNombres, getProductosNombres, getProveedoresNombres, getColoresProductos, getCategoriasProductos, getEmployeesNames } from '../../api/filters';

const Filters = ({
    showSearchBar = false,
    showDateRange = false,
    showStatus = false,
    showPriceRange = false,
    showClientNames = false,
    showProductName = false,
    showEmployeeNames = false,
    showPaymentMethod = false,
    showProviderNames = false,
    showStockRange = false,
    showColorOptions = false,
    showCategories = false,
    showSegments = false,
    onFilterChange,
}) => {
    // Estados para almacenar selecciones
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [stockRange, setStockRange] = useState({ min: 0, max: 1000 });
    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState([]);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSegments, setSelectedSegments] = useState([]);

    // Campos de los filtros estaticos
    const [clientNames, setClientNames] = useState([]);
    const [employeesNames, setEmployeesNames] = useState([]);
    const [productNames, setProductNames] = useState([]);
    const [providerNames, setProviderNames] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const statusOptions = ['activo', 'inactivo']; // Opciones de estado
    const paymentMethods = ['tarjeta', 'transferencia', 'efectivo']; // Opciones de método de pago

    // Obtener nombres de clientes al cargar el componente
    const fetchClientNames = async () => {
        try {

            const nombres = await getClientesNombres();
            setClientNames(nombres);

        } catch (error) {
            console.error('Error al obtener los nombres de los clientes:', error);
        }
    };

    // Obtener nombres de clientes al cargar el componente
    const fetchEmployeesNames = async () => {
        try {

            const nombres = await getEmployeesNames();
            setEmployeesNames(nombres);

        } catch (error) {
            console.error('Error al obtener los nombres de los empleados:', error);
        }
    };

    // Obtener nombres de productos al cargar el componente
    const fetchProductNames = async () => {
        try {
            const nombres = await getProductosNombres();
            setProductNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los productos:', error);
        }
    };

    // Obtener nombres de proveedores al cargar el componente
    const fetchProviderNames = async () => {
        try {
            const nombres = await getProveedoresNombres();
            setProviderNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los proveedores:', error);
        }
    };

    // Obtener colores de productos al cargar el componente
    const fetchColorOptions = async () => {
        try {
            const colores = await getColoresProductos();
            setColorOptions(colores);
        } catch (error) {
            console.error('Error al obtener los colores de los productos:', error);
        }
    };

    // Obtener categorias de productos al cargar el componente
    const fetchCategoryOptions = async () => {
        try {
            const categorias = await getCategoriasProductos();
            setCategoryOptions(categorias);
        } catch (error) {
            console.error('Error al obtener las categorias de los productos:', error);
        }
    };

    useEffect(() => {
        fetchClientNames();
        fetchEmployeesNames();
        fetchProductNames();
        fetchProviderNames();
        fetchColorOptions();
        fetchCategoryOptions();
    }, []);


    // Manejo de cambios en los filtros
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        onFilterChange({ search: e.target.value });
    };

    const handleDateRangeChange = (field, value) => {
        const newDateRange = { ...dateRange, [field]: value };

        // Validar que la fecha de inicio no sea mayor que la de fin y viceversa
        if (field === 'start' && new Date(value) > new Date(newDateRange.end)) {
            return; // No actualiza si la fecha de inicio es mayor que la fecha de fin
        }

        if (field === 'end' && new Date(value) < new Date(newDateRange.start)) {
            return; // No actualiza si la fecha de fin es menor que la fecha de inicio
        }

        setDateRange(newDateRange); // Actualizar rango de fechas
        onFilterChange({ dateRange: newDateRange }); // Llamar al callback
    };


    const handleStatusChange = (e) => {
        let updatedStatus;
        let status = e.target.value;

        if (selectedStatus.includes(status)) {
            // Si ya está seleccionado, desmarcarlo
            updatedStatus = selectedStatus.filter((s) => s !== status);
        } else {
            // Si no está seleccionado, agregarlo
            updatedStatus = [...selectedStatus, status];
        }

        setSelectedStatus(updatedStatus); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedStatus: updatedStatus }); // Llama al filtro con la lista actualizada
    };

    const handlePriceRangeChange = (field, value) => {
        setPriceRange({ ...priceRange, [field]: value });
        onFilterChange({ priceRange: { ...priceRange, [field]: value } });
    }

    const handleStockRangeChange = (field, value) => {
        setStockRange({ ...stockRange, [field]: value });
        onFilterChange({ stockRange: { ...stockRange, [field]: value } });
    }

    const handleClientNameChange = (e) => {
        let updatedClients;
        let name = e.target.value;

        if (selectedClients.includes(name)) {
            // Si ya está seleccionado, desmarcarlo
            updatedClients = selectedClients.filter((client) => client !== name);
        } else {
            // Si no está seleccionado, agregarlo
            updatedClients = [...selectedClients, name];
        }

        setSelectedClients(updatedClients); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedClients: updatedClients }); // Llama al filtro con la lista actualizada
    };

    const handleEmployeeNameChange = (e) => {
        let updatedEmployees;
        let name = e.target.value;

        if (selectedEmployees.includes(name)) {
            // Si ya está seleccionado, desmarcarlo
            updatedEmployees = selectedEmployees.filter((employee) => employee !== name);
        } else {
            // Si no está seleccionado, agregarlo
            updatedEmployees = [...selectedEmployees, name];
        }

        setSelectedEmployees(updatedEmployees); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedEmployees: updatedEmployees }); // Llama al filtro con la lista actualizada
    };


    const handleProductNameChange = (e) => {
        let updatedProducts;
        let name = e.target.value;

        if (selectedProducts.includes(name)) {
            // Si ya está seleccionado, desmarcarlo
            updatedProducts = selectedProducts.filter((product) => product !== name);
        } else {
            // Si no está seleccionado, agregarlo
            updatedProducts = [...selectedProducts, name];
        }

        setSelectedProducts(updatedProducts); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedProducts: updatedProducts }); // Llama al filtro con la lista actualizada
    }

    const handlePaymentMethodChange = (e) => {
        let updatedPaymentMethods;
        let method = e.target.value;

        if (selectedPaymentMethod.includes(method)) {
            // Si ya está seleccionado, desmarcarlo
            updatedPaymentMethods = selectedPaymentMethod.filter((m) => m !== method);
        } else {
            // Si no está seleccionado, agregarlo
            updatedPaymentMethods = [...selectedPaymentMethod, method];
        }

        setSelectedPaymentMethod(updatedPaymentMethods); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedPaymentMethod: updatedPaymentMethods }); // Llama al filtro con la lista
    }

    const handleProviderNameChange = (e) => {
        let updatedProviders;
        let name = e.target.value;

        if (selectedProviders.includes(name)) {
            // Si ya está seleccionado, desmarcarlo
            updatedProviders = selectedProviders.filter((provider) => provider !== name);
        } else {
            // Si no está seleccionado, agregarlo
            updatedProviders = [...selectedProviders, name];
        }

        setSelectedProviders(updatedProviders); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedProveedores: updatedProviders }); // Llama al filtro con la lista actualizada
    }

    const handleColorChange = (e) => {
        let updatedColors;
        let color = e.target.value;

        if (selectedColors.includes(color)) {
            // Si ya está seleccionado, desmarcarlo
            updatedColors = selectedColors.filter((c) => c !== color);
        } else {
            // Si no está seleccionado, agregarlo
            updatedColors = [...selectedColors, color];
        }

        setSelectedColors(updatedColors); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedColors: updatedColors }); // Llama al filtro con la lista actualizada
    }

    const handleCategoryChange = (e) => {
        let updatedCategories;
        let category = e.target.value;

        if (selectedCategories.includes(category)) {
            // Si ya está seleccionado, desmarcarlo
            updatedCategories = selectedCategories.filter((c) => c !== category);
        } else {
            // Si no está seleccionado, agregarlo
            updatedCategories = [...selectedCategories, category];
        }

        setSelectedCategories(updatedCategories); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedCategories: updatedCategories }); // Llama al filtro con la lista actualizada
    }

    const handleSegmentChange = (e) => {
        let updatedSegments;
        let segment = e.target.value;

        if (selectedSegments.includes(segment)) {
            // Si ya está seleccionado, desmarcarlo
            updatedSegments = selectedSegments.filter((s) => s !== segment);
        } else {
            // Si no está seleccionado, agregarlo
            updatedSegments = [...selectedSegments, segment];
        }

        setSelectedSegments(updatedSegments); // Actualiza el estado con la nueva lista
        onFilterChange({ selectedSegments: updatedSegments }); // Llama al filtro con la lista actualizada
    }

    return (
        <div className="card">
            <h2>Filtros</h2>

            {/* Búsqueda */}
            {showSearchBar && (
                <div className="filter">
                    <label>Búsqueda</label>
                    <input type="text" placeholder="Buscar por coincidencia..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{ width: "95%" }}
                    />
                </div>
            )}
            {/* Rango de Fechas */}
            {showDateRange && (
                <div className="filter">
                    <label>Rango de Fechas</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateRangeChange('start', e.target.value)}
                        style={{ width: "95%" }}
                    />
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateRangeChange('end', e.target.value)}
                        style={{ width: "95%" }}
                    />
                </div>)
            }

            {/* Estado (Activo/Inactivo) */}
            {showStatus && (
                <div className="filter">
                    <label>Estado</label>
                    <div className="combobox-container">
                        <select onChange={handleStatusChange} value="">
                            <option value="">Seleccionar estado...</option>
                            {statusOptions
                                .filter((name) => !selectedClients.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedStatus.map((name) => (
                            <button key={name} className="chip" onClick={() => handleStatusChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Rango de Precios */}
            {showPriceRange && (
                <div className="filter">
                    <label>Rango de Precios</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            min="0"
                            max="10000"
                            step="500"
                            value={priceRange.min}
                            onChange={(e) => {
                                const newMin = Number(e.target.value);
                                if (newMin <= priceRange.max) {
                                    handlePriceRangeChange('min', newMin);
                                }
                            }}
                            placeholder="Mín"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            min="0"
                            max="10000"
                            step="500"
                            value={priceRange.max}
                            onChange={(e) => {
                                const newMax = Number(e.target.value);
                                if (newMax >= priceRange.min) {
                                    handlePriceRangeChange('max', newMax);
                                }
                            }}
                            placeholder="Máx"
                        />
                    </div>
                    <span>De Q{priceRange.min} a Q{priceRange.max}</span>
                </div>
            )}

            {/* Rango de Stock */}
            {showStockRange && (
                <div className="filter">
                    <label>Rango de Stock</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            min="0"
                            max="1000"
                            step="50"
                            value={stockRange.min}
                            onChange={(e) => {
                                const newMin = Number(e.target.value);
                                if (newMin <= stockRange.max) {
                                    handleStockRangeChange('min', newMin);
                                }
                            }}
                            placeholder="Mín"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            min="0"
                            max="1000"
                            step="50"
                            value={stockRange.max}
                            onChange={(e) => {
                                const newMax = Number(e.target.value);
                                if (newMax >= stockRange.min) {
                                    handleStockRangeChange('max', newMax);
                                }
                            }}
                            placeholder="Máx"
                        />
                    </div>
                    <span>De {stockRange.min} a {stockRange.max} unidades</span>
                </div>
            )}


            {/* Nombres de Clientes */}
            {showClientNames && (
                <div className="filter">
                    <label>Cliente</label>
                    <div className="combobox-container">
                        <select onChange={handleClientNameChange} value="">
                            <option value="">Seleccionar cliente...</option>
                            {clientNames
                                .filter((name) => !selectedClients.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedClients.map((name) => (
                            <button key={name} className="chip" onClick={() => handleClientNameChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Nombres de Empleados */}
            {showEmployeeNames && (
                <div className="filter">
                    <label>Empleado</label>
                    <div className="combobox-container">
                        <select onChange={handleEmployeeNameChange} value="">
                            <option value="">Seleccionar empleado...</option>
                            {employeesNames
                                .filter((name) => !selectedEmployees.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedEmployees.map((name) => (
                            <button key={name} className="chip" onClick={() => handleEmployeeNameChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Nombre de Producto */}
            {showProductName && (
                <div className="filter">
                    <label>Producto</label>
                    <div className="combobox-container">
                        <select onChange={handleProductNameChange} value="">
                            <option value="">Seleccionar producto...</option>
                            {productNames
                                .filter((name) => !selectedProducts.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedProducts.map((name) => (
                            <button key={name} className="chip" onClick={() => handleProductNameChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Método de Pago */}
            {showPaymentMethod && (
                <div className="filter">
                    <label>Metodo de Pago</label>
                    <div className="combobox-container">
                        <select onChange={handlePaymentMethodChange} value="">
                            <option value="">Seleccionar metodo...</option>
                            {paymentMethods
                                .filter((name) => !selectedPaymentMethod.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedPaymentMethod.map((name) => (
                            <button key={name} className="chip" onClick={() => handlePaymentMethodChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Nombre del Proveedor */}
            {showProviderNames && (
                <div className="filter">
                    <label>Proveedor</label>
                    <div className="combobox-container">
                        <select onChange={handleProviderNameChange} value="">
                            <option value="">Seleccionar proveedor...</option>
                            {providerNames
                                .filter((name) => !selectedProviders.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedProviders.map((name) => (
                            <button key={name} className="chip" onClick={() => handleProviderNameChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Opciones de Color */}
            {showColorOptions && (
                <div className="filter">
                    <label>Color</label>
                    <div className="combobox-container">
                        <select onChange={handleColorChange} value="">
                            <option value="">Seleccionar color...</option>
                            {colorOptions
                                .filter((name) => !selectedColors.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedColors.map((name) => (
                            <button key={name} className="chip" onClick={() => handleColorChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Categorías */}
            {showCategories && (
                <div className="filter">
                    <label>Categoria</label>
                    <div className="combobox-container">
                        <select onChange={handleCategoryChange} value="">
                            <option value="">Seleccionar categoria...</option>
                            {categoryOptions
                                .filter((name) => !selectedCategories.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="scroll-container">
                        {selectedCategories.map((name) => (
                            <button key={name} className="chip" onClick={() => handleCategoryChange({ target: { value: name } })}>
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Segmentos */}
            {showSegments && (
                <div className="filter">
                    <label>Segmento</label>
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Escribe el segmento..."
                            onChange={handleSegmentChange}
                        />
                    </div>
                    <div className="scroll-container">
                        {selectedSegments.map((name) => (
                            <button
                                key={name}
                                className="chip"
                                onClick={() =>
                                    handleSegmentChange({ target: { value: name } })
                                }
                            >
                                {name} <span className="remove">&times;</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filters;
