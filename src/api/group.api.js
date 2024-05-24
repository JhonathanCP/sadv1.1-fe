import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "https://sad.essalud.gob.pe/api";

const authApi = axios.create({
    // baseURL: 'https://sad.essalud.gob.pe/api/groups/',
    baseURL: 'http://10.0.28.15:3000/group/',
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

export const getGroups = () => authApi.get("/");
export const getGroup = (groupId) => authApi.get(`/${groupId}/`);
export const getFreeGroups = () => authApi.get(`/get-free/`);
export const createGroup = (groupData) => authApi.post("/", groupData);
export const updateGroup = (groupId, groupData) => authApi.put(`/${groupId}/`, groupData);
export const deleteGroup = (groupId) => authApi.delete(`/${groupId}/`);