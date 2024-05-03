import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
    const isAuthenticated = () => {
        // Implementa la lógica para verificar si el usuario ha iniciado sesión
        const accessToken = localStorage.getItem('access');
        return accessToken !== null; // Cambiado a verificar si el token existe
    };
    
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;