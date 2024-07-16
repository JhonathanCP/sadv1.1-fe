import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Card, Col, Form, FormGroup, FormControl, FormLabel, Button, Container, Image, Modal, FormCheck } from 'react-bootstrap';
import FondoSvg from '../assets/fondo.svg';
import Logo from '../assets/logo-essalud.svg';
import { ManualComponent } from '../components/ManualComponent';
import ComunicadoImage from '../assets/COMUNICADO.jpeg';  // Asegúrate de que la ruta es correcta

export function LoginPage() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        systemcode: 'SAD'
    });
    const [error, setError] = useState(null);
    const [showManualModal, setShowManualModal] = useState(false);
    const handleManualModal = () => setShowManualModal(true); // Nuevo controlador
    const handleCloseManualModal = () => setShowManualModal(false); // Nuevo controlador
    const [showComunicadoModal, setShowComunicadoModal] = useState(false);  // Estado para controlar la visibilidad del modal
    const navigate = useNavigate();

    const handleCloseComunicado = () => {
        setShowComunicadoModal(false);  // Función para cerrar el modal
    };

    const handleOpenComunicado = () => {
        setShowComunicadoModal(true);  // Función para cerrar el modal
    };

    useEffect(() => {
        if (window.location.pathname === '/login') {
            // Agrega el script de reCAPTCHA solo si estás en la página inicial
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=6LfJ-TkpAAAAAGk-luwLSzw3ihrxMprK85ckCalL';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            return () => {
                // Cleanup: remove the script when the component unmounts
                document.head.removeChild(script);
            };
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Use the reCAPTCHA v3 API to verify the user
            const capResponse = await window.grecaptcha.execute('6LfJ-TkpAAAAAGk-luwLSzw3ihrxMprK85ckCalL', {
                action: 'login',
            });

            if (!capResponse) {
                toast.error('Validación reCAPTCHA fallida. Por favor, inténtalo de nuevo.');
                return;
            }

            const response = await login({ ...credentials, recaptchaToken: capResponse });
            const accessToken = response.data.token;
            const expirationTime = jwtDecode(accessToken).exp;
            localStorage.setItem('access', accessToken);
            localStorage.setItem('expirationTime', expirationTime);
            localStorage.setItem('successMessage', 'Sesión iniciada correctamente.');
            // Redirect to the new page
            window.location.replace('/menu');
        } catch (error) {
            setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            console.error('Credenciales incorrectas. Por favor, inténtalo de nuevo.', error);
            toast.error('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div
            style={{ backgroundImage: `url(${FondoSvg})`, minHeight: '100vh', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
            className="container-fluid d-flex align-items-center justify-content-center"
        >
            <Modal size='xl' show={showComunicadoModal} onHide={handleCloseComunicado} centered>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Image src={ComunicadoImage} alt="Comunicado" fluid />
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseComunicado}>
                        Cerrar
                    </Button>
                </Modal.Footer> */}
            </Modal>
            <div className='row'>
                <div className="container-fluid col-lg-7 col-md-6 col-xs-12 d-flex justify-content-center align-items-center p-5">
                    <div className="text-white">
                        <h1 className="d-block d-sm-none text-center">Sistema de Analítica de Datos</h1>
                        <h1 className="d-none d-md-block">Sistema de Analítica de Datos</h1>
                        <p className="d-none d-sm-block">
                            Sistema institucional de EsSalud que pone a disposición los tableros de mando y control desarrollados con
                            business intelligence y business analytics para la toma de decisiones en el marco del gobierno de datos.
                        </p>
                        {/* <div className="row">
                            <div className="container-fluid col-lg-12 col-md-12 col-sm-12 d-flex justify-content-md-start justify-content-center">
                                <button type="button" className="btn btn-primary text-light mt-3 px-3 fw-medium" onClick={handleManualModal}>
                                    Ver Manual de Usuario
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className="container-fluid col-lg-5 col-md-6 col-xs-12 d-flex flex-column align-items-center">
                    <div className="card px-4 pt-4" style={{ width: '22.5rem' }}>
                        <form onSubmit={handleLogin} className="mt-2">
                            <div className="text-center my-2">
                                <img src={Logo} alt="Logo" />
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="username">Usuario</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" id="username" name="username" value={credentials.username} onChange={handleChange}></input>
                                    <span className="input-group-text" id="basic-addon2">@essalud.gob.pe</span>
                                </div>
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" className="form-control" id="password" name="password" value={credentials.password} onChange={handleChange} />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-3">Ingresar</button>
                            <p className='text-center fst-italic'><a class="link-offset-2 link-underline link-underline-opacity-0" href="#" onClick={handleOpenComunicado}><i className='bi bi-info-circle'></i>Instrucciones de ingreso</a></p>
                        </form>
                    </div>
                </div>
            </div>
            <footer className="fixed-bottom text-white px-5 m-0">
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC - EsSalud</div>
                        <div className="col-6 text-center">Versión: 1.1.0.20240527</div>
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