import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Funcion para obtener la configuracion
export const getConfig = async () => {

    const response = await axios.get(`${API_URL}/config`);
    return response.data;
};

// Funcion para actualizar la configuracion
export const updateConfig = async (config) => {

    console.log(config);

    const response = await axios.put(`${API_URL}/config`, config);
    return response.data;
}; 
