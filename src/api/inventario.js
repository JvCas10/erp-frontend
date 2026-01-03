import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Configurar interceptor para incluir automáticamente el token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar respuestas y errores de autenticación
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Obtener inventario
export const obtenerInventario = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/`);

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
      // Asegurar que sean valores primitivos (números o strings)
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

    // Debug: ver contenido real
    for (let [k, v] of formData.entries()) {
      if (v instanceof File) {
        console.log(`${k}: (File) ${v.name} ${v.type} ${v.size}`);
      } else {
        console.log(`${k}:`, v);
      }
    }

    const response = await axios.post(`${API_URL}/producto/`, formData, {
      // axios infiere el Content-Type con boundary; ponerlo explícito puede romperlo si no se calcula bien
      // headers: { "Content-Type": "multipart/form-data" },
    });

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

// Actualizar producto (también con FormData, porque puede incluir foto)
export const actualizarProducto = async (productoData) => {
  try {
    const formData = buildProductoFormData(productoData);

    // Debug opcional
    for (let [k, v] of formData.entries()) {
      if (v instanceof File) {
        console.log(`${k}: (File) ${v.name} ${v.type} ${v.size}`);
      } else {
        console.log(`${k}:`, v);
      }
    }

    const response = await axios.put(`${API_URL}/producto/`, formData, {
      // headers: { "Content-Type": "multipart/form-data" },
    });

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
    const response = await axios.delete(`${API_URL}/producto`, {
      data: { producto_id }, // ✅
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
