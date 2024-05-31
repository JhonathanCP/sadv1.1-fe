import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserReports, addReport, removeReport } from '../api/user.api';
import { getUser } from '../api/user.api';
import { getReports } from '../api/report.api';
import { getModules } from '../api/module.api';
import { getGroups } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import AOS from 'aos';
import 'bootstrap-icons/font/bootstrap-icons.css';  // Importamos Bootstrap Icons
import { jwtDecode } from "jwt-decode";


export function EditUserPermissions() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const { id: userId } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        AOS.init();



        const fetchData = async () => {

            try {
                if (userId) {
                    const response = await getUser(userId);
                    setUsuario(response.data.username);
                }
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
            }

            try {
                const userReportsResponse = await getUserReports(userId);
                const allReportsResponse = await getReports();
                const modulesResponse = await getModules();
                const groupsResponse = await getGroups();

                const groupsData = groupsResponse.data.map(group => ({
                    ...group,
                    modules: modulesResponse.data
                        .filter(module => module.GroupId === group.id)
                        .map(module => ({
                            ...module,
                            reports: allReportsResponse.data
                                .filter(report => report.ModuleId === module.id)
                                .map(report => ({
                                    ...report,
                                    hasPermission: userReportsResponse.data.reports.some(userReport => userReport.id === report.id)
                                }))
                        }))
                }));

                setGroups(groupsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        if (event.target.value) {
            const allGroupIds = groups.map(group => group.id);
            const allModuleIds = groups.flatMap(group => group.modules.map(module => module.id));
            setExpandedGroups(allGroupIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
            setExpandedModules(allModuleIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
        } else {
            setExpandedGroups({});
            setExpandedModules({});
        }
    };

    const toggleGroupExpansion = (groupId) => {
        setExpandedGroups(prevState => ({
            ...prevState,
            [groupId]: !prevState[groupId]
        }));
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
            setGroups(prevGroups =>
                prevGroups.map(group => ({
                    ...group,
                    modules: group.modules.map(module => ({
                        ...module,
                        reports: module.reports.map(report =>
                            report.id === reportId ? { ...report, hasPermission: true } : report
                        )
                    }))
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
            setGroups(prevGroups =>
                prevGroups.map(group => ({
                    ...group,
                    modules: group.modules.map(module => ({
                        ...module,
                        reports: module.reports.map(report =>
                            report.id === reportId ? { ...report, hasPermission: false } : report
                        )
                    }))
                }))
            );
            toast.success('Permiso quitado con éxito');
        } catch (error) {
            toast.error('Error al quitar permiso');
        }
    };

    const filteredGroups = groups.map(group => ({
        ...group,
        modules: group.modules.map(module => ({
            ...module,
            reports: module.reports.filter(report =>
                report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(module => module.reports.length > 0)
    })).filter(group => group.modules.length > 0);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='my-3 p-5'>
                <Row>
                    <Col md={10}>
                        <h2>Editar Permisos de: {usuario}</h2>
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
                                {filteredGroups.map((group, groupIndex) => (
                                    <React.Fragment key={group.id}>
                                        <tr>
                                            <td colSpan="3">
                                                <Button variant="link" onClick={() => toggleGroupExpansion(group.id)} style={{ textDecoration: 'none', color: '#00527E', fontWeight: 'bold' }}>
                                                    <i className={`bi ${expandedGroups[group.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> Grupo: {group.name}
                                                </Button>
                                            </td>
                                        </tr>
                                        {expandedGroups[group.id] && group.modules.map((module, moduleIndex) => (
                                            <React.Fragment key={module.id}>
                                                <tr>
                                                    <td colSpan="3" style={{ paddingLeft: '20px' }}>
                                                        <Button variant="link" onClick={() => toggleModuleExpansion(module.id)} style={{ textDecoration: 'none', color: '#006CA6', fontWeight: 'bold' }}>
                                                            <i className={`bi ${expandedModules[module.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> Módulo: {module.name}
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                                    <tr key={report.id}>
                                                        <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                        <td>{report.name}</td>
                                                        <td>
                                                            {report.free ? (
                                                                <span className="text-success">Reporte Libre</span>
                                                            ) : (
                                                                report.hasPermission ? (
                                                                    <>
                                                                        <Button onClick={() => handleRemovePermission(report.id)} className="btn btn-danger ml-2">
                                                                            Quitar Permiso
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button onClick={() => handleAddPermission(report.id)} className="btn btn-primary">
                                                                        Agregar Permiso
                                                                    </Button>
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/admin/users')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row>
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
