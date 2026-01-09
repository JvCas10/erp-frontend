import axiosInstance from "./axiosConfig";

// Función para obtener todos los clientes
export const getClientes = async () => {
    try {
        const response = await axiosInstance.get('/cliente/');
        
        if (response.data.status === "success") {
            return response.data.clientes;
        } else {
            console.error("Error en la respuesta del servidor:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        throw error;
    }
};

// Funcion para crear un nuevo cliente
export const createCliente = async (clienteData) => {
    try {
        const response = await axiosInstance.post('/cliente/', clienteData);

        if (response.data.status === "success") {
            return { success: true, message: response.data.message };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Función para actualizar un cliente
export const updateCliente = async (clienteData) => {
  try {
    const payload = {
      cliente_id: clienteData.cliente_id,
      nombre_completo: clienteData.nombre_completo,
      correo: clienteData.correo,
      telefono: clienteData.telefono,
      direccion: clienteData.direccion,
      instagram_usuario: clienteData.instagram_usuario,
    };

    const response = await axiosInstance.put('/cliente/', payload);

    if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return { success: false, message: "Error de conexión con el servidor." };
  }
};

// Función para eliminar un cliente
export const deleteCliente = async (cliente_id) => {
  try {
    const response = await axiosInstance.delete('/cliente', {
      data: { cliente_id },
    });

    if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return { success: false, message: "Error de conexión con el servidor." };
  }
};