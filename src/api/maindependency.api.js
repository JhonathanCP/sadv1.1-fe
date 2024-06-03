import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://10.0.28.15:3000";

const authApi = axios.create({
    // baseURL: 'http://10.0.28.15:3000/dependencys/',
    baseURL: 'http://10.0.28.15:3000/maindependency/',
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