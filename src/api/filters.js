import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener todos los nombres de los clientes
export const getClientesNombres = async () => {
    try {
        const response = await axios.get(`${API_URL}/cliente/nombres/clientes`);

        if (response.data.status === "success"){
            return response.data.clientes.map(cliente => cliente.nombre_completo);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener nombres de clientes:", error);
        throw error;
    }
};

// Funcion para obtener todos los nombres de los empleados
export const getEmployeesNames = async () => {
    try {
        const response = await axios.get(`${API_URL}/empleado/nombres/empleados`);

        if (response.data.status === "success"){
            return response.data.empleados.map(empleado => empleado.nombre_completo);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener nombres de Empleados:", error);
        throw error;
    }
};

// Funcion para obtener los nombres de los productos
export const getProductosNombres = async () => {
    try {
        const response = await axios.get(`${API_URL}/producto/nombres/productos`);

        if (response.data.status === "success"){
            return response.data.productos.map(producto => producto.nombre);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener nombres de productos:", error);
        throw error;
    }
};

// Funcion para obtener los nombres de los proveedores
export const getProveedoresNombres = async () => {
    try {
        const response = await axios.get(`${API_URL}/proveedor/nombres/proveedores`);

        if (response.data.status === "success"){
            return response.data.proveedores.map(proveedor => proveedor.nombre);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener nombres de proveedores:", error);
        throw error;
    }
};

// Funcion para obtener los colores de los productos
export const getColoresProductos = async () => {
    try {
        const response = await axios.get(`${API_URL}/producto/colores/productos`);

        if (response.data.status === "success"){
            return response.data.colores.map(color => color.color);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener colores de productos:", error);
        throw error;
    }
};

// Funcion para obtener las categorias de los productos
export const getCategoriasProductos = async () => {
    try {
        const response = await axios.get(`${API_URL}/producto/categorias/productos`);

        if (response.data.status === "success"){
            return response.data.categorias.map(categoria => categoria.categoria);
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener categorias de productos:", error);
        throw error;
    }
};
