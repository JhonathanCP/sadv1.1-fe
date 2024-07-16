import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/dependencys/',
    baseURL: 'https://sad.essalud.gob.pe/api/maindependency/',
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

export const getMainDependencies = () => authApi.get("/");
export const getMainDependency = (mainDependencyId) => authApi.get(`/${mainDependencyId}/`);
export const createMainDependency = (mainDependencyData) => authApi.post("/", mainDependencyData);
export const updateMainDependency = (mainDependencyId, mainDependencyData) => authApi.put(`/${mainDependencyId}/`, mainDependencyData);
export const deleteMainDependency = (mainDependencyId) => authApi.delete(`/${mainDependencyId}/`);