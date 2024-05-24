import React, { useEffect, useState } from 'react';
import { getUserReports } from '../api/user.api'
import { jwtDecode } from "jwt-decode";
import { Link, Route, useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-hot-toast";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Img from '../assets/hero-img.svg';
import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar'
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Row, Col, NavItem } from 'react-bootstrap';

export function ResultPage() {
    const searchParams = new URLSearchParams(window.location.search);
    const key = searchParams.get('key');
    const [reports, setReports] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [noResults, setNoResults] = useState(false); // Nuevo estado para controlar si no se encontraron resultados
    const navigate = useNavigate();

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            // Display success message using toast or other notification mechanism
            toast.success(successMessage);
            // Clear the success message from localStorage
            localStorage.removeItem('successMessage');
        }
        AOS.init();
        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', {
                    icon: '👏',
                });
                // El token ha expirado, cierra sesión
                handleLogout();
            }
        }

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);

            // Solo realizar la llamada a getUserGroups si userId está disponible
            const fetchInfo = async () => {
                try {
                    const response = await getUserReports(decodedToken.id);
                    const filteredReportes = response.data.reports.filter(report => {
                        const lowercaseKey = key ? key.toLowerCase() : '';
                        const lowercaseName = report.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const lowercaseDescription = report.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        return lowercaseName.includes(lowercaseKey) || lowercaseDescription.includes(lowercaseKey);
                    });
                    setReports(filteredReportes);

                    // Verificar si no se encontraron resultados
                    setNoResults(filteredReportes.length === 0);
                } catch (error) {
                    console.error('Error al obtener la información:', error);
                }
            };

            fetchInfo();
        }
    }, []);

    const handleLogout = () => {
        // Lógica para cerrar sesión, por ejemplo, eliminar el token y redirigir al inicio de sesión
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        // Redirige al inicio de sesión u otra página
        toast.success("Sesión terminada");
        navigate("/login");
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar></NavBar>
            <Container fluid className='p-0 m-0 sections-bg ' style={{ minHeight: '98vh' }}>
                <section id="services" className='services w-100'>
                    <div className="container w-100" data-aos="fade-up">
                        <div className="row gy-4 align-items-center justify-content-center mt-4" data-aos="fade-up" data-aos-delay="100">
                            {noResults && (
                                <div className="col-lg-3 col-md-6 d-flex align-items-center justify-content-center mt-2">
                                    <div className="service-item position-relative align-items-center justify-content-center text-center">
                                        <div className="icon-nr">
                                            <i className={`bi bi-emoji-frown`}></i>
                                        </div>
                                        <h3>No se encontraron reportes</h3>
                                        {/* <p >{report.description}</p> */}
                                    </div>
                                </div>

                            )}
                            {reports.map((report) => (
                                <div key={report.id} className="col-lg-3 col-md-6 align-items-center justify-content-center mt-2" onClick={() => navigate(`/report/${report.id}`)}>
                                    <div className="service-item  position-relative align-items-center justify-content-center">
                                        <div className="icon">
                                            <i className={`bi bi-${report.icon}`}></i>
                                        </div>
                                        <h3>{report.name}</h3>
                                        <p >{report.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-center mt-5" >
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
                        <div className="col-5 text-center">Versión: 1.1.0</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-11">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-1 text-center">Versión: 1.1.0</div>
                    </div>
                </div>
            </footer>
        </div>

    );
}
