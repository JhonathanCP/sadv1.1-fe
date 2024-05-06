import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/groups/',
    baseURL: 'http://10.255.0.17:3000/user/',
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

export const getUsers = () => authApi.get("/");
export const getUser = (userId) => authApi.get(`/${userId}/`);
export const getUserGroups = (userId) => authApi.get(`/${userId}/get-groups/`);
export const getUserModules = (userId) => authApi.get(`/${userId}/get-modules/`);
export const getUserReports = (userId) => authApi.get(`/${userId}/get-reports/`);