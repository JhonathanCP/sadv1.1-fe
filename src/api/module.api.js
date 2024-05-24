import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/modules/',
    baseURL: 'http://10.0.28.15:3000/module/',
});

// Interceptor para incluir el token en los encabezados de todas las solicitudes
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers['x-access-token'] = token;
    }
    // Agregar un parámetro de consulta único
    return config;
});

export const getModules = () => authApi.get("/");
export const getModule = (moduleId) => authApi.get(`/${moduleId}/`);
export const getFreeModules = () => authApi.get(`/get-free/`);
export const createModule = (moduleData) => authApi.post("/", moduleData);
export const updateModule = (moduleId, moduleData) => authApi.put(`/${moduleId}/`, moduleData);
export const deleteModule = (moduleId) => authApi.delete(`/${moduleId}/`);