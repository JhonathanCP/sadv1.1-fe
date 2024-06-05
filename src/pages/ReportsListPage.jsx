import React, { useEffect, useState } from 'react';
import { getReports } from '../api/report.api';
import { getModules } from '../api/module.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import AOS from 'aos';
import 'bootstrap-icons/font/bootstrap-icons.css';  // Importamos Bootstrap Icons

export function ReportListPage() {
    const [modules, setModules] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage);
            localStorage.removeItem('successMessage');
        }
        AOS.init();

        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > expirationTime) {
                toast('Sesión expirada', {
                    icon: '👏',
                });
                handleLogout();
            }
        }

        const fetchData = async () => {
            try {
                const modulesResponse = await getModules();
                const reportsResponse = await getReports();

                const modulesData = modulesResponse.data.map(module => ({
                    ...module,
                    reports: reportsResponse.data.filter(report => report.ModuleId === module.id)
                }));

                setModules(modulesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        if (event.target.value) {
            const allModuleIds = modules.map(module => module.id);
            setExpandedModules(allModuleIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
        } else {
            setExpandedModules({});
        }
    };

    const toggleModuleExpansion = (moduleId) => {
        setExpandedModules(prevState => ({
            ...prevState,
            [moduleId]: !prevState[moduleId]
        }));
    };

    const filteredModules = modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.reports.some(report => 
            report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='my-3 p-5'>
                <Row>
                    <Col md={10}>
                        <h2>Listado de Reportes</h2>
                    </Col>
                    <Col md={2}>
                        <Link to={`/admin/create-report`} className="btn btn-success">
                            Crear Reporte
                        </Link>
                    </Col>
                </Row>
                <Row className="my-3">
                    <Col md={12}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre o descripción"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </Col>
                </Row>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                {filteredModules.map((module) => (
                                    <React.Fragment key={module.id}>
                                        <tr>
                                            <td colSpan="3">
                                                <Button variant="link" onClick={() => toggleModuleExpansion(module.id)} style={{ textDecoration: 'none', color: '#00527E', fontWeight: 'bold' }}>
                                                    <i className={`bi ${expandedModules[module.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> Módulo: {module.name}
                                                </Button>
                                            </td>
                                        </tr>
                                        {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                            <tr key={report.id}>
                                                <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                <td>{report.name}</td>
                                                <td>
                                                    <Link to={`/admin/report/${report.id}`} className="btn btn-primary">
                                                        Editar Reporte
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/menu')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row>
            </Container>
            <footer className="fixed-bottom text-white px-0 m-0" style={{ backgroundColor: "#0064AF", minHeight: '2vh' }}>
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC-EsSalud</div>
                        <div className="col-6 text-center">Versión: 1.1.0.20240527</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-end">Versión: 1.1.0.20240527</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
