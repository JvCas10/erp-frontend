import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener todos los empleados
export const getEmployees = async () => {
    try {
        const response = await axios.get(`${API_URL}/empleado/`);
        
        if (response.data.status === "success") {
            return response.data.empleados; // Retorna solo la lista de empleados
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        throw error;
    }
};

// Funcion para crear un nuevo empleado
export const createEmployee = async (empleadoData) => {
    try {
        const response = await axios.post(`${API_URL}/empleado/`, empleadoData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear empleado:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Función para actualizar un cliente
export const updateEmployee = async (empleadoData) => {
    try {
        const response = await axios.put(`${API_URL}/empleado/`, empleadoData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Funcion para eliminar un empleado
export const deleteEmployee = async (empleado_id) => {
    try {
        const response = await axios.delete(`${API_URL}/empleado`, { data: { empleado_id } });

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};