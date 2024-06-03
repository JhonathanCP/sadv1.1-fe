import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://10.0.28.15:3000";

const authApi = axios.create({
    baseURL: 'http://10.0.28.15:3000/user/',
});

// Interceptor para incluir el token en los encabezados de todas las solicitudes
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers['x-access-token'] = token;
    }
    return config;
});

export const getUsers = () => authApi.get("/");
export const getUser = (userId) => authApi.get(`/${userId}/`);
export const updateUser = (userId, data) => authApi.put(`/${userId}/`, data);
export const addReport = (data) => authApi.post(`/add-report/`, data);
export const removeReport = (userId, reportId) => authApi.delete(`/${userId}/delete-report/${reportId}`);
export const getUserGroups = (userId) => authApi.get(`/${userId}/get-groups/`);
export const getUserModules = (userId) => authApi.get(`/${userId}/get-modules/`);
export const getUserReports = (userId) => authApi.get(`/${userId}/get-reports/`);
