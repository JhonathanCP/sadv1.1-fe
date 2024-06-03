import React, { useEffect, useState } from 'react';
import { getUserGroups, getUser, updateUser } from '../api/user.api';
import { getDependencies } from '../api/dependency.api';
import { getMainDependencies } from '../api/maindependency.api';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Img from '../assets/hero-img.svg';
import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';

export function MenuPage() {
    const [grupos, setGrupos] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [mainDependencies, setMainDependencies] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [selectedMainDependency, setSelectedMainDependency] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage);
            localStorage.removeItem('successMessage');
        }
        AOS.init();
        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', { icon: '👏' });
                handleLogout();
            }
        }

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);

            fetchUserDetails(decodedToken.id);

            const fetchInfo = async () => {
                try {
                    const response = await getUserGroups(decodedToken.id);
                    const filteredGroups = response.data.groups.filter(group =>
                        group.Modules && group.Modules.some(module =>
                            module.Reports && module.Reports.some(report => report.active)
                        )
                    );
                    setGrupos(filteredGroups);
                } catch (error) {
                    console.error('Error al obtener la información:', error);
                }
            };

            fetchInfo();
        }
    }, []);

    const fetchUserDetails = async (id) => {
        try {
            const response = await getUser(id);
            const userData = response.data;
            setUserDetails(userData);

            if (!userData.firstname || !userData.lastname || !userData.dni || !userData.cargo || !userData.DependencyId) {
                fetchMainDependencies();
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error al obtener los detalles del usuario:', error);
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
        setUserDetails({ ...userDetails, MainDependencyId: mainDependencyId, DependencyId: '' });
        fetchDependencies(mainDependencyId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({ ...userDetails, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!userDetails.firstname) newErrors.firstname = 'Apellidos es requerido';
        if (!userDetails.lastname) newErrors.lastname = 'Nombre es requerido';
        if (!userDetails.dni) newErrors.dni = 'DNI es requerido';
        if (!userDetails.cargo) newErrors.cargo = 'Cargo es requerido';
        if (!userDetails.MainDependencyId) newErrors.MainDependencyId = 'Dependencia principal es requerida';
        if (!userDetails.DependencyId) newErrors.DependencyId = 'Dependencia secundaria es requerida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveUserDetails = async () => {
        if (!validateForm()) {
            return;
        }

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

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar></NavBar>
            <Container fluid fixed="true" style={{ backgroundColor: '#0064AF', minHeight: '35vh' }} className='mt-5'>
                <Row className='px-5 py-5 d-flex align-items-center justify-content-center'>
                    <Col xs={12} md={12} xl={7} className='px-4 text-white ' data-aos="fade-in" data-aos-delay="250">
                        <h2 className='d-xl-none text-center'>Sistema de Analítica <span>de Datos</span></h2>
                        <h2 className='d-none d-xl-block'>Sistema de Analítica <span>de Datos</span></h2>
                        <p className='d-none d-md-block d-xl-none text-center'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                        <p className='d-none d-xl-block'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                    </Col>
                    <Col xs={12} md={12} xl={5} className='px-5 py-0 d-flex align-items-center justify-content-center'>
                        <img src={Img} className="img-fluid" alt="" data-aos="zoom-out" data-aos-delay="250" />
                    </Col>
                </Row>
            </Container>
            <Container fluid className='px-0 mx-0 pb-5 sections-bg'>
                <section id="services" className='services w-100'>
                    <div className="container w-100" data-aos="fade-up">
                        <div className="row gy-4 align-items-center justify-content-center" data-aos="fade-up" data-aos-delay="100">
                            {grupos.map((grupo) => (
                                <div
                                    key={grupo.id}
                                    className="col-lg-4 col-md-6 align-items-center justify-content-center"
                                    onClick={() => navigate(`/group/${grupo.id}`)}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={grupo.description}
                                >
                                    <div className="service-item position-relative align-items-center justify-content-center">
                                        <div className="icon">
                                            <i className={`bi bi-${grupo.icon}`}></i>
                                        </div>
                                        <h3>{grupo.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
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

            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton={false}>
                    <Modal.Title>Actualizar Información Personal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="firstname">
                            <Form.Label>Apellidos</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstname"
                                value={userDetails.firstname || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.firstname}
                            />
                            <Form.Control.Feedback type="invalid">{errors.firstname}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="lastname">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastname"
                                value={userDetails.lastname || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.lastname}
                            />
                            <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="dni">
                            <Form.Label>DNI</Form.Label>
                            <Form.Control
                                type="text"
                                name="dni"
                                value={userDetails.dni || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.dni}
                            />
                            <Form.Control.Feedback type="invalid">{errors.dni}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="cargo">
                            <Form.Label>Cargo</Form.Label>
                            <Form.Control
                                type="text"
                                name="cargo"
                                value={userDetails.cargo || ''}
                                onChange={handleInputChange}
                                isInvalid={!!errors.cargo}
                            />
                            <Form.Control.Feedback type="invalid">{errors.cargo}</Form.Control.Feedback>
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
                    <Button variant="secondary" onClick={handleLogout}>Cerrar</Button>
                    <Button variant="primary" onClick={handleSaveUserDetails}>Guardar cambios</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
