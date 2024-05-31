import axios from "axios";

const URL =
    process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://10.0.28.15:3000";

const authApi = axios.create({
    // baseURL: 'http://10.0.28.15:3000/accessaudit/',
    baseURL: 'http://10.0.28.15:3000/accessrequest/',
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

// Obtener todas las solicitudes de acceso
export const getAllAccessRequests = () => authApi.get("/");

// Obtener una solicitud de acceso por su ID
export const getAccessRequestById = (id) => authApi.get(`/${id}`);

// Crear una nueva solicitud de acceso
export const createAccessRequest = (accessRequestData) => authApi.post("/", accessRequestData);

// Actualizar una solicitud de acceso existente
export const updateAccessRequest = (id, accessRequestData) => authApi.put(`/${id}`, accessRequestData);

// Eliminar una solicitud de acceso
export const deleteAccessRequest = (id) => authApi.delete(`/${id}`);

// Subir un archivo PDF para una solicitud de acceso existente
export const uploadPdfForAccessRequest = (id, pdfFile) => {
    const formData = new FormData();
    formData.append("pdfBlob", pdfFile);

    return authApi.post(`/${id}/pdf`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

// Obtener el PDF de una solicitud de acceso por su ID
export const getPdfById = (id) => authApi.get(`/${id}/pdf`, { responseType: 'blob' });