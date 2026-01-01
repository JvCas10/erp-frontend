import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener todas las ventas
export const getVentas = async () => {
    try {
        const response = await axios.get(`${API_URL}/venta/`);
        
        if (response.data.status === "success") {
            return response.data.ventas; // Retorna solo la lista de ventas
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        throw error;
    }
};

// Funcion para crear una nueva venta
export const createVenta = async (ventaData) => {
    try {
        const response = await axios.post(`${API_URL}/venta/`, ventaData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear venta:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Funcion para eliminar una venta
export const deleteVenta = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/venta`, {data : {id}});

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al eliminar venta:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};