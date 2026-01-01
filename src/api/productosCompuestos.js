import axiosInstance from "./axiosConfig";

export const crearProductoCompuesto = async (data) => {
  const formData = new FormData();

  formData.append("nombre", data.nombre);
  formData.append("descripcion", data.descripcion || "");
  formData.append("precio_venta", data.precio_venta);
  formData.append("componentes", JSON.stringify(data.componentes));

  if (data.foto instanceof File) {
    formData.append("foto", data.foto);
  }

  const response = await axiosInstance.post(
    "/productos-compuestos",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const actualizarProductoCompuesto = async (data) => {
  const formData = new FormData();

  formData.append("nombre", data.nombre);
  formData.append("descripcion", data.descripcion || "");
  formData.append("precio_venta", data.precio_venta);
  formData.append("componentes", JSON.stringify(data.componentes));

  if (data.foto instanceof File) {
    formData.append("foto", data.foto);
  } else if (data.foto_original) {
    formData.append("foto_actual", data.foto_original);
  }

  const response = await axiosInstance.put(
    `/productos-compuestos/${data.producto_compuesto_id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};
