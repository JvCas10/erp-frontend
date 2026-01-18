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
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Campos de los filtros estaticos
    const [clientNames, setClientNames] = useState([]);
    const [employeesNames, setEmployeesNames] = useState([]);
    const [productNames, setProductNames] = useState([]);
    const [providerNames, setProviderNames] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const statusOptions = ['activo', 'inactivo'];
    const paymentMethods = ['tarjeta', 'transferencia', 'efectivo'];

    // Obtener nombres de clientes al cargar el componente
    const fetchClientNames = async () => {
        try {
            const nombres = await getClientesNombres();
            setClientNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los clientes:', error);
        }
    };

    const fetchEmployeesNames = async () => {
        try {
            const nombres = await getEmployeesNames();
            setEmployeesNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los empleados:', error);
        }
    };

    const fetchProductNames = async () => {
        try {
            const nombres = await getProductosNombres();
            setProductNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los productos:', error);
        }
    };

    const fetchProviderNames = async () => {
        try {
            const nombres = await getProveedoresNombres();
            setProviderNames(nombres);
        } catch (error) {
            console.error('Error al obtener los nombres de los proveedores:', error);
        }
    };

    const fetchColorOptions = async () => {
        try {
            const colores = await getColoresProductos();
            setColorOptions(colores);
        } catch (error) {
            console.error('Error al obtener los colores de los productos:', error);
        }
    };

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

        if (field === 'start' && new Date(value) > new Date(newDateRange.end)) {
            return;
        }

        if (field === 'end' && new Date(value) < new Date(newDateRange.start)) {
            return;
        }

        setDateRange(newDateRange);
        onFilterChange({ dateRange: newDateRange });
    };


    const handleStatusChange = (e) => {
        let updatedStatus;
        let status = e.target.value;

        if (selectedStatus.includes(status)) {
            updatedStatus = selectedStatus.filter((s) => s !== status);
        } else {
            updatedStatus = [...selectedStatus, status];
        }

        setSelectedStatus(updatedStatus);
        onFilterChange({ selectedStatus: updatedStatus });
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
            updatedClients = selectedClients.filter((client) => client !== name);
        } else {
            updatedClients = [...selectedClients, name];
        }

        setSelectedClients(updatedClients);
        onFilterChange({ selectedClients: updatedClients });
    };

    const handleEmployeeNameChange = (e) => {
        let updatedEmployees;
        let name = e.target.value;

        if (selectedEmployees.includes(name)) {
            updatedEmployees = selectedEmployees.filter((employee) => employee !== name);
        } else {
            updatedEmployees = [...selectedEmployees, name];
        }

        setSelectedEmployees(updatedEmployees);
        onFilterChange({ selectedEmployees: updatedEmployees });
    };


    const handleProductNameChange = (e) => {
        let updatedProducts;
        let name = e.target.value;

        if (selectedProducts.includes(name)) {
            updatedProducts = selectedProducts.filter((product) => product !== name);
        } else {
            updatedProducts = [...selectedProducts, name];
        }

        setSelectedProducts(updatedProducts);
        onFilterChange({ selectedProducts: updatedProducts });
    }

    const handlePaymentMethodChange = (e) => {
        let updatedPaymentMethods;
        let method = e.target.value;

        if (selectedPaymentMethod.includes(method)) {
            updatedPaymentMethods = selectedPaymentMethod.filter((m) => m !== method);
        } else {
            updatedPaymentMethods = [...selectedPaymentMethod, method];
        }

        setSelectedPaymentMethod(updatedPaymentMethods);
        onFilterChange({ selectedPaymentMethod: updatedPaymentMethods });
    }

    const handleProviderNameChange = (e) => {
        let updatedProviders;
        let name = e.target.value;

        if (selectedProviders.includes(name)) {
            updatedProviders = selectedProviders.filter((provider) => provider !== name);
        } else {
            updatedProviders = [...selectedProviders, name];
        }

        setSelectedProviders(updatedProviders);
        onFilterChange({ selectedProveedores: updatedProviders });
    }

    const handleColorChange = (e) => {
        let updatedColors;
        let color = e.target.value;

        if (selectedColors.includes(color)) {
            updatedColors = selectedColors.filter((c) => c !== color);
        } else {
            updatedColors = [...selectedColors, color];
        }

        setSelectedColors(updatedColors);
        onFilterChange({ selectedColors: updatedColors });
    }

    const handleCategoryChange = (e) => {
        let updatedCategories;
        let category = e.target.value;

        if (selectedCategories.includes(category)) {
            updatedCategories = selectedCategories.filter((c) => c !== category);
        } else {
            updatedCategories = [...selectedCategories, category];
        }

        setSelectedCategories(updatedCategories);
        onFilterChange({ selectedCategories: updatedCategories });
    }

    const handleSegmentChange = (e) => {
        let updatedSegments;
        let segment = e.target.value;

        if (selectedSegments.includes(segment)) {
            updatedSegments = selectedSegments.filter((s) => s !== segment);
        } else {
            updatedSegments = [...selectedSegments, segment];
        }

        setSelectedSegments(updatedSegments);
        onFilterChange({ selectedSegments: updatedSegments });
    }

    // Estilos responsive
    const styles = {
        card: {
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
        },
        title: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
        },
        collapseBtn: {
            display: 'none',
            padding: '5px 10px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
        },
        filtersContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
        },
        filter: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        label: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
        },
        input: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
        },
        select: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
        },
        rangeInputs: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
        },
        rangeInput: {
            flex: 1,
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: 0,
        },
        scrollContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            marginTop: '5px',
        },
        chip: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            backgroundColor: '#667eea',
            color: '#fff',
            borderRadius: '20px',
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
        },
        chipRemove: {
            marginLeft: '5px',
            fontWeight: 'bold',
        },
        rangeText: {
            fontSize: '12px',
            color: '#888',
            marginTop: '5px',
        },
    };

    return (
        <div style={styles.card} className="filters-card">
            <div style={styles.header}>
                <h2 style={styles.title}>Filtros</h2>
                <button 
                    style={styles.collapseBtn}
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? 'Mostrar' : 'Ocultar'}
                </button>
            </div>

            <div 
                style={{
                    ...styles.filtersContainer,
                    display: isCollapsed ? 'none' : 'flex',
                }}
                className="filters-content"
            >
                {/* Búsqueda */}
                {showSearchBar && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Búsqueda</label>
                        <input 
                            type="text" 
                            placeholder="Buscar por coincidencia..."
                            value={search}
                            onChange={handleSearchChange}
                            style={styles.input}
                        />
                    </div>
                )}

                {/* Rango de Fechas */}
                {showDateRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Fechas</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => handleDateRangeChange('start', e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => handleDateRangeChange('end', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                )}

                {/* Estado (Activo/Inactivo) */}
                {showStatus && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Estado</label>
                        <select onChange={handleStatusChange} value="" style={styles.select}>
                            <option value="">Seleccionar estado...</option>
                            {statusOptions
                                .filter((name) => !selectedStatus.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedStatus.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleStatusChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rango de Precios */}
                {showPriceRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Precios</label>
                        <div style={styles.rangeInputs}>
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
                                style={styles.rangeInput}
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
                                style={styles.rangeInput}
                            />
                        </div>
                        <span style={styles.rangeText}>De Q{priceRange.min} a Q{priceRange.max}</span>
                    </div>
                )}

                {/* Rango de Stock */}
                {showStockRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Stock</label>
                        <div style={styles.rangeInputs}>
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
                                style={styles.rangeInput}
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
                                style={styles.rangeInput}
                            />
                        </div>
                        <span style={styles.rangeText}>De {stockRange.min} a {stockRange.max} unidades</span>
                    </div>
                )}

                {/* Nombres de Clientes */}
                {showClientNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Cliente</label>
                        <select onChange={handleClientNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar cliente...</option>
                            {clientNames
                                .filter((name) => !selectedClients.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedClients.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleClientNameChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nombres de Empleados */}
                {showEmployeeNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Empleado</label>
                        <select onChange={handleEmployeeNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar empleado...</option>
                            {employeesNames
                                .filter((name) => !selectedEmployees.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedEmployees.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleEmployeeNameChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nombre de Producto */}
                {showProductName && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Producto</label>
                        <select onChange={handleProductNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar producto...</option>
                            {productNames
                                .filter((name) => !selectedProducts.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedProducts.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleProductNameChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Método de Pago */}
                {showPaymentMethod && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Método de Pago</label>
                        <select onChange={handlePaymentMethodChange} value="" style={styles.select}>
                            <option value="">Seleccionar método...</option>
                            {paymentMethods
                                .filter((name) => !selectedPaymentMethod.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedPaymentMethod.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handlePaymentMethodChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nombre del Proveedor */}
                {showProviderNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Proveedor</label>
                        <select onChange={handleProviderNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar proveedor...</option>
                            {providerNames
                                .filter((name) => !selectedProviders.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedProviders.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleProviderNameChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Opciones de Color */}
                {showColorOptions && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Color</label>
                        <select onChange={handleColorChange} value="" style={styles.select}>
                            <option value="">Seleccionar color...</option>
                            {colorOptions
                                .filter((name) => !selectedColors.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedColors.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleColorChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categorías */}
                {showCategories && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Categoría</label>
                        <select onChange={handleCategoryChange} value="" style={styles.select}>
                            <option value="">Seleccionar categoría...</option>
                            {categoryOptions
                                .filter((name) => !selectedCategories.includes(name))
                                .map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedCategories.map((name) => (
                                <button key={name} style={styles.chip} onClick={() => handleCategoryChange({ target: { value: name } })}>
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Segmentos */}
                {showSegments && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Segmento</label>
                        <input
                            type="text"
                            placeholder="Escribe el segmento..."
                            onChange={handleSegmentChange}
                            style={styles.input}
                        />
                        <div style={styles.scrollContainer}>
                            {selectedSegments.map((name) => (
                                <button
                                    key={name}
                                    style={styles.chip}
                                    onClick={() => handleSegmentChange({ target: { value: name } })}
                                >
                                    {name} <span style={styles.chipRemove}>&times;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .filters-card .collapse-btn {
                        display: block !important;
                    }
                    .filters-card .filters-content {
                        max-height: 60vh;
                        overflow-y: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default Filters;