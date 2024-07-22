import React, { useEffect, useState } from 'react';
import { getReports, getReport, updateReport, createReport, deleteReport } from '../api/report.api';
import { getModules } from '../api/module.api';
import { getGroups } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button, Accordion, Table, Modal, FloatingLabel, Image } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import AOS from 'aos';
import 'bootstrap-icons/font/bootstrap-icons.css';  // Importamos Bootstrap Icons

export function ReportListPage() {
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModules, setExpandedModules] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [currentReport, setCurrentReport] = useState({});

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
                const groupsResponse = await getGroups();

                const modulesData = modulesResponse.data.map(module => ({
                    ...module,
                    reports: reportsResponse.data.filter(report => report.ModuleId === module.id)
                }));

                setModules(modulesData);
                setGroups(groupsResponse.data);
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

    const filteredModules = modules.map(module => ({
        ...module,
        reports: module.reports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(module => module.reports.length > 0);

    const handleShowModal = async (type, report = {}) => {
        setModalType(type);
        if (type === 'edit') {
            try {
                const response = await getReport(report.id);
                setCurrentReport(response.data);
            } catch (error) {
                toast.error('Error al obtener los detalles del reporte');
            }
        } else {
            setCurrentReport(report);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentReport({});
    };

    const handleSaveReport = async (e) => {
        e.preventDefault();

        const formattedReport = {
            ...currentReport,
            ModuleId: currentReport.ModuleId ? parseInt(currentReport.ModuleId, 10) : null,
        };

        try {
            if (modalType === 'edit') {
                await updateReport(currentReport.id, formattedReport);
                toast.success('Reporte actualizado con éxito');
            } else {
                await createReport(formattedReport);
                toast.success('Reporte creado con éxito');
            }
            handleCloseModal();
            const reportsResponse = await getReports();
            const modulesResponse = await getModules();
            const modulesData = modulesResponse.data.map(module => ({
                ...module,
                reports: reportsResponse.data.filter(report => report.ModuleId === module.id)
            }));
            setModules(modulesData);
        } catch (error) {
            toast.error(`Error al ${modalType === 'edit' ? 'actualizar' : 'crear'} el reporte`);
        }
    };

    const handleAccessLevelChange = (e) => {
        const value = e.target.value;
        setCurrentReport({
            ...currentReport,
            free: value === 'free',
            limited: value === 'limited',
            restricted: value === 'restricted'
        });
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='mt-5 mb-1 p-5'>
                <Col>
                    <nav className aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Reportes</li>
                        </ol>
                    </nav>
                </Col>
                <Row className="my-3">
                    <Col md={8} >
                        <h2 className='custom-h2'>Reportes</h2>
                    </Col>
                    <Col md={2} style={{ alignContent: 'center' }}>
                        <div className="search-bar d-flex">
                            <Form.Control
                                type="search"
                                placeholder="Buscar reporte"
                                className="search-input"
                                aria-label="Buscar reporte"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <i className="bi bi-search search-icon"></i>
                        </div>
                    </Col>
                    <Col md={2} style={{ alignContent: 'center' }}>
                        <Button className="btn btn-primary" onClick={() => handleShowModal('create')}>
                            Crear Reporte
                        </Button>
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
                                <Accordion style={{ marginBottom: '5px' }}>
                                    <Accordion.Item eventKey={module.id.toString()}>
                                        <Accordion.Header className='accordion-header' onClick={() => toggleModuleExpansion(module.id)}>
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
                                            <Table>
                                                <tbody>
                                                    {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                                        <tr key={report.id}>
                                                            <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                            <td>{report.name}</td>
                                                            <td>
                                                                <Button variant="link" onClick={() => handleShowModal('edit', report)} style={{ textDecorationLine: 'none' }} className="btn btn-link" >
                                                                    <i className="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
                                                                    Editar Reporte
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </Container>
            <footer className="fixed-bottom text-white px-5 m-0.footer" style={{ minHeight: '2vh' }}>
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

            {/************* MODAL NUEVO REPORTE ********************/}
            <Modal show={showModal} onHide={handleCloseModal} size='xl' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType === 'create' ? 'Nuevo Reporte' : 'Editar Reporte'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveReport}>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingresar"
                                        name="name"
                                        value={currentReport.name || ''}
                                        onChange={(e) => setCurrentReport({ ...currentReport, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Row>
                                    <Col md={2}>
                                        <i thumbnail className={`bi bi-${currentReport.icon}`} style={{ fontSize: '3rem', color: 'cornflowerblue'}}/>
                                    </Col>
                                    <Col md={10}>
                                        <Form.Group controlId="formIcon">
                                            <Form.Label>Ícono: (Solo introducir nombre del ícono) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="icon"
                                                value={currentReport.icon || ''}
                                                onChange={(e) => setCurrentReport({ ...currentReport, icon: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formVersion">
                                    <Form.Label>Versión</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="version"
                                        placeholder="Ingresar"
                                        value={currentReport.version || ''}
                                        onChange={(e) => setCurrentReport({ ...currentReport, version: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formGroup">
                                    <Form.Label>Grupo *</Form.Label>
                                    <Form.Select
                                        name="group"
                                        value={currentReport.GroupId || ''}
                                        onChange={(e) => setCurrentReport({ ...currentReport, GroupId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Grupo</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formLink">
                                    <Form.Label>Enlace *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingresar"
                                        name="link"
                                        value={currentReport.link || ''}
                                        onChange={(e) => setCurrentReport({ ...currentReport, link: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formModule">
                                    <Form.Label>Módulo</Form.Label>
                                    <Form.Select
                                        as="select"
                                        name="ModuleId"
                                        value={currentReport.ModuleId || ''}
                                        onChange={(e) => setCurrentReport({ ...currentReport, ModuleId: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Módulo</option>
                                        {modules.map((module) => (
                                            <option key={module.id} value={module.id}>
                                                {module.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formDescription">
                                    <Form.Label>Descripción</Form.Label>
                                    <FloatingLabel controlId="floatingTextarea" label="">
                                        <Form.Control
                                            as="textarea"
                                            value={currentReport.description || ''}
                                            onChange={(e) => setCurrentReport({ ...currentReport, description: e.target.value })}
                                        />
                                    </FloatingLabel>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formStatus">
                                    <Form.Label>Nivel de acceso</Form.Label>
                                    <Form.Select
                                        as="select"
                                        value={currentReport.free ? 'free' : currentReport.limited ? 'limited' : currentReport.restricted ? 'restricted' : ''}
                                        onChange={handleAccessLevelChange}
                                        required
                                    >
                                        <option value="">Seleccionar Nivel de Acceso</option>
                                        <option value="free">Libre</option>
                                        <option value="limited">Limitado</option>
                                        <option value="restricted">Restringido</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formActive">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Check
                                        type="checkbox"
                                        label="Activo"
                                        name="active"
                                        checked={currentReport.active || false}
                                        onChange={(e) => setCurrentReport({ ...currentReport, active: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Modal.Footer>
                            <Button variant="outline-primary" onClick={handleCloseModal}>Cancelar</Button>
                            <Button variant="primary" type="submit">Guardar</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
