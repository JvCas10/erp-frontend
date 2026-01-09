import axiosInstance from "./axiosConfig";

// Función para obtener todos los proveedores
export const getProveedores = async () => {
    try {
        const response = await axiosInstance.get('/proveedor/');
        
        if (response.data.status === "success") {
            return response.data.proveedores;
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        throw error;
    }
};

// Funcion para crear un nuevo proveedor
export const createProveedor = async (proveedorData) => {
    try {
        const response = await axiosInstance.post('/proveedor/', proveedorData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear proveedor:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Función para actualizar un proveedor
export const updateProveedor = async (proveedorData) => {
    try {
        const response = await axiosInstance.put('/proveedor/', proveedorData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al actualizar proveedor:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
}

// Función para eliminar un proveedor
export const deleteProveedor = async (id_proveedor) => {
    try {
        const response = await axiosInstance.delete('/proveedor', {
            data: { id_proveedor }
        });

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
}