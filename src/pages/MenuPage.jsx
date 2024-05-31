import React, { useEffect, useState } from 'react';
import { getUserGroups } from '../api/user.api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Img from '../assets/hero-img.svg';
import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Button, Container, Row, Col } from 'react-bootstrap';

export function MenuPage() {
    const [grupos, setGrupos] = useState([]);
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

            // Solo realizar la llamada a getUserGroups si userId está disponible
            const fetchInfo = async () => {
                try {
                    const response = await getUserGroups(decodedToken.id);
                    const filteredGroups = response.data.groups.filter(group =>
                        group.Modules && group.Modules.some(module =>
                            module.Reports && module.Reports.some(report => report.active)
                        )
                    );
                    setGrupos(filteredGroups);
                } catch (error) {
                    console.error('Error al obtener la información:', error);
                }
            };

            fetchInfo();
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar></NavBar>
            <Container fluid fixed="true" style={{ backgroundColor: '#0064AF', minHeight: '35vh' }} className='mt-5'>
                <Row className='px-5 py-5 d-flex align-items-center justify-content-center'>
                    <Col xs={12} md={12} xl={7} className='px-4 text-white ' data-aos="fade-in" data-aos-delay="250">
                        <h2 className='d-xl-none text-center'>Sistema de Analítica <span>de Datos</span></h2>
                        <h2 className='d-none d-xl-block'>Sistema de Analítica <span>de Datos</span></h2>
                        <p className='d-none d-md-block d-xl-none text-center'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                        <p className='d-none d-xl-block'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                    </Col>
                    <Col xs={12} md={12} xl={5} className='px-5 py-0 d-flex align-items-center justify-content-center'>
                        <img src={Img} className="img-fluid" alt="" data-aos="zoom-out" data-aos-delay="250" />
                    </Col>
                </Row>
            </Container>
            <Container fluid className='px-0 mx-0 sections-bg'>
                <section id="services" className='services w-100'>
                    <div className="container w-100" data-aos="fade-up">
                        <div className="row gy-4 align-items-center justify-content-center" data-aos="fade-up" data-aos-delay="100">
                            {grupos.map((grupo) => (
                                <div
                                    key={grupo.id}
                                    className="col-lg-4 col-md-6 align-items-center justify-content-center"
                                    onClick={() => navigate(`/group/${grupo.id}`)}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={grupo.description}
                                >
                                    <div className="service-item position-relative align-items-center justify-content-center">
                                        <div className="icon">
                                            <i className={`bi bi-${grupo.icon}`}></i>
                                        </div>
                                        <h3>{grupo.name}</h3>
                                    </div>
                                </div>
                            ))}
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
