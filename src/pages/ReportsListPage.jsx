import React, { useEffect, useState } from 'react';
import { getReports } from '../api/report.api';
import { getModules } from '../api/module.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button,Accordion,Table,Modal,FloatingLabel,Image } from 'react-bootstrap';
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
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const searchUrl = `/reports?key=${encodeURIComponent(searchQuery.trim())}`;
            window.location.replace(searchUrl); // Reload the page
        } else {
            // Show error message or handle empty search query
            
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };


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
                            <li class="breadcrumb-item active" aria-current="page">Reportes</li> {/* Colocar aqu los módulos */}
                        </ol>
                    </nav>
                </Col>
                <Row className="my-3">
                    <Col md={8} >
                        <h2 className='custom-h2'>Reportes</h2> 
                    </Col>
                    <Col md={2} style={{alignContent:'center'}}>
                        <div className="search-bar d-flex" >
                            <Form.Control
                            type="search"
                            placeholder="Buscar reporte"
                            className="search-input"
                            aria-label="Buscar reporte"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyPress}
                            />
                            <i onClick={handleSearch} className="bi bi-search search-icon"></i>
                        </div>
                    </Col>
                    <Col md={2} style={{alignContent:'center'}}>
                        <Link to={`/admin/create-report`} className="btn btn-primary">
                            Crear Reporte
                        </Link>
                    </Col>
                    
                </Row>
                {/**
                <Row className="my-3">
                    <Col md={12}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre o descripción"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </Col>
                </Row> */}
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (

                <div>
                    {filteredModules.map((module) => (
                        <React.Fragment key={module.id}>
                            {/**<tr>
                                <td colSpan="3">
                                    <Button variant="link" onClick={() => toggleModuleExpansion(module.id)} style={{ textDecoration: 'none', color: '#00527E', fontWeight: 'bold' }}>
                                        <i className={`bi ${expandedModules[module.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> Módulo: {module.name}
                                    </Button>
                                </td>
                                {expandedModules[module.id] && module.reports.map((report, reportIndex) => (
                                                        <tr key={report.id}>
                                                            <td style={{ paddingLeft: '40px' }}>{reportIndex + 1}</td>
                                                            <td>{report.name}</td>
                                                            <td>
                                                                <Link to={`/admin/report/${report.id}`} className="btn btn-link" style={{ textDecorationLine: 'none' }}>
                                                                    <i class="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
                                                                    Editar Reporte
                                                                </Link>
                                                            </td>
                                                        </tr>

                                                    ))}
                            </tr>  */}
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
                                                    <td>
                                                        <Button variant="link" onClick={() => handleShowModal('edit', group, true)} style={{textDecorationLine:'none'}} className="btn btn-link" >
                                                            <i class="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
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
                {/**
                <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/menu')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row> 
                 */}

            </Container>
            <footer className="fixed-bottom text-white px-5 m-0 footer" style={{minHeight: '2vh' }}>
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
            <Modal>
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo reporte</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingresar"
                                        name="name"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Row>
                                    <Col md={2}>
                                        <Image src="holder.js/171x180" thumbnail />
                                    </Col>
                                    <Col md={10}>
                                        <Form.Group controlId="formIcon">
                                            <Form.Label>Ícono: (Solo introducir nombre del ícono) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="icon"
                                                value
                                                onChange
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
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formModule">
                                    <Form.Label>Grupo *</Form.Label>
                                    <Form.Select
                                        type="text"
                                        placeholder="Ingresar"
                                        name="link"
                                        required
                                    />

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
                                        value
                                        onChange
                                        required
                                    />
                                        
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formDescription">
                                    <Form.Label>Descripción</Form.Label>
                                    <FloatingLabel
                                        controlId=""
                                        label=""
                                        className=""
                                    >
                                        <Form.Control
                                        as="textarea"/>
                                    </FloatingLabel>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formStatus">
                                    <Form.Label>Nivel de acceso</Form.Label>
                                    <Form.Select
                                        as="select"
                                        value
                                        onChange
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
                                        checked
                                        onChange
                                    />        
                                </Form.Group>
                            </Col>

                        </Row>
                    </Form>

                </Modal.Body>

                <Modal.Footer>
                <Button  variant="outline-primary" >Cancelar</Button>
                <Button variant="primary">Guardar</Button>
                </Modal.Footer>
      </Modal>

        </div>
    );
}
