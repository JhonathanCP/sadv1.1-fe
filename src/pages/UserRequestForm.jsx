import React, { useState, useEffect } from 'react';
import { createAccessRequest } from '../api/accessrequest.api';
import { getReports } from '../api/report.api';
import { getUsers, getUser } from '../api/user.api';
import { getMainDependencies } from '../api/maindependency.api';
import { getDependencies } from '../api/dependency.api';
import { getGroups } from '../api/group.api';
import { getModules } from '../api/module.api';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import {
    Container, Row, Col, Form, Button, Modal, Table, InputGroup, FormControl,
    Dropdown, ModalFooter, Pagination
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';
import Lottie from 'react-lottie';
import successAlert from '../assets/allerts/success-allert.json';
import warningAlert from '../assets/allerts/warning-allert.json';

export function UserRequestForm() {
    const [reports, setReports] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [mainDependencies, setMainDependencies] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [userDependency, setUserDependency] = useState('');
    const [userMainDependency, setUserMainDependency] = useState('');
    const [nombreSolicitante, setNombreSolicitante] = useState('');
    const [emailList, setEmailList] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalReports, setModalReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 7;
    const [showWarning, setShowWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', {
                    icon: '👏',
                });
                handleLogout();
            }
        }
        if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            setNombreSolicitante(decodedToken.username);

            const fetchInitialData = async () => {
                try {
                    const [
                        reportResponse,
                        userResponse,
                        mainDependencyResponse,
                        dependencyResponse,
                        user,
                        groupResponse,
                        moduleResponse
                    ] = await Promise.all([
                        getReports(),
                        getUsers(),
                        getMainDependencies(),
                        getDependencies(),
                        getUser(userId),
                        getGroups(),
                        getModules()
                    ]);

                    setReports(reportResponse.data.filter(report => report.limited));
                    setUsers(userResponse.data);
                    setMainDependencies(mainDependencyResponse.data);
                    setDependencies(dependencyResponse.data);
                    const userDep = dependencyResponse.data.find(dep => dep.id === user.data.DependencyId);
                    setUserDependency(userDep.id);
                    setUserMainDependency(userDep.MainDependencyId);
                    setGroups(groupResponse.data);
                    setModules(moduleResponse.data);
                } catch (error) {
                    console.error('Error al obtener datos iniciales:', error);
                    toast.error('Error al cargar datos iniciales');
                }
            };

            fetchInitialData();
        }
    }, []);

    const handleEmailChange = (event) => {
        setEmailInput(event.target.value);
    };

    const handleEmailSelect = (username) => {
        const email = `${username}@essalud.gob.pe`;
        if (!emailList.includes(email)) {
            setEmailList([...emailList, email]);
            setSelectedUsers([...selectedUsers, users.find(user => user.username === username).id]);
        }
        setEmailInput('');
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    const handleEmailRemove = (email) => {
        setEmailList(emailList.filter(e => e !== email));
        const username = email.split('@')[0];
        const userIdToRemove = users.find(user => user.username === username).id;
        setSelectedUsers(selectedUsers.filter(id => id !== userIdToRemove));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!acceptedTerms) {
            toast.error('Debe aceptar los Términos y Condiciones');
            return;
        }

        if (emailList.length === 0) {
            toast.error('Debe agregar al menos un correo electrónico a la lista');
            return;
        }

        if (selectedReports.length === 0) {
            toast.error('Debe seleccionar al menos un reporte');
            return;
        }

        setShowWarning(true);
    };

    const handleAcceptWarning = async () => {
        setShowWarning(false);
        try {
            const token = localStorage.getItem('access');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const newAccessRequest = {
                nombreSolicitante,
                UserId: userId,
                ReportIds: selectedReports,
                requestedUserIds: selectedUsers
            };

            await createAccessRequest(newAccessRequest);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error al crear la solicitud de acceso:', error);
            toast.error('Error al crear la solicitud de acceso');
        }
    };

    const handleMainDependencyChange = (event) => {
        const mainDependencyId = event.target.value;
        setUserMainDependency(mainDependencyId);
        const filteredDependencies = dependencies.filter(dep => dep.MainDependencyId === mainDependencyId);
        setUserDependency('');
        setDependencies(filteredDependencies);
    };

    const handleOpenModal = () => {
        setModalReports(reports.map(report => ({
            ...report,
            selected: selectedReports.includes(report.id)
        })));
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectReports = () => {
        const selectedReportIds = modalReports.filter(report => report.selected).map(report => report.id);
        setSelectedReports(selectedReportIds);
        setShowModal(false);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleModalReportSelect = (reportId) => {
        setModalReports(modalReports.map(report => {
            if (report.id === reportId) {
                return { ...report, selected: !report.selected };
            }
            return report;
        }));
    };

    const handleRemoveReport = (reportId) => {
        setSelectedReports(selectedReports.filter(id => id !== reportId));
    };

    const paginatedReports = modalReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: showWarning ? warningAlert : successAlert,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='mt-0 p-5 mb-0'>
                <Col className="d-flex align-items-end" style={{ minHeight: '8vh' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item" onClick={() => navigate('/user-requests')}>
                                <a href="#">
                                    Mis solicitudes</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Nueva solicitud de acceso</li>
                        </ol>
                    </nav>
                </Col>
                <Row style={{ justifyContent: 'end' }}>
                    <Col md={10} className='my-3'>
                        <h2 className='custom-h2'>Nueva solicitud de acceso</h2>
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" onClick={handleSubmit} className='mt-3'>
                            Guardar solicitud
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                            <Row md={12}>
                                <Col md={4}>
                                    <Form.Group controlId="formNombreSolicitante">
                                        <Form.Label>Usuario del solicitante</Form.Label>
                                        <Form.Control
                                            type="text"
                                            disabled
                                            value={nombreSolicitante}
                                            onChange={(e) => setNombreSolicitante(e.target.value)}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formMainDependency">
                                        <Form.Label>Dependencia Principal</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled
                                            value={userMainDependency}
                                            onChange={handleMainDependencyChange}
                                            required
                                        >
                                            <option value="">Selecciona una dependencia principal</option>
                                            {mainDependencies.map(dep => (
                                                <option key={dep.id} value={dep.id}>
                                                    {dep.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formDependency">
                                        <Form.Label>Dependencia Secundaria</Form.Label>
                                        <Form.Control
                                            as="select"
                                            disabled
                                            value={userDependency}
                                            onChange={(e) => setUserDependency(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecciona una dependencia secundaria</option>
                                            {dependencies.map(dep => (
                                                <option key={dep.id} value={dep.id}>
                                                    {dep.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group controlId="formEmailList">
                                <Row>
                                    <Col md={2} className='d-flex' style={{ alignItems: 'center' }}>
                                        <Form.Label>Listado de correos *</Form.Label>
                                    </Col>
                                    <Col md={10}>
                                        <InputGroup>
                                            <FormControl
                                                type="text"
                                                value={emailInput}
                                                onChange={handleEmailChange}
                                                placeholder="Buscar correos"
                                            />
                                            <Dropdown.Menu show={emailInput.length > 0} style={{ maxHeight: '200px', overflowY: 'auto' }} className='mt-5'>
                                                {users.filter(user => user.username.includes(emailInput)).length > 0 ? (
                                                    users.filter(user => user.username.includes(emailInput)).slice(0, 10).map(user => (
                                                        <Dropdown.Item key={user.id} onClick={() => handleEmailSelect(user.username)}>
                                                            {user.username}@essalud.gob.pe
                                                        </Dropdown.Item>
                                                    ))
                                                ) : (
                                                    <Dropdown.Item disabled>No se encontraron coincidencias</Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <div className="form-control my-4" style={{ height: 'auto', minHeight: '60px', overflowY: 'auto' }}>
                                    {emailList.map(email => (
                                        <span key={email} className="badge rounded-pill text-bg-light me-2">
                                            {email}
                                            <Button variant="link" size="sm" onClick={() => handleEmailRemove(email)} style={{ textDecoration: 'none', paddingLeft: '5px' }}>
                                                <i className="bi bi-x-circle-fill"></i>
                                            </Button>
                                        </span>
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group controlId="formAcceptedTerms">
                                <Form.Check
                                    type="checkbox"
                                    label="He leído y acepto los Términos y Condiciones *"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    required
                                />
                            </Form.Group>
                            <Row>
                                <Col md={10} className='d-flex' style={{ alignItems: 'center' }}>
                                    <h4>Listado de reportes a solicitar</h4>
                                </Col>
                                <Col md={2}>
                                    <Button variant="outline-primary" onClick={handleOpenModal}>
                                        <i className="bi bi-search"></i> Buscar reportes
                                    </Button>
                                </Col>
                            </Row>
                            <Table responsive style={{ borderRadius: '6px' }}>
                                <thead>
                                    <tr>
                                        <th className='table-header'>Grupo</th>
                                        <th className='table-header'>Módulo</th>
                                        <th className='table-header'>Reporte</th>
                                        <th className='table-header'>Descripción</th>
                                        <th className='table-header'></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReports.map(reportId => {
                                        const report = reports.find(r => r.id === reportId);
                                        const group = groups.find(g => g.id === report.GroupId);
                                        const module = modules.find(m => m.id === report.ModuleId);
                                        return (
                                            <tr key={report.id}>
                                                <td>{group ? group.name : 'Desconocido'}</td>
                                                <td>{module ? module.name : 'Desconocido'}</td>
                                                <td>{report.name}</td>
                                                <td>{report.description}</td>
                                                <td>
                                                    <Button variant="link" onClick={() => handleRemoveReport(report.id)} style={{ textDecoration: 'none' }}>
                                                        <i className="bi bi-x-lg" style={{ paddingRight: '10px' }}></i>
                                                        Quitar
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Form>
                    </Col>
                </Row>
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

            <Modal show={showModal} onHide={handleCloseModal} size='xl' centered>
                <Modal.Header closeButton>
                    <Modal.Title>Catálogo de reportes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Grupo</th>
                                <th>Módulo</th>
                                <th>Reporte</th>
                                <th>Descripción</th>
                                <th>Seleccionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReports.map(report => (
                                <tr key={report.id}>
                                    <td>{groups.find(g => g.id === report.GroupId)?.name || 'Desconocido'}</td>
                                    <td>{modules.find(m => m.id === report.ModuleId)?.name || 'Desconocido'}</td>
                                    <td>{report.name}</td>
                                    <td>{report.description}</td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={report.selected || false}
                                            onChange={() => handleModalReportSelect(report.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Row>
                        <Pagination style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination.First onClick={() => handlePageChange(1)} />
                            <Pagination.Prev onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} />
                            {currentPage > 2 && (
                                <>
                                    <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
                                    {currentPage > 3 && <Pagination.Ellipsis />}
                                </>
                            )}
                            {Array.from({ length: Math.ceil(modalReports.length / reportsPerPage) }, (_, index) => {
                                const page = index + 1;
                                if (page === currentPage || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                    return (
                                        <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                            {page}
                                        </Pagination.Item>
                                    );
                                }
                                return null;
                            })}
                            {currentPage < Math.ceil(modalReports.length / reportsPerPage) - 1 && (
                                <>
                                    {currentPage < Math.ceil(modalReports.length / reportsPerPage) - 2 && <Pagination.Ellipsis />}
                                    <Pagination.Item onClick={() => handlePageChange(Math.ceil(modalReports.length / reportsPerPage))}>
                                        {Math.ceil(modalReports.length / reportsPerPage)}
                                    </Pagination.Item>
                                </>
                            )}
                            <Pagination.Next onClick={() => handlePageChange(currentPage < Math.ceil(modalReports.length / reportsPerPage) ? currentPage + 1 : Math.ceil(modalReports.length / reportsPerPage))} />
                            <Pagination.Last onClick={() => handlePageChange(Math.ceil(modalReports.length / reportsPerPage))} />
                        </Pagination>
                    </Row>
                </Modal.Body>
                <ModalFooter>
                    <Button variant="outline-primary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSelectReports}>Seleccionar</Button>
                </ModalFooter>
            </Modal>

            {/* Alert Modal */}
            <Modal show={showWarning || showSuccess} onHide={() => { setShowWarning(false); setShowSuccess(false); }} centered>
                <Modal.Body>
                    <Lottie options={defaultOptions} height={100} width={100} />
                    {showWarning && (
                        <div className='container-fluid'>
                            <h4 className='text-center mt-5'>¿Estás seguro de que deseas guardar la solicitud?</h4>
                            <div className='container-fluid d-flex justify-content-between mt-2'>
                                <Button variant="secondary" onClick={() => setShowWarning(false)}>No</Button>
                                <Button variant="primary" onClick={handleAcceptWarning}>Sí</Button>
                            </div>
                        </div>
                    )}
                    {showSuccess && (
                        <div className='container-fluid'>
                            <h4 className='text-center mt-5'>Solicitud guardada con éxito.</h4>
                            <div className='container-fluid d-flex justify-content-center mt-2'>
                                <Button variant="primary" onClick={() => { setShowSuccess(false); navigate('/user-requests'); }}>Cerrar</Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}