import React, { useEffect, useState } from 'react';
import { getUserReports, addFavorite, removeFavorite, getUserFavorites } from '../api/user.api'
import { getGroups } from '../api/group.api';
import { getModules } from '../api/module.api';
import { jwtDecode } from "jwt-decode";
import { Link, Route, useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-hot-toast";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import iconReport from '../assets/logo-microsoft-power-bi.svg';
import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar'
import { Container, Col } from 'react-bootstrap';

export function ResultPage() {
    const searchParams = new URLSearchParams(window.location.search);
    const key = searchParams.get('key');
    const [reports, setReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [noResults, setNoResults] = useState(false); // Nuevo estado para controlar si no se encontraron resultados
    const navigate = useNavigate();

    // Obtener la fecha actual
    const currentDate = new Date();

    // Obtener la fecha de hace dos semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(currentDate.getDate() - 14);

    // Obtener la fecha de hace una semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

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

            const fetchGroups = async () => {
                try {
                    const response = await getGroups();
                    setGroups(response.data);
                } catch (error) {
                    console.error('Error al obtener los grupos:', error);
                }
            };

            fetchGroups();

            const fetchModules = async () => {
                try {
                    const response = await getModules();
                    setModules(response.data);
                } catch (error) {
                    console.error('Error al obtener los grupos:', error);
                }
            };

            fetchModules();
            const fetchReportsAndFavorites = async () => {
                try {
                    const decodedToken = jwtDecode(localStorage.getItem('access'));
                    setUsuario(decodedToken.username);
                    setRole(decodedToken.role);
                    setUserId(decodedToken.id);

                    const [reportRes, favRes] = await Promise.all([
                        getUserReports(decodedToken.id),
                        getUserFavorites(decodedToken.id)
                    ]);

                    const favoriteIds = new Set(favRes.data.favoriteReports.map(fav => fav.id));
                    const reportsWithFavorites = reportRes.data.reports.map(report => ({
                        ...report,
                        isFavorite: favoriteIds.has(report.id)
                    }));


                } catch (error) {
                    console.error('Error al obtener la información:', error);
                    toast.error('Error al cargar los reportes y favoritos');
                }
            };

            fetchReportsAndFavorites();
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

    const toggleFavorite = async (report) => {
        try {
            // Determinar la nueva acción basada en el estado actual de favorito
            const newFavoriteStatus = !report.isFavorite;
            const reportId = report.id
            // Optimistically update the UI
            setReports(reports.map(r => {
                if (r.id === report.id) {
                    return { ...r, isFavorite: newFavoriteStatus };
                }
                return r;
            }));

            // API call based on the new status
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
            // Revertir en caso de error, manteniendo la UI consistente con el estado del servidor
            setReports(reports);
        }
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar></NavBar>
            <Container fluid className='mt-5 mb-0 p-5 pb-0'>
                <section id="services" className='services w-100'>
                    <Container fluid data-aos="fade-up">
                        <div className="row align-items-center justify-content-center px-4" data-aos="fade-up" data-aos-delay="100">
                            <div className='w-100'>
                                <Col>
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb" style={{}}>
                                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                                <a href="#">
                                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                                    </i>Menú Principal</a>
                                            </li>
                                            <li className="breadcrumb-item active" aria-current="page">Resultados de búsqueda</li> {/* Colocar aqui el nombre de los módulos */}
                                        </ol>
                                    </nav>
                                </Col>
                            </div>
                            {reports.sort((a, b) => a.GroupId - b.GroupId).map((report) => (
                                <div key={report.id} className="col-lg-3 col-md-6 align-items-center justify-content-center mt-4 pt-3" data-bs-toggle="tooltip" data-bs-placement="top" title={report.description}>
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
                                            <button onClick={() => toggleFavorite(report)} type="button" className="btn btn-outline-light dest-icon">
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
                        </div>
                    </Container>
                </section>
            </Container>
            <footer className="fixed-bottom text-white px-0 m-0 footer" style={{ minHeight: '2vh' }}>
                <Container fluid>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC-EsSalud</div>
                        <div className="col-6 text-center">Versión: 1.1.0.20240527</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-end">Versión: 1.1.0.20240527</div>
                    </div>
                </Container>
            </footer>
        </div>

    );
}
