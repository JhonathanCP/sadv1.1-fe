import React, { useEffect, useState } from 'react';
import { getUserFavorites } from '../api/user.api';
import { getGroups } from '../api/group.api';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { NavBar } from '../components/NavBar';
import iconReport from '../assets/logo-microsoft-power-bi.svg';
import AOS from 'aos';
import { Link, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';
import { Navbar, Nav, NavDropdown, Form, FormGroup, FormControl, FormLabel, Button, Container, Row, Col, NavItem, Breadcrumb, InputGroup } from 'react-bootstrap';

export function FavoritesPage() {
    const [favoriteReports, setFavoriteReports] = useState([]);
    const [reports, setReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();
    const currentDate = new Date();

    // Obtener la fecha de hace dos semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(currentDate.getDate() - 14);

    // Obtener la fecha de hace una semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    useEffect(() => {
        AOS.init();
        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);

            const fetchFavorites = async () => {
                try {
                    const response = await getUserFavorites(decodedToken.id);
                    setFavoriteReports(response.data.favoriteReports);
                } catch (error) {
                    console.error('Error al obtener reportes favoritos:', error);
                    toast.error('No se pudieron cargar los reportes favoritos.');
                }
            };

            fetchFavorites();

            const fetchGroups = async () => {
                try {
                    const response = await getGroups();
                    setGroups(response.data);
                } catch (error) {
                    console.error('Error al obtener los grupos:', error);
                }
            };

            fetchGroups();
        }
    }, []);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='px-0 mx-0 pb-2 sections-bg ' style={{ minHeight: '97vh' }}>
                <section id="services" className='services w-100'>
                    <div className="container-fluid" data-aos="fade-up">
                        <div className="row align-items-center justify-content-center px-4" data-aos="fade-up" data-aos-delay="100">
                            {favoriteReports.sort((a, b) => a.GroupId - b.GroupId).map((report) => (
                                <div
                                    key={report.id}
                                    className="col-lg-3 col-md-6 align-items-center justify-content-center mt-4 pt-3"
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
                                        </div>
                                        <div className="icon">
                                            {/*<i className={`bi bi-${report.icon}`}></i>*/}
                                            <img src={iconReport} style={{ width: "140.5px", height: "29.98px" }}
                                                className="d-inline-block align-top img-fluid" />
                                        </div>
                                        <h3>{report.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/*<div className="d-flex justify-content-center mt-4">
                            <Button variant="primary" className='mx-2' onClick={() => navigate('/menu')}>Volver al menú principal</Button>
                        </div> */}
                    </div>
                </section>
            </Container>
            <footer className="fixed-bottom text-white px-0 m-0" style={{ backgroundColor: "#1A3EC1", minHeight: '2vh' }}>
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC-EsSalud</div>
                        <div className="col-6 text-center">Versión: 1.2</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-end">Versión: 1.2</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
