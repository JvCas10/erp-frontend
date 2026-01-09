import axiosInstance from "./axiosConfig";

// Funcion para obtener todos los servicios
export const getServices = async () => {
    try {
        const response = await axiosInstance.get('/servicio/');
        
        if (response.data.status === "success") {
            return response.data.servicios;
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
        const response = await axiosInstance.post('/servicio/', formData);

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
        const response = await axiosInstance.put('/servicio/', formData);

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
        const response = await axiosInstance.delete('/servicio', { 
            data: { id } 
        });

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