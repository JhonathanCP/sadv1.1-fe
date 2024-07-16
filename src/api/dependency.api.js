import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/dependencys/',
    baseURL: 'https://sad.essalud.gob.pe/api/dependency/',
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

export const getDependencies = () => authApi.get("/");
export const getDependency = (dependencyId) => authApi.get(`/${dependencyId}/`);
export const createDependency = (dependencyData) => authApi.post("/", dependencyData);
export const updateDependency = (dependencyId, dependencyData) => authApi.put(`/${dependencyId}/`, dependencyData);
export const deleteDependency = (dependencyId) => authApi.delete(`/${dependencyId}/`);