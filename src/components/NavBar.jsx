import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../api/user.api';
import { getDependencies, getDependency } from '../api/dependency.api';
import { getMainDependencies } from '../api/maindependency.api';
import { getNotificationsByUser, updateNotification, getNotificationById } from '../api/notification.api';
import { getRLs } from '../api/rl.api';
import { getPositions } from '../api/position.api';
import { Navbar, Nav, NavDropdown, Form, Button, Container, Modal, Dropdown, Badge, Offcanvas } from 'react-bootstrap';
import Logo from '../assets/logo-essalud-blanco.svg';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

export function NavBar() {
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [mainDependencies, setMainDependencies] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [RLs, setRLs] = useState([]);
    const navigate = useNavigate();
    const [positions, setPositions] = useState([]);
    const [selectedMainDependency, setSelectedMainDependency] = useState(null);
    const [errors, setErrors] = useState({});
    const [originalUserData, setOriginalUserData] = useState({});
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showOffCanvas, setShowOffCanvas] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);
            fetchUserDetails(decodedToken.id);
            fetchRLs();
            fetchPositions();
            fetchMainDependencies();
            fetchNotifications(decodedToken.id);
        }
    }, []);

    const fetchUserDetails = async (id) => {
        try {
            const response = await getUser(id);
            const userData = response.data;
            setUserDetails(userData);
            setOriginalUserData({ ...userData });
            if (userData.DependencyId) {
                fetchDependencyDetails(userData.DependencyId);
            }
        } catch (error) {
            console.error('Error al obtener los detalles del usuario:', error);
        }
    };

    const fetchRLs = async () => {
        try {
            const response = await getRLs();
            setRLs(response.data);
        } catch (error) {
            console.error('Error al obtener los régimenes laborales:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await getPositions();
            setPositions(response.data);
        } catch (error) {
            console.error('Error al obtener las posiciones:', error);
        }
    };

    const fetchMainDependencies = async () => {
        try {
            const response = await getMainDependencies();
            setMainDependencies(response.data);
        } catch (error) {
            console.error('Error al obtener MainDependencies:', error);
        }
    };

    const fetchDependencyDetails = async (dependencyId) => {
        try {
            const response = await getDependency(dependencyId);
            if (response.data) {
                setSelectedMainDependency(response.data.MainDependencyId);
                fetchDependencies(response.data.MainDependencyId);
                setUserDetails(prev => ({
                    ...prev,
                    DependencyId: dependencyId,
                    MainDependencyId: response.data.MainDependencyId
                }));
            }
        } catch (error) {
            console.error('Error al obtener la dependencia:', error);
        }
    };

    const fetchDependencies = async (mainDependencyId) => {
        try {
            const response = await getDependencies(mainDependencyId);
            setDependencies(response.data);
        } catch (error) {
            console.error('Error al obtener Dependencies:', error);
        }
    };

    const fetchNotifications = async (userId) => {
        try {
            const response = await getNotificationsByUser(userId);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error al obtener las notificaciones:', error);
        }
    };

    const handleMainDependencyChange = (e) => {
        const mainDependencyId = e.target.value;
        setSelectedMainDependency(mainDependencyId);
        setUserDetails(prev => ({ ...prev, MainDependencyId: mainDependencyId, DependencyId: '' })); // Clear DependencyId when MainDependency changes
        fetchDependencies(mainDependencyId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "dni" && (value.length > 8 || !/^\d*$/.test(value))) {
            return; // Prevents input if not digits or if more than 8 digits
        }

        if (name === "RLId") {
            if (value === '4') {
                // Set generic user details if RLId is '4'
                setUserDetails({
                    ...userDetails,
                    RLId: '4',
                    PositionId: '4',
                    isGeneric: true
                });
            } else {
                // Reset to original user data if RLId changes from '4' to another value
                setUserDetails(prev => ({
                    ...prev,
                    firstname: prev.originalFirstname || '-',
                    lastname: prev.originalLastname || '-',
                    dni: prev.originalDni || '-',
                    RLId: value,
                    isGeneric: false
                }));
            }
        } else {
            setUserDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!userDetails.MainDependencyId) newErrors.MainDependencyId = 'Dependencia principal es requerida';
        if (!userDetails.DependencyId) newErrors.DependencyId = 'Dependencia secundaria es requerida';
        if (!userDetails.RLId) newErrors.RLId = 'Régimen laboral es requerido';
        if (!userDetails.PositionId) newErrors.PositionId = 'Posición es requerida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveUserDetails = async () => {
        if (!validateForm()) return;

        try {
            await updateUser(userId, userDetails);
            toast.success("Información actualizada exitosamente");
            setShowModal(false);
        } catch (error) {
            console.error('Error al actualizar la información del usuario:', error);
            toast.error("Error al actualizar la información");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const formattedNotification = {
                opened: true, openedAt: new Date()
            };
            await updateNotification(notificationId, formattedNotification);
            setNotifications(notifications.map(notification =>
                notification.id === notificationId ? { ...notification, opened: true, openedAt: new Date() } : notification
            ));
        } catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
        }
    };

    const handleMarkAsHidden = async (notificationId) => {
        try {
            const formattedNotification = {
                hidden: true
            };
            await updateNotification(notificationId, formattedNotification);
            setNotifications(notifications.map(notification =>
                notification.id === notificationId ? { ...notification, hidden: true } : notification
            ));
        } catch (error) {
            console.error('Error al marcar la notificación como oculta:', error);
        }
    };

    const handleNotificationClick = async (notificationId) => {
        try {
            const response = await getNotificationById(notificationId);
            setSelectedNotification(response.data);
            setShowNotificationModal(true);
            await handleMarkAsRead(notificationId);
        } catch (error) {
            console.error('Error al obtener la notificación:', error);
        }
    };

    const unreadNotifications = notifications.filter(notification => !notification.opened && !notification.hidden);
    const visibleNotifications = notifications.filter(notification => !notification.hidden);

    return (
        <Navbar className='fixed-top' variant="dark" expand="lg">
            <Container fluid className='px-5 mx-5 py-2'>
                <Navbar.Brand href="/menu">
                    <img
                        src={Logo}
                        style={{ width: "140.5px", height: "29.98px" }}
                        className="d-inline-block align-top img-fluid"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto my-2 my-lg-0 px-3" style={{ maxHeight: '100px' }}>
                        <Dropdown className='btn-menu-web mx-2'>
                            {role === 1 && (
                                <NavDropdown title={<i className="bi bi-grid-3x3-gap-fill"></i>}>
                                    <div className='menu2' style={{ width: '230px' }}>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/user-requests')}>
                                            <div className='ico-menu'>
                                                <i className="bi bi-send-fill"></i>
                                            </div>
                                            Solicitudes
                                        </Dropdown.Item>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/favorites')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-star-fill`} style={{ color: '#F6D751' }}></i>
                                            </div>
                                            Favoritos
                                        </Dropdown.Item>
                                    </div>
                                </NavDropdown>
                            )}
                            {role === 2 && (
                                <NavDropdown title={<i className="bi bi-grid-3x3-gap-fill"></i>}>
                                    <div className='menu2' style={{ width: '268px' }}>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/admin/users')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-people-fill`}></i>
                                            </div>
                                            Usuarios
                                        </Dropdown.Item>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/admin/access-requests')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-send-fill`}></i>
                                            </div>
                                            Solicitudes
                                        </Dropdown.Item>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/favorites')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-star-fill`} style={{ color: '#F6D751' }}></i>
                                            </div>
                                            Favoritos
                                        </Dropdown.Item>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/admin/groups-modules')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-collection-fill`}></i>
                                            </div>
                                            Grupos y<br />módulos
                                        </Dropdown.Item>
                                        <Dropdown.Item className='btn-menu' onClick={() => navigate('/admin/reports')}>
                                            <div className='ico-menu'>
                                                <i className={`bi bi-clipboard2-data`}></i>
                                            </div>
                                            Reportes
                                        </Dropdown.Item>
                                    </div>
                                </NavDropdown>
                            )}
                        </Dropdown>
                        <Dropdown className='mx-2'>
                            <Dropdown.Toggle as="a" className="nav-link" id="notification-dropdown" onClick={() => setShowOffCanvas(true)}>
                                <i className="bi bi-bell-fill"></i>
                                {unreadNotifications.length > 0 && (
                                    <Badge bg="danger" className="notification-badge">
                                        {unreadNotifications.length}
                                    </Badge>
                                )}
                            </Dropdown.Toggle>
                        </Dropdown>
                        <NavDropdown title={<span><i className="bi bi-person-fill"></i> {usuario}</span>} className='btn-menu-web mx-2'>
                            <NavDropdown.Item onClick={() => setShowModal(true)}>Actualizar información</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleLogout()}>Cerrar sesión</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>

            {/*****************MODAL ACTUALIZAR INFORMACION PERSONAL ****************/}
            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered keyboard={true}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>Actualizar Información Personal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="rl">
                            <Form.Label>Régimen Laboral</Form.Label>
                            <Form.Control
                                as="select"
                                name="RLId"
                                value={userDetails.RLId || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.RLId}
                            >
                                <option value="">Seleccione un régimen</option>
                                {RLs.map((rl) => (
                                    <option key={rl.id} value={rl.id}>{rl.name}</option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.RLId}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="position">
                            <Form.Label>Posición</Form.Label>
                            <Form.Select
                                as="select"
                                name="PositionId"
                                value={userDetails.PositionId || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.PositionId}
                                disabled={userDetails.RLId == '4'}
                            >
                                <option value="">Seleccione una posición</option>
                                {positions.map((position) => (
                                    <option key={position.id} value={position.id}>{position.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.PositionId}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="mainDependency">
                            <Form.Label>Dependencia principal</Form.Label>
                            <Form.Select
                                as="select"
                                name="MainDependencyId"
                                value={selectedMainDependency || ''}
                                onChange={handleMainDependencyChange}
                                isInvalid={!!errors.MainDependencyId}
                            >
                                <option value="">Seleccione una opción</option>
                                {mainDependencies.map((mainDep) => (
                                    <option key={mainDep.id} value={mainDep.id}>{mainDep.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.MainDependencyId}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="dependency">
                            <Form.Label>Dependencia secundaria</Form.Label>
                            <Form.Select
                                as="select"
                                name="DependencyId"
                                value={userDetails.DependencyId || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.DependencyId}
                                disabled={!selectedMainDependency}
                            >
                                <option value="">Seleccione una opción</option>
                                {dependencies
                                    .filter(dep => dep.MainDependencyId == selectedMainDependency)
                                    .map((dep) => (
                                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                                    ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.DependencyId}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveUserDetails}>Guardar cambios</Button>
                </Modal.Footer>
            </Modal>

            {/*****************OFFCANVAS DE NOTIFICACIONES ****************/}
            <Offcanvas show={showOffCanvas} onHide={() => setShowOffCanvas(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Notificaciones</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {visibleNotifications.length === 0 ? (
                        <p>No hay notificaciones</p>
                    ) : (
                        visibleNotifications.map(notification => (
                            <div key={notification.id} className={`notification-item ${notification.opened ? '' : 'bold'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span onClick={() => handleNotificationClick(notification.id)}>
                                        {notification.name}
                                    </span>
                                    <Button variant="link" onClick={() => handleMarkAsHidden(notification.id)}>
                                        <i className="bi bi-x"></i>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/*****************MODAL DE NOTIFICACIÓN ****************/}
            {selectedNotification && (
                <Modal size="lg" show={showNotificationModal} onHide={() => setShowNotificationModal(false)} centered keyboard={true}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{selectedNotification.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='text-center'>
                            <p>{selectedNotification.shortDescription}</p>
                            {selectedNotification.link && (
                                <div>
                                    <a onClick={() => navigate(selectedNotification.link)} href='' rel="noopener noreferrer">
                                        Ver aquí
                                    </a>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Navbar>
    );
}
