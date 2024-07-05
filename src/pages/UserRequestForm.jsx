
import React, { useState, useEffect } from 'react';
import { createAccessRequest } from '../api/accessrequest.api';
import { getReports } from '../api/report.api';
import { getUsers, getUser } from '../api/user.api';
import { getMainDependencies } from '../api/maindependency.api';
import { getDependencies } from '../api/dependency.api';
import { getGroups } from '../api/group.api';
import { getModules } from '../api/module.api';
import {jwtDecode} from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import {
    Container, Row, Col, Form, Button, Modal, Table, InputGroup, FormControl, Dropdown, DropdownButton, Badge
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';

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
    const [area, setArea] = useState('');
    const [emailList, setEmailList] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalReports, setModalReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [modules, setModules] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
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

        try {
            const token = localStorage.getItem('access');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const newAccessRequest = {
                nombreSolicitante,
                area,
                UserId: userId,
                ReportIds: selectedReports,
                requestedUserIds: selectedUsers
            };

            await createAccessRequest(newAccessRequest);
            toast.success('Solicitud de acceso creada exitosamente');
            navigate('/user-requests'); // Redirige a la página de solicitudes del usuario después de crear la solicitud
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

    const paginatedReports = modalReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const selectedReportsSet = new Set(selectedReports);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='my-3 p-5'>
                <Col>
                    <nav className aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item">
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Crear solicitud de acceso</li>
                        </ol>
                    </nav>
                </Col>
                <Row>
                    <Col md={12} className='my-3'>
                        <h2 className='custom-h2'>Crear solicitud de acceso</h2>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formNombreSolicitante">
                                <Form.Label>Nombre del solicitante</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreSolicitante}
                                    onChange={(e) => setNombreSolicitante(e.target.value)}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group controlId="formMainDependency">
                                <Form.Label>Dependencia Principal</Form.Label>
                                <Form.Control
                                    as="select"
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

                            <Form.Group controlId="formDependency">
                                <Form.Label>Dependencia Secundaria</Form.Label>
                                <Form.Control
                                    as="select"
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

                            <Form.Group controlId="formEmailList">
                                <Form.Label>Listado de correos</Form.Label>

                                <InputGroup>
                                    <FormControl
                                        type="text"
                                        value={emailInput}
                                        onChange={handleEmailChange}
                                        placeholder="Buscar correos"
                                    />
                                    <Dropdown.Menu show={emailInput.length > 0}>
                                        {users.filter(user => user.username.includes(emailInput)).map(user => (
                                            <Dropdown.Item key={user.id} onClick={() => handleEmailSelect(user.username)}>
                                                {user.username}@essalud.gob.pe
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </InputGroup>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={emailList.join('; ')}
                                    readOnly
                                    className="mt-2"
                                />
                            </Form.Group>

                            <Form.Group controlId="formAcceptedTerms">
                                <Form.Check
                                    type="checkbox"
                                    label="He leído y acepto los Términos y Condiciones"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    required
                                />
                            </Form.Group>

                            <h3>Listado de reportes a solicitar</h3>
                            <Button variant="primary" onClick={handleOpenModal}>
                                <i className="bi bi-search"></i> Buscar reportes
                            </Button>

                            <Table className="mt-3">
                                <thead>
                                    <tr>
                                        <th>Grupo</th>
                                        <th>Módulo</th>
                                        <th>Reporte</th>
                                        <th>Descripción</th>
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>

                            <Button variant="primary" type="submit" className='mt-3'>
                                Guardar solicitud
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Catálogo de reportes SAD</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table>
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
                    <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSelectReports}>Seleccionar</Button>
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                        {[...Array(Math.ceil(modalReports.length / reportsPerPage)).keys()].map(page => (
                            <Button
                                key={page + 1}
                                variant={currentPage === page + 1 ? 'primary' : 'secondary'}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                {page + 1}
                            </Button>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
