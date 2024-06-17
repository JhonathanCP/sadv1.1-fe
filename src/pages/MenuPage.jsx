import React, { useEffect, useState } from 'react';
import { getUserModules, getUser, updateUser } from '../api/user.api';
import { getDependencies } from '../api/dependency.api';
import { getMainDependencies } from '../api/maindependency.api';
import { getRLs } from '../api/rl.api';
import { getPositions } from '../api/position.api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Img from '../assets/img-portada.svg';
import 'aos/dist/aos.css';
import '../assets/main.css';
import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';

export function MenuPage() {
    const [modules, setModules] = useState([]);
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [mainDependencies, setMainDependencies] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [RLs, setRLs] = useState([]);
    const [positions, setPositions] = useState([]);
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

            fetchRLs();
            fetchPositions();

            const fetchModules = async () => {
                try {
                    const response = await getUserModules(decodedToken.id);
                    const activeModules = response.data.modules.filter(module =>
                        module.Reports.some(report => report.active)
                    );
                    setModules(activeModules);
                } catch (error) {
                    console.error('Error al obtener los módulos:', error);
                }
            };

            fetchModules();
        }
    }, []);

    const fetchUserDetails = async (id) => {
        try {
            const response = await getUser(id);
            const userData = response.data;

            if (!userData.DependencyId || !userData.RLId || !userData.PositionId) {
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

        if (name == "RLId" && value == '4') {
            // Establece los valores predeterminados para el régimen laboral '4'
            setUserDetails({
                ...userDetails,
                RLId: '4', // Suponiendo que el ID '4' es correcto
                PositionId: '4', // Suponiendo que el ID '4' es correcto
                isGeneric: true
            });
        } else if (name == "RLId" && userDetails.isGeneric) {
            // Restablece si se cambia de '4' a otro valor y estaba previamente en genérico
            setUserDetails({
                ...userDetails,
                RLId: value,
                PositionId: userDetails.PositionId,
                isGeneric: false
            });
        } else {
            // Actualiza normalmente si no es el campo especial
            setUserDetails({ ...userDetails, [name]: value });
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
        <div className='p-0' style={{backgroundColor: "#FBFCFE", height: "100%" }}>
            <NavBar></NavBar>
            <Container fluid fixed="true" style={{minHeight: '35vh' }} className='mt-5 banner-container'>
                <Row className='px-5 py-5 d-flex banner'>
                    <Col xs={12} md={12} xl={7} className='px-4 text-white ' data-aos="fade-in" data-aos-delay="250">
                        <h2 className='d-xl-none text-center'>Sistema de Analítica <span>de Datos</span></h2>
                        <h2 className='d-none d-xl-block'>Sistema de Analítica <span>de Datos</span></h2>
                        <p className='d-none d-md-block d-xl-none text-center'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                        <p className='d-none d-xl-block'>Sistema institucional de ESSALUD que pone a disposición los tableros de mando y control desarrollados con business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.</p>
                    </Col>
                    <Col xs={12} md={12} xl={5} className='px-5 py-0 d-flex align-items-center justify-content-center'>
                        <img src={Img} className="img-fluid img-banner" alt="" data-aos="zoom-out" data-aos-delay="250" />
                    </Col>
                </Row>
            </Container>
            <Container fluid className='px-0 mx-0 pb-4 pt-0 mt-0 sections-bg'>

                <section id="services" className='services'>
                    <div className="container-fluid" data-aos="fade-up">
                        <div className="row align-items-center justify-content-center px-4" data-aos="fade-up" data-aos-delay="100">
                            {modules.sort((a, b) => a.id - b.id).map((module) => (
                                <div
                                    key={module.id}
                                    className="col-lg-3 col-md-6 align-items-center justify-content-center mt-4"
                                    onClick={() => navigate(`/module/${module.id}`)}
                                >
                                    <div className="service-item position-relative align-items-center justify-content-center">
                                        <div className="icon">
                                            <i className={`bi bi-${module.icon}`}></i>
                                        </div>
                                        <h3>{module.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </Container>
            <footer className="fixed-bottom text-white px-0 m-0 footer" style={{minHeight: '2vh' }}>
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

            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton={false}>
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
                                disabled={userDetails.isGeneric}
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
        </div>
    );
}
