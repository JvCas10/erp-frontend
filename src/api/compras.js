import axiosInstance from "./axiosConfig";

// Funcion para obtener todas las compras
export const getCompras = async () => {
    try {
        const response = await axiosInstance.get('/compra/');
        
        if (response.data.status === "success") {
            return response.data.compras;
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
        const response = await axiosInstance.post('/compra/', compraData);

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
        const response = await axiosInstance.delete(`/compra/${id}`);

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