import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener todas las compras
export const getCompras = async () => {
    try {
        const response = await axios.get(`${API_URL}/compra/`);
        
        if (response.data.status === "success") {
            return response.data.compras; // Retorna solo la lista de compras
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener compras:", error);
        throw error;
    }
};

// Funcion para crear una nueva compra
export const createCompra = async (compraData) => {
    try {
        const response = await axios.post(`${API_URL}/compra/`, compraData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear compra:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

export const deleteCompra = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/compra/${id}`); // ← CAMBIO AQUÍ

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al eliminar compra:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};