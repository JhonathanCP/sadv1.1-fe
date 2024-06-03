import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://10.0.28.15:3000";

const authApi = axios.create({
    // baseURL: 'http://10.0.28.15:3000/dependencys/',
    baseURL: 'http://10.0.28.15:3000/dependency/',
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