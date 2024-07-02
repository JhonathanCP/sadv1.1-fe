import React, { useEffect, useState } from 'react';
import { Link, Route, useNavigate, useLocation } from 'react-router-dom';
import { getUser, updateUser } from '../api/user.api';
import { getDependencies, getDependency } from '../api/dependency.api';
import { getMainDependencies } from '../api/maindependency.api';
import { getRLs } from '../api/rl.api';
import { getPositions } from '../api/position.api';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Modal, InputGroup } from 'react-bootstrap';
import Logo from '../assets/logo-essalud-blanco.svg';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

export function NavBar() {
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false)
    const [showModal2, setShowModal2] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [mainDependencies, setMainDependencies] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [RLs, setRLs] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedMainDependency, setSelectedMainDependency] = useState(null);
    const [errors, setErrors] = useState({});
    const [originalUserData, setOriginalUserData] = useState({});

    const handleDownload = () => {
        window.open('https://docs.google.com/spreadsheets/d/1Qa8foxxOi5xDO3JpZyOd1IPRTwrDVUGy/export?format=xlsx', '_blank');
    };

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
            console.error('Error al obtener los posiciones:', error);
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
            setShowModal2(false);
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
        <Navbar expand="lg" style={{ backgroundColor: "#1A3EC1", boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)', minHeight: '5vh' }} className='px-1 py-1 fixed-top' variant="dark">
            <Container fluid className='px-4 mx-5'>
                <Navbar.Brand href="/menu">
                    <img
                        src={Logo}
                        style={{ width: "140.5px", height: "29.98px" }}
                        className="d-inline-block align-top img-fluid"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav  className="ms-auto my-2 my-lg-0" style={{ maxHeight: '100px' }}  navbarScroll>
                        {/*<Nav.Link hidden={window.location.pathname === '/menu'} onClick={() => navigate('/menu')}>
                            <i className={`bi bi-house`}></i> Volver al menú principal
                        </Nav.Link> */}          
                        
                        <NavDropdown  title={<span> <i  className="bi bi-grid-3x3-gap-fill" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Más opciones">
                            </i> </span>}  >
                            {role === 1 && (
                                <>
                                <NavDropdown.Item className="dropdown-item-menu" onClick={() => setShowModal(true)} >
                                    <i className={`bi bi-send-fill`} style={{color:'#0B38AB', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i>Solicitudes</NavDropdown.Item>
                                <NavDropdown.Item className="dropdown-item-menu">
                                    <i className={`bi bi-star-fill`} style={{color:'#F6D751', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i>Destacados</NavDropdown.Item>
                                </>
                            )}
                            {role === 2 && (
                            <>
                                <NavDropdown.Item className="dropdown-item-menu" onClick={() => setShowModal(true)} >
                                    <i className={`bi bi-send-fill`} style={{color:'#0B38AB', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i>Solicitudes</NavDropdown.Item>
                                <NavDropdown.Item className="dropdown-item-menu">
                                    <i className={`bi bi-star-fill`} style={{color:'#F6D751', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i>Destacados</NavDropdown.Item>
                                <NavDropdown.Item className="dropdown-item-menu" onClick={() => navigate('/admin/users')} >
                                    <i className={`bi bi-people-fill`} style={{color:'#0B38AB', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i> Usuarios</NavDropdown.Item>
                                <NavDropdown.Item className="dropdown-item-menu" onClick={() => navigate('/admin/groups-modules')} >
                                    <i className={`bi bi-collection-fill`} style={{color:'#0B38AB', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i> Grupos y módulos</NavDropdown.Item>
                                <NavDropdown.Item className="dropdown-item-menu" onClick={() => navigate('/admin/reports')} >
                                    <i className={`bi bi-clipboard2-data`} style={{color:'#0B38AB', backgroundColor:'#EEF3FF', borderRadius:"80px", height:'30px', width:'30px',display:'flex', justifyContent:'center', alignItems:'center'}}></i>Reportes</NavDropdown.Item>
                            </>
                            )}
                        </NavDropdown>

                        <button type="button" className='btn btn-primary btn-primary-custom position-relative bi bi-bell-fill'>
                            <span class="position-absolute top-0 start-100 translate-middle p-2 bg-danger rounded-circle">
                            <span class="visually-hidden">New alerts</span>
                            </span>
                        </button>

                        <NavDropdown title={<span><i className="bi bi-person"></i> {usuario}</span>} id="navbarScrollingDropdown">
                            <NavDropdown.Item onClick={() => setShowModal2(true)}>Actualizar información</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleLogout()}>Cerrar sesión</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>

                </Navbar.Collapse>
            </Container>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Descargar Solicitud de Acceso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Button variant="primary" onClick={handleDownload}>Descargar Archivo</Button>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>


            <Modal size="lg" show={showModal2} onHide={() => setShowModal2(false)} centered  keyboard={true}>
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
                            <Form.Control
                                as="select"
                                name="PositionId"
                                value={userDetails.PositionId || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.PositionId}
                                disabled={userDetails.RLId=='4'}
                            >
                                <option value="">Seleccione una posición</option>
                                {positions.map((position) => (
                                    <option key={position.id} value={position.id}>{position.name}</option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.PositionId}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="mainDependency">
                            <Form.Label>Dependencia principal</Form.Label>
                            <Form.Control
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
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.MainDependencyId}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="dependency">
                            <Form.Label>Dependencia secundaria</Form.Label>
                            <Form.Control
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
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.DependencyId}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSaveUserDetails}>Guardar cambios</Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
}
