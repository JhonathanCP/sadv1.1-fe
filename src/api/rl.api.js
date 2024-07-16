import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/modules/',
    baseURL: 'https://sad.essalud.gob.pe/api/rl/',
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

export const getRLs = () => authApi.get("/");
export const getRL = (RLId) => authApi.get(`/${RLId}/`);
export const createRL = (RLData) => authApi.post("/", RLData);
export const updateRL = (RLId, RLData) => authApi.put(`/${RLId}/`, RLData);
export const deleteRL = (RLId) => authApi.delete(`/${RLId}/`);