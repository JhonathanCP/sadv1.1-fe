import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://10.0.28.15:3000";

const authApi = axios.create({
    // baseURL: 'http://10.0.28.15:3000/modules/',
    baseURL: 'http://10.0.28.15:3000/position/',
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

export const getPositions = () => authApi.get("/");
export const getPosition = (PositionId) => authApi.get(`/${PositionId}/`);
export const createPosition = (PositionData) => authApi.post("/", PositionData);
export const updatePosition = (PositionId, PositionData) => authApi.put(`/${PositionId}/`, PositionData);
export const deletePosition = (PositionId) => authApi.delete(`/${PositionId}/`);