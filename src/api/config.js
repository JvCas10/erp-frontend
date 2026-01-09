import axiosInstance from './axiosConfig';

// Funcion para obtener la configuracion
export const getConfig = async () => {
    const response = await axiosInstance.get('/config');
    return response.data;
};

// Funcion para actualizar la configuracion
export const updateConfig = async (config) => {
    console.log(config);
    const response = await axiosInstance.put('/config', config);
    return response.data;
};