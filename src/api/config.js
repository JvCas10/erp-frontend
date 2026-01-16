import axiosInstance from './axiosConfig';

// Función para obtener la configuración
export const getConfig = async () => {
    const response = await axiosInstance.get('/config');
    return response.data;
};

// Función para actualizar la configuración
export const updateConfig = async (config) => {
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    formData.append('empresa_nombre', config.empresa_nombre || '');
    formData.append('primary_color', config.primary_color || '');
    formData.append('secondary_color', config.secondary_color || '');
    formData.append('background_color', config.background_color || '');
    formData.append('text_color', config.text_color || '');
    
    // Si hay un archivo de logo nuevo, agregarlo
    if (config.logoFile instanceof File) {
        formData.append('logo', config.logoFile);
    } else if (config.logo_actual) {
        // Si no hay archivo nuevo, mantener el logo actual
        formData.append('logo_actual', config.logo_actual);
    }
    
    const response = await axiosInstance.put('/config', formData);
    return response.data;
};