import axiosInstance from "./axiosConfig";

// Obtener inventario
export const obtenerInventario = async () => {
  try {
    const response = await axiosInstance.get('/inventario/');

    if (response.data.status === "success") {
      const lista =
        response.data.inventario ??
        response.data.productos ??
        response.data.items ??
        [];

      return Array.isArray(lista) ? lista : [];
    }

    console.error("Error en la respuesta del servidor:", response.data.message);
    return [];
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    throw error;
  }
};

// Helper para construir FormData desde el objeto de producto
const buildProductoFormData = (productoData) => {
  const formData = new FormData();

  for (const key in productoData) {
    const value = productoData[key];
    if (value === undefined || value === null) continue;

    if (key === "foto" && value instanceof File) {
      formData.append(key, value);
    } else if (key === "precio" || key === "stock" || key === "producto_id") {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  }

  return formData;
};

// Crear producto
export const crearProducto = async (productoData) => {
  try {
    const formData = buildProductoFormData(productoData);

    for (let [k, v] of formData.entries()) {
      if (v instanceof File) {
        console.log(`${k}: (File) ${v.name} ${v.type} ${v.size}`);
      } else {
        console.log(`${k}:`, v);
      }
    }

    const response = await axiosInstance.post('/producto/', formData);

    if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { success: false, message: "Error de conexión con el servidor." };
  }
};

// Actualizar producto
export const actualizarProducto = async (productoData) => {
  try {
    const formData = buildProductoFormData(productoData);

    for (let [k, v] of formData.entries()) {
      if (v instanceof File) {
        console.log(`${k}: (File) ${v.name} ${v.type} ${v.size}`);
      } else {
        console.log(`${k}:`, v);
      }
    }

    const response = await axiosInstance.put('/producto/', formData);

    if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, message: "Error de conexión con el servidor." };
  }
};

// Eliminar producto
export const eliminarProducto = async (producto_id) => {
  try {
    const response = await axiosInstance.delete('/producto', {
      data: { producto_id },
    });

    if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, message: "Error de conexión con el servidor." };
  }
};