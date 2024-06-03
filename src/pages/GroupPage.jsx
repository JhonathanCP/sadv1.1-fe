import React, { useEffect, useState } from 'react';
import { getUserModules } from '../api/user.api';
import {jwtDecode} from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Button, Container } from 'react-bootstrap';

export function GroupPage() {
    const { id } = useParams();
    const [modules, setModules] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage);
            localStorage.removeItem('successMessage');
        }
        AOS.init();
        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', { icon: '👏' });
                handleLogout();
            }
        }

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);

            // Solo realizar la llamada a getUserModules si userId está disponible
            const fetchInfo = async () => {
                try {
                    const response = await getUserModules(decodedToken.id);
                    const filteredModules = response.data.modules.filter(module => module.GroupId == id);
                    
                    // Filtrar módulos para incluir solo aquellos con reportes activos
                    const modulesWithActiveReports = filteredModules.filter(module =>
                        module.Reports && module.Reports.some(report => report.active)
                    );

                    setModules(modulesWithActiveReports);
                } catch (error) {
                    console.error('Error al obtener la información:', error);
                }
            };

            fetchInfo();
        }
    }, [id]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar></NavBar>
            
            <Container fluid className='px-0 mx-0 pb-5 sections-bg ' style={{minHeight: '98vh'}}>
            <section id="services" className='services w-100'>
            <div className="container w-100" data-aos="fade-up">
                <div className="row gy-4 align-items-center justify-content-center mt-4" data-aos="fade-up" data-aos-delay="100">
                    {modules.map((module) => (
                        <div
                            key={module.id}
                            className="col-lg-3 col-md-6 align-items-center justify-content-center mt-2"
                            onClick={() => navigate(`/module/${module.id}`)}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={module.description}
                        >
                            <div className="service-item position-relative align-items-center justify-content-center">
                                <div className="icon">
                                    <i className={`bi bi-${module.icon}`}></i>
                                </div>
                                <h3>{module.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" className='mx-2' onClick={() => navigate(-1)}>Regresar</Button>
                    <Button variant="primary" className='mx-2' onClick={() => navigate('/menu')}>Volver al menú principal</Button>
                </div>
            </div>
        </section>
            </Container>
            <footer className="fixed-bottom text-white px-5 m-0" style={{ backgroundColor: "#0064AF", minHeight: '2vh' }}>
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-7">© GCTIC-EsSalud</div>
                        <div className="col-5 text-center">Versión: 1.1.0.20240527</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-center">Versión: 1.1.0.20240527</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
