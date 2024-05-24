import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, updateReport, createReport, deleteReport } from '../api/report.api';
import { getModules } from '../api/module.api';
import { getGroups } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import AOS from 'aos';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function ReportForm() {
    const { id: reportId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!reportId;
    const [report, setReport] = useState({
        name: '',
        description: '',
        version: '',
        active: true,
        icon: '',
        link: '',
        free: false,
        limited: false,
        restricted: false,
        ModuleId: '',
        createdAt: '',
        updatedAt: ''
    });
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        AOS.init();

        const fetchData = async () => {
            try {
                if (isEditMode) {
                    const reportResponse = await getReport(reportId);
                    setReport({
                        ...reportResponse.data,
                        createdAt: reportResponse.data.createdAt ? new Date(reportResponse.data.createdAt).toISOString().slice(0, 16) : '',
                        updatedAt: reportResponse.data.updatedAt ? new Date(reportResponse.data.updatedAt).toISOString().slice(0, 16) : ''
                    });
                }
                const modulesResponse = await getModules();
                const groupsResponse = await getGroups();

                setModules(modulesResponse.data);
                setGroups(groupsResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [reportId, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setReport(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (e) => {
        const { value } = e.target;
        setReport(prevState => ({
            ...prevState,
            free: value === 'free',
            limited: value === 'limited',
            restricted: value === 'restricted'
        }));
    };

    const adjustForTimezone = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        date.setHours(date.getHours() - 5); // Adjusting for GMT-5
        return date.toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedReport = {
            ...report,
            ModuleId: report.ModuleId ? parseInt(report.ModuleId, 10) : null,
            createdAt: adjustForTimezone(report.createdAt),
            updatedAt: adjustForTimezone(report.updatedAt)
        };

        try {
            if (isEditMode) {
                await updateReport(reportId, formattedReport);
                toast.success('Reporte actualizado con éxito');
            } else {
                await createReport(formattedReport);
                toast.success('Reporte creado con éxito');
            }
            navigate('/admin/reports');
        } catch (error) {
            toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el reporte`);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteReport(reportId);
            toast.success('Reporte eliminado con éxito');
            navigate('/admin/reports');
        } catch (error) {
            toast.error('Error al eliminar el reporte');
        }
    };

    return (
        <div className='p-0'>
            <NavBar />
            <Container fluid className='my-3 p-5 d-flex justify-content-center align-items-center'>
                <Row className="w-100 justify-content-center">
                    <Col md={11}>
                        <h2 className="text-center">{isEditMode ? 'Editar Reporte' : 'Crear Reporte'}</h2>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner>
                            </div>
                        ) : error ? (
                            <p>Error: {error}</p>
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={10}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Nombre</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={report.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group controlId="formVersion">
                                            <Form.Label>Versión</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="version"
                                                value={report.version}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={10}>
                                        <Form.Group controlId="formDescription">
                                            <Form.Label>Descripción</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="description"
                                                value={report.description}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group controlId="formIcon">
                                            <Form.Label>Ícono: (Solo introducir nombre del ícono) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="icon"
                                                value={report.icon}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={10}>
                                        <Form.Group controlId="formLink">
                                            <Form.Label>Enlace</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="link"
                                                value={report.link}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group controlId="formModule">
                                            <Form.Label>Módulo</Form.Label>
                                            <Form.Control
                                                as="select"
                                                name="ModuleId"
                                                value={report.ModuleId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Seleccionar Módulo</option>
                                                {groups.map(group => (
                                                    <optgroup key={group.id} label={group.name}>
                                                        {modules
                                                            .filter(module => module.GroupId === group.id)
                                                            .map(module => (
                                                                <option key={module.id} value={module.id}>
                                                                    {module.name}
                                                                </option>
                                                            ))}
                                                    </optgroup>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={4}>
                                        <Form.Group controlId="formStatus">
                                            <Form.Label>Nivel de acceso</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={report.free ? 'free' : report.limited ? 'limited' : 'restricted'}
                                                onChange={handleSelectChange}
                                            >
                                                <option value="free">Libre</option>
                                                <option value="limited">Limitado</option>
                                                <option value="restricted">Restringido</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formActive">
                                            <Form.Label>Estado</Form.Label>
                                            <Form.Check
                                                type="checkbox"
                                                label="Activo"
                                                name="active"
                                                checked={report.active}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={4}>
                                        <Form.Group controlId="formCreatedAt">
                                            <Form.Label>Fecha de Creación</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="createdAt"
                                                value={report.createdAt}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="formUpdatedAt">
                                            <Form.Label>Fecha de Actualización</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="updatedAt"
                                                value={report.updatedAt}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className='mb-4 justify-content-center'>
                                    <Col md={2} className='mb-2'>
                                        <Button variant="primary" type="submit" className="w-100">
                                            {isEditMode ? 'Guardar Cambios' : 'Crear Reporte'}
                                        </Button>
                                    </Col>
                                    {isEditMode && (
                                        <Col md={2} className='mb-2'>
                                            <Button variant="danger" onClick={handleDelete} className="w-100">
                                                Eliminar Reporte
                                            </Button>
                                        </Col>
                                    )}
                                    <Col md={2} className='mb-2'>
                                        <Button variant="dark" onClick={() => navigate('/admin/reports')} className="w-100">
                                            Volver
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        )}
                    </Col>
                </Row>
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
