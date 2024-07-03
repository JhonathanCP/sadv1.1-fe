import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserReports, addReport, removeReport } from '../api/user.api';
import { getUser } from '../api/user.api';
import { getReports } from '../api/report.api';
import { getModules } from '../api/module.api';
import { getGroups } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button, Accordion,Table } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import AOS from 'aos';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { jwtDecode } from "jwt-decode";

export function EditUserPermissions() {
    const navigate = useNavigate();
    const { id: userId } = useParams();
    const [usuario, setUsuario] = useState('');
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        AOS.init();
        const fetchData = async () => {
            try {
                if (userId) {
                    const response = await getUser(userId);
                    setUsuario(response.data.username);
                }

                const userReportsResponse = await getUserReports(userId);
                const allReportsResponse = await getReports();
                const modulesResponse = await getModules();

                const modulesData = modulesResponse.data.map(module => ({
                    ...module,
                    reports: allReportsResponse.data
                        .filter(report => report.ModuleId === module.id)
                        .map(report => ({
                            ...report,
                            hasPermission: userReportsResponse.data.reports.some(userReport => userReport.id === report.id)
                        }))
                }));

                setModules(modulesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const fetchGroups = async () => {
            try {
                const response = await getGroups();
                setGroups(response.data);
            } catch (error) {
                console.error('Error al obtener los grupos:', error);
            }
        };

        fetchGroups();

    }, [userId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const toggleModuleExpansion = (moduleId) => {
        setExpandedModules(prevState => ({
            ...prevState,
            [moduleId]: !prevState[moduleId]
        }));
    };

    const handleAddPermission = async (reportId) => {
        try {
            await addReport({ userId, reportId });
            const userReportsResponse = await getUserReports(userId);
            setModules(prevModules =>
                prevModules.map(module => ({
                    ...module,
                    reports: module.reports.map(report =>
                        report.id === reportId ? { ...report, hasPermission: true } : report
                    )
                }))
            );
            toast.success('Permiso agregado con éxito');
        } catch (error) {
            toast.error('Error al agregar permiso');
        }
    };

    const handleRemovePermission = async (reportId) => {
        try {
            await removeReport(userId, reportId);
            const userReportsResponse = await getUserReports(userId);
            setModules(prevModules =>
                prevModules.map(module => ({
                    ...module,
                    reports: module.reports.map(report =>
                        report.id === reportId ? { ...report, hasPermission: false } : report
                    )
                }))
            );
            toast.success('Permiso quitado con éxito');
        } catch (error) {
            toast.error('Error al quitar permiso');
        }
    };

    const filteredModules = modules.map(module => ({
        ...module,
        reports: module.reports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(module => module.reports.length > 0);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='my-3 p-5'>
            <Col>
                <nav class aria-label="breadcrumb">
                    <ol class="breadcrumb" style={{}}>
                        <li class="breadcrumb-item" onClick={() => navigate('/menu')}>
                            <a href="#">
                            <i class="bi bi-house-door" style={{ paddingRight: '5px' }}>
                            </i>Menú Principal</a>
                        </li>
                        <li class="breadcrumb-item"  onClick={() => navigate('/admin/users')}>
                            <a href="#">
                            Usuarios</a></li>
                        <li class="breadcrumb-item active">Editar permisos</li> 
                    </ol>
                </nav>
            </Col>
                <Row>
                    <Col md={10}>
                        <h2 className='custom-h2'>Editar Permisos de: {usuario}</h2>
                    </Col>

                    <Col md={2}>
                        <div className="search-bar d-flex" >
                            <Form.Control
                                type="text"
                                placeholder="Buscar"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <i className="bi bi-search search-icon"></i>
                        </div>    
                    </Col>
                </Row>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div>
                        {filteredModules.map((module) => (
                            <React.Fragment key={module.id}>            
                                <Accordion style={{marginBottom:'5px'}}>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            {/************************COLOCAR AQUI ICONO DEL MODULO*/}
                                            {module.name}
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Table>
                                                <tbody>
                                                    {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                                    <tr key={report.id}>
                                                        <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                        <td>{report.name}</td>
                                                        {groups.filter(group => group.id === report.GroupId).map(group => (
                                                        <td key={group.id}>
                                                        <i className={`bi bi-${group.icon}`}></i> {group.name}
                                                        </td>
                                                    ))}
                                                    <td>
                                                    {report.free ? (
                                                        <span className="text-success">Reporte Libre</span>
                                                    ) : (
                                                        report.hasPermission ? (
                                                            <Button onClick={() => handleRemovePermission(report.id)} className="btn btn-outline-danger" variant="outline-danger">
                                                                <i class="bi bi-hand-thumbs-down" style={{paddingRight:'10px'}}></i>
                                                                Quitar Permiso
                                                            </Button>
                                                            
                                                        ) : (
                                                            <Button onClick={() => handleAddPermission(report.id)} className="btn btn-link" variant="link" >
                                                                <i class="bi bi-hand-thumbs-up" style={{paddingRight:'10px'}}></i>
                                                                Dar Permiso
                                                            </Button>
                                                        )
                                                        )}
                                                    </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                        {/**
                                        <tr>
                                            <td colSpan="12">
                                                <Button variant="link" onClick={() => toggleModuleExpansion(module.id)} style={{ textDecoration: 'none', color: '#006CA6', fontWeight: 'bold' }}>
                                                    <i className={`bi ${expandedModules[module.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> Módulo: {module.name}
                                                </Button>
                                            </td>
                                        </tr>
                                        {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                            <tr key={report.id}>
                                                <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                <td>{report.name}</td>
                                                {groups.filter(group => group.id === report.GroupId).map(group => (
                                                    <td key={group.id}>
                                                        <i className={`bi bi-${group.icon}`}></i> {group.name}
                                                    </td>
                                                ))}
                                                <td>
                                                    {report.free ? (
                                                        <span className="text-success">Reporte Libre</span>
                                                    ) : (
                                                        report.hasPermission ? (
                                                            <Button onClick={() => handleRemovePermission(report.id)} className="btn btn-outline-danger" variant="outline-danger">
                                                                <i class="bi bi-hand-thumbs-down" style={{paddingRight:'10px'}}></i>
                                                                Quitar Permiso
                                                            </Button>
                                                            
                                                        ) : (
                                                            <Button onClick={() => handleAddPermission(report.id)} className="btn btn-link" variant="link" >
                                                                <i class="bi bi-hand-thumbs-up" style={{paddingRight:'10px'}}></i>
                                                                Dar Permiso
                                                            </Button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>

                                            
                                        ))} */}

                                       

                                    </React.Fragment>
                                ))}
                            
                    </div>
                )}
                {/** <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/admin/users')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row>*/}
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
