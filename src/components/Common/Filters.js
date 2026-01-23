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
    const [priceRange, setPriceRange] = useState({ min: 0, max: 999999 });
    const [stockRange, setStockRange] = useState({ min: 0, max: 999999 });
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

    const fetchClientNames = async () => {
        try {
            const nombres = await getClientesNombres();
            setClientNames(nombres || []);
        } catch (error) {
            console.error('Error al obtener los nombres de los clientes:', error);
            setClientNames([]);
        }
    };

    const fetchEmployeesNames = async () => {
        try {
            const nombres = await getEmployeesNames();
            setEmployeesNames(nombres || []);
        } catch (error) {
            console.error('Error al obtener los nombres de los empleados:', error);
            setEmployeesNames([]);
        }
    };

    const fetchProductNames = async () => {
        try {
            const nombres = await getProductosNombres();
            setProductNames(nombres || []);
        } catch (error) {
            console.error('Error al obtener los nombres de los productos:', error);
            setProductNames([]);
        }
    };

    const fetchProviderNames = async () => {
        try {
            const nombres = await getProveedoresNombres();
            setProviderNames(nombres || []);
        } catch (error) {
            console.error('Error al obtener los nombres de los proveedores:', error);
            setProviderNames([]);
        }
    };

    const fetchColorOptions = async () => {
        try {
            const colores = await getColoresProductos();
            setColorOptions(colores || []);
        } catch (error) {
            console.error('Error al obtener los colores de los productos:', error);
            setColorOptions([]);
        }
    };

    const fetchCategoryOptions = async () => {
        try {
            const categorias = await getCategoriasProductos();
            setCategoryOptions(categorias || []);
        } catch (error) {
            console.error('Error al obtener las categorias de los productos:', error);
            setCategoryOptions([]);
        }
    };

    useEffect(() => {
        if (showClientNames) fetchClientNames();
        if (showEmployeeNames) fetchEmployeesNames();
        if (showProductName) fetchProductNames();
        if (showProviderNames) fetchProviderNames();
        if (showColorOptions) fetchColorOptions();
        if (showCategories) fetchCategoryOptions();
    }, [showClientNames, showEmployeeNames, showProductName, showProviderNames, showColorOptions, showCategories]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        onFilterChange({ search: value });
    };

    const handleDateRangeChange = (field, value) => {
        const newDateRange = { ...dateRange, [field]: value };
        if (field === 'start' && newDateRange.end && new Date(value) > new Date(newDateRange.end)) return;
        if (field === 'end' && newDateRange.start && new Date(value) < new Date(newDateRange.start)) return;
        setDateRange(newDateRange);
        onFilterChange({ dateRange: newDateRange });
    };

    const handleStatusChange = (e) => {
        const status = e.target.value;
        if (!status) return;
        let updatedStatus = selectedStatus.includes(status) 
            ? selectedStatus.filter((s) => s !== status) 
            : [...selectedStatus, status];
        setSelectedStatus(updatedStatus);
        onFilterChange({ selectedStatus: updatedStatus });
    };

    const handlePriceRangeChange = (field, value) => {
        const newPriceRange = { ...priceRange, [field]: value };
        setPriceRange(newPriceRange);
        onFilterChange({ priceRange: newPriceRange });
    };

    const handleStockRangeChange = (field, value) => {
        const newStockRange = { ...stockRange, [field]: value };
        setStockRange(newStockRange);
        onFilterChange({ stockRange: newStockRange });
    };

    const handleClientNameChange = (e) => {
        const name = e.target.value;
        if (!name) return;
        let updatedClients = selectedClients.includes(name) 
            ? selectedClients.filter((c) => c !== name) 
            : [...selectedClients, name];
        setSelectedClients(updatedClients);
        onFilterChange({ selectedClients: updatedClients });
    };

    const handleEmployeeNameChange = (e) => {
        const name = e.target.value;
        if (!name) return;
        let updatedEmployees = selectedEmployees.includes(name) 
            ? selectedEmployees.filter((e) => e !== name) 
            : [...selectedEmployees, name];
        setSelectedEmployees(updatedEmployees);
        onFilterChange({ selectedEmployees: updatedEmployees });
    };

    const handleProductNameChange = (e) => {
        const name = e.target.value;
        if (!name) return;
        let updatedProducts = selectedProducts.includes(name) 
            ? selectedProducts.filter((p) => p !== name) 
            : [...selectedProducts, name];
        setSelectedProducts(updatedProducts);
        onFilterChange({ selectedProducts: updatedProducts });
    };

    const handlePaymentMethodChange = (e) => {
        const method = e.target.value;
        if (!method) return;
        let updatedPaymentMethods = selectedPaymentMethod.includes(method) 
            ? selectedPaymentMethod.filter((m) => m !== method) 
            : [...selectedPaymentMethod, method];
        setSelectedPaymentMethod(updatedPaymentMethods);
        onFilterChange({ selectedPaymentMethod: updatedPaymentMethods });
    };

    const handleProviderNameChange = (e) => {
        const name = e.target.value;
        if (!name) return;
        let updatedProviders = selectedProviders.includes(name) 
            ? selectedProviders.filter((p) => p !== name) 
            : [...selectedProviders, name];
        setSelectedProviders(updatedProviders);
        onFilterChange({ selectedProviders: updatedProviders });
    };

    const handleColorChange = (e) => {
        const color = e.target.value;
        if (!color) return;
        let updatedColors = selectedColors.includes(color) 
            ? selectedColors.filter((c) => c !== color) 
            : [...selectedColors, color];
        setSelectedColors(updatedColors);
        onFilterChange({ selectedColors: updatedColors });
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        if (!category) return;
        let updatedCategories = selectedCategories.includes(category) 
            ? selectedCategories.filter((c) => c !== category) 
            : [...selectedCategories, category];
        setSelectedCategories(updatedCategories);
        onFilterChange({ selectedCategories: updatedCategories });
    };

    const handleSegmentChange = (e) => {
        const segment = e.target.value;
        if (!segment) return;
        let updatedSegments = selectedSegments.includes(segment) 
            ? selectedSegments.filter((s) => s !== segment) 
            : [...selectedSegments, segment];
        setSelectedSegments(updatedSegments);
        onFilterChange({ selectedSegments: updatedSegments });
    };

    const styles = {
        card: { padding: '15px', backgroundColor: '#fff', borderRadius: '8px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
        title: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' },
        collapseBtn: { display: 'none', padding: '5px 10px', backgroundColor: '#667eea', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
        filtersContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
        filter: { display: 'flex', flexDirection: 'column', gap: '8px' },
        label: { fontSize: '14px', fontWeight: '500', color: '#555' },
        input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
        select: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' },
        rangeInputs: { display: 'flex', gap: '10px', alignItems: 'center' },
        rangeInput: { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minWidth: 0 },
        scrollContainer: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' },
        chip: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', backgroundColor: '#667eea', color: '#fff', borderRadius: '20px', fontSize: '12px', border: 'none', cursor: 'pointer' },
        chipRemove: { marginLeft: '5px', fontWeight: 'bold' },
        rangeText: { fontSize: '12px', color: '#888', marginTop: '5px' },
    };

    return (
        <div style={styles.card} className="filters-card">
            <div style={styles.header}>
                <h2 style={styles.title}>Filtros</h2>
                <button style={styles.collapseBtn} className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? 'Mostrar' : 'Ocultar'}
                </button>
            </div>

            <div style={{ ...styles.filtersContainer, display: isCollapsed ? 'none' : 'flex' }} className="filters-content">
                {showSearchBar && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Búsqueda</label>
                        <input type="text" placeholder="Buscar por coincidencia..." value={search} onChange={handleSearchChange} style={styles.input} />
                    </div>
                )}

                {showDateRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Fechas</label>
                        <input type="date" value={dateRange.start} onChange={(e) => handleDateRangeChange('start', e.target.value)} style={styles.input} />
                        <input type="date" value={dateRange.end} onChange={(e) => handleDateRangeChange('end', e.target.value)} style={styles.input} />
                    </div>
                )}

                {showStatus && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Estado</label>
                        <select onChange={handleStatusChange} value="" style={styles.select}>
                            <option value="">Seleccionar estado...</option>
                            {statusOptions.filter((name) => !selectedStatus.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedStatus.map((name) => (<button key={name} style={styles.chip} onClick={() => handleStatusChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showPriceRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Precios</label>
                        <div style={styles.rangeInputs}>
                            <input type="number" min="0" value={priceRange.min} onChange={(e) => { const newMin = Number(e.target.value); if (newMin <= priceRange.max) handlePriceRangeChange('min', newMin); }} placeholder="Mín" style={styles.rangeInput} />
                            <span>-</span>
                            <input type="number" min="0" value={priceRange.max} onChange={(e) => { const newMax = Number(e.target.value); if (newMax >= priceRange.min) handlePriceRangeChange('max', newMax); }} placeholder="Máx" style={styles.rangeInput} />
                        </div>
                        <span style={styles.rangeText}>De Q{priceRange.min} a Q{priceRange.max}</span>
                    </div>
                )}

                {showStockRange && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Rango de Stock</label>
                        <div style={styles.rangeInputs}>
                            <input type="number" min="0" value={stockRange.min} onChange={(e) => { const newMin = Number(e.target.value); if (newMin <= stockRange.max) handleStockRangeChange('min', newMin); }} placeholder="Mín" style={styles.rangeInput} />
                            <span>-</span>
                            <input type="number" min="0" value={stockRange.max} onChange={(e) => { const newMax = Number(e.target.value); if (newMax >= stockRange.min) handleStockRangeChange('max', newMax); }} placeholder="Máx" style={styles.rangeInput} />
                        </div>
                        <span style={styles.rangeText}>De {stockRange.min} a {stockRange.max} unidades</span>
                    </div>
                )}

                {showClientNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Cliente</label>
                        <select onChange={handleClientNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar cliente...</option>
                            {clientNames.filter((name) => !selectedClients.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedClients.map((name) => (<button key={name} style={styles.chip} onClick={() => handleClientNameChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showEmployeeNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Empleado</label>
                        <select onChange={handleEmployeeNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar empleado...</option>
                            {employeesNames.filter((name) => !selectedEmployees.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedEmployees.map((name) => (<button key={name} style={styles.chip} onClick={() => handleEmployeeNameChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showProductName && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Producto</label>
                        <select onChange={handleProductNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar producto...</option>
                            {productNames.filter((name) => !selectedProducts.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedProducts.map((name) => (<button key={name} style={styles.chip} onClick={() => handleProductNameChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showPaymentMethod && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Método de Pago</label>
                        <select onChange={handlePaymentMethodChange} value="" style={styles.select}>
                            <option value="">Seleccionar método...</option>
                            {paymentMethods.filter((name) => !selectedPaymentMethod.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedPaymentMethod.map((name) => (<button key={name} style={styles.chip} onClick={() => handlePaymentMethodChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showProviderNames && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Proveedor</label>
                        <select onChange={handleProviderNameChange} value="" style={styles.select}>
                            <option value="">Seleccionar proveedor...</option>
                            {providerNames.filter((name) => !selectedProviders.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedProviders.map((name) => (<button key={name} style={styles.chip} onClick={() => handleProviderNameChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showColorOptions && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Color</label>
                        <select onChange={handleColorChange} value="" style={styles.select}>
                            <option value="">Seleccionar color...</option>
                            {colorOptions.filter((name) => !selectedColors.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedColors.map((name) => (<button key={name} style={styles.chip} onClick={() => handleColorChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showCategories && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Categoría</label>
                        <select onChange={handleCategoryChange} value="" style={styles.select}>
                            <option value="">Seleccionar categoría...</option>
                            {categoryOptions.filter((name) => !selectedCategories.includes(name)).map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                        <div style={styles.scrollContainer}>
                            {selectedCategories.map((name) => (<button key={name} style={styles.chip} onClick={() => handleCategoryChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}

                {showSegments && (
                    <div style={styles.filter}>
                        <label style={styles.label}>Segmento</label>
                        <input type="text" placeholder="Escribe el segmento..." onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { handleSegmentChange({ target: { value: e.target.value.trim() } }); e.target.value = ''; } }} style={styles.input} />
                        <div style={styles.scrollContainer}>
                            {selectedSegments.map((name) => (<button key={name} style={styles.chip} onClick={() => handleSegmentChange({ target: { value: name } })}>{name} <span style={styles.chipRemove}>&times;</span></button>))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .filters-card .collapse-btn { display: block !important; }
                    .filters-card .filters-content { max-height: 60vh; overflow-y: auto; }
                }
            `}</style>
        </div>
    );
};

export default Filters;