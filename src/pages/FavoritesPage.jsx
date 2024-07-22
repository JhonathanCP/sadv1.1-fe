import React, { useEffect, useState } from 'react';
import { getUserFavorites, addFavorite, removeFavorite } from '../api/user.api';
import { getGroups } from '../api/group.api';
import { getModules } from '../api/module.api';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { NavBar } from '../components/NavBar';
import iconReport from '../assets/logo-microsoft-power-bi.svg';
import AOS from 'aos';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';
import {
    Container, Row, Col, Accordion
} from 'react-bootstrap';

export function FavoritesPage() {
    const [favoriteReports, setFavoriteReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();
    const currentDate = new Date();

    const twoWeeksAgo = new Date(currentDate.setDate(currentDate.getDate() - 14));
    const oneWeekAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));

    useEffect(() => {
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
            const userId = decodedToken.id;
            setUserId(userId);

            const fetchData = async () => {
                try {
                    const [favResponse, modResponse, grpResponse] = await Promise.all([
                        getUserFavorites(userId),
                        getModules(),
                        getGroups()
                    ]);
                    setFavoriteReports(favResponse.data.favoriteReports.map(report => ({ ...report, isFavorite: true })));
                    setModules(modResponse.data);
                    setGroups(grpResponse.data);
                } catch (error) {
                    console.error('Error loading data:', error);
                    toast.error('Failed to load data.');
                }
            };

            fetchData();
        }
    }, []);

    const toggleFavorite = async (event, report) => {
        event.stopPropagation();
        try {
            const newFavoriteStatus = !report.isFavorite;
            const reportId = report.id;
            // Optimistically update the UI
            setFavoriteReports(favoriteReports.filter(r => r.id !== reportId));

            if (newFavoriteStatus) {
                await addFavorite({ userId, reportId });
                toast.success('Reporte añadido a favoritos');
            } else {
                await removeFavorite(userId, reportId);
                toast.success('Reporte eliminado de favoritos');
            }
        } catch (error) {
            console.error('Error al actualizar el estado de favoritos:', error);
            toast.error('Error al actualizar el estado de favoritos');
            setFavoriteReports(favoriteReports.map(r => r.id === report.id ? { ...r, isFavorite: !report.isFavorite } : r));
        }
    };

    const moduleMap = new Map();
    favoriteReports.forEach(report => {
        if (moduleMap.has(report.ModuleId)) {
            moduleMap.get(report.ModuleId).push(report);
        } else {
            moduleMap.set(report.ModuleId, [report]);
        }
    });

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
            <NavBar />
            <Container fluid className='px-5'>
                <Col className="d-flex align-items-end" style={{ minHeight: '11vh' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb p-0 m-0 g-0">
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}></i>Menú Principal
                                </a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Mis tableros favoritos</li>
                        </ol>
                    </nav>
                </Col>
                <Row>
                    <Col md={12} className='my-3'>
                        <h2 className='custom-h2'>Mis tableros favoritos</h2>
                    </Col>
                </Row>

                <Accordion defaultActiveKey="0">
                    {Array.from(moduleMap.keys()).map((moduleId, index) => {
                        const reports = moduleMap.get(moduleId);
                        const module = modules.find(m => m.id === moduleId);
                        return (
                            <Accordion.Item eventKey={String(index)} key={moduleId}>
                                <Accordion.Header className='accordion-header'>
                                    {module ? (
                                        <div className="favorites">
                                            <div className="icon-and-name">
                                                <div className="icon-background">
                                                    <i className={`bi bi-${module.icon}`} ></i>
                                                </div>
                                                <span>{module.name}</span>
                                            </div>
                                        </div>
                                    ) : 'Módulo Desconocido'}
                                </Accordion.Header>
                                <Accordion.Body>
                                    <section id="services" className='services w-100'>
                                        <div className="container-fluid" data-aos="fade-up">
                                            <div className="row align-items-center justify-content-center px-3" data-aos="fade-up" data-aos-delay="100">
                                                {reports.sort((a, b) => a.GroupId - b.GroupId).map((report) => (
                                                    <div
                                                        key={report.id}
                                                        className="col-lg-3 col-md-6 align-items-center justify-content-center py-2"
                                                        onClick={() => navigate(`/report/${report.id}`)}
                                                        data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title={report.description}
                                                    >
                                                        <div className="service-item service-item-gray position-relative align-items-center justify-content-center">
                                                            <div className="badges">
                                                                {(new Date(report.createdAt) >= twoWeeksAgo && report.version.startsWith('1.0')) && <span className="badge rounded-pill text-bg-success mx-1">Nuevo</span>}
                                                                {(new Date(report.updatedAt) >= oneWeekAgo && !report.version.startsWith('1.0')) && <span className="badge rounded-pill text-bg-primary mx-1">Renovado</span>}
                                                            </div>
                                                            <div className='groups'>
                                                                {groups.map((group, index) => (
                                                                    <span key={index} className="badge rounded-pill text-bg-light mx-1">
                                                                        {group.id === report.GroupId && (
                                                                            <><i className={`bi bi-${group.icon}`}></i> {group.name}</>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                                <button onClick={(event) => toggleFavorite(event, report)} type="button" className="btn btn-outline-light dest-icon">
                                                                    <i className={report.isFavorite ? "bi bi-star-fill" : "bi bi-star"} style={{ color: report.isFavorite ? '#F6D751' : '#6C757D' }}></i>
                                                                </button>
                                                            </div>
                                                            <div className="icon">
                                                                <img src={iconReport} style={{ width: "140.5px", height: "29.98px" }}
                                                                    className="d-inline-block align-top img-fluid" />
                                                            </div>
                                                            <h3>{report.name}</h3>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            </Container>
            <footer className="fixed-bottom text-white px-5 m-0 footer" style={{ minHeight: '2vh' }}>
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
