import Axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_URL_BASE_ENDPOINT || '';
const axios2 = Axios.create({ baseURL });
Axios.defaults.baseURL = baseURL;

// Interceptor para incluir el token en los encabezados de cada solicitud
axios2.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar las respuestas y errores
axios2.interceptors.response.use(
  (response) => response,
  async (errors: AxiosError) => {
    return Promise.reject(errors);
  }
);

export default axios2;
