import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener todos los servicios
export const getServices = async () => {
    try {
        const response = await axios.get(`${API_URL}/servicio/`);
        
        if (response.data.status === "success") {
            return response.data.servicios; // Retorna solo la lista de servicios
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        throw error;
    }
};

// Funcion para crear un nuevo servicio
export const createService = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/servicio/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear servicio:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Función para actualizar un servicio
export const updateService = async (formData) => {
    try {
        const response = await axios.put(`${API_URL}/servicio/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
}

// Funcion para eliminar un servicio
export const deleteService = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/servicio`, { data: { id } });

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};