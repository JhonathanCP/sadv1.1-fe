import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Card, Col, Form, FormGroup, FormControl, FormLabel, Button, Container, Image, Modal, FormCheck } from 'react-bootstrap';
import FondoSvg from '../assets/fondo.svg';
import background from '../assets/FondoExplora.png';
import Logo from '../assets/logo-essalud.svg';
import LogoExplota from '../assets/Logotipo001.svg';
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
    const [showComunicadoModal, setShowComunicadoModal] = useState(true);  // Estado para controlar la visibilidad del modal
    const [showPassword, setShowPassword] = useState(false);  // Estado para manejar la visibilidad de la contraseña
    const navigate = useNavigate();

    const handleCloseComunicado = () => {
        setShowComunicadoModal(false);  // Función para cerrar el modal
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

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div
            //style={{ backgroundImage: `url(${FondoSvg})`, minHeight: '100vh', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
            style={{ backgroundImage: `url(${background})`, minHeight: '100vh', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
            className="d-flex text-login "
        >
            {/* <Modal size='xl' show={showComunicadoModal} onHide={handleCloseComunicado} centered>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Image src={ComunicadoImage} alt="Comunicado" fluid />
                </Modal.Body>
            </Modal> */}
            <div className='container fluid container-background-login '>
                
                    <div className="container fluid text-login">
                        {/* <img src={Logo} alt="Logo"  style={{paddingBottom:'20px'}} className='logo-essalud pb-4'/> */}
                        <h2 className="d-block d-sm-none text-center" style={{fontWeight:'bold'}}><img src={LogoExplota}></img><br/>Visualización y Análisis de Datos</h2>
                        <h2 className="d-none d-md-block" style={{fontWeight:'bold',}}><img src={LogoExplota}></img><br/>Visualización y Análisis de Datos</h2>
                        <h5 className="d-none d-sm-block" style={{paddingTop:'25px'}}>
                        Sistema que ofrece reportes dinámicos y tableros de mando utilizando Business Intelligence (BI). Presenta información visual de distintas áreas internas, facilitando el análisis de datos para las decisiones en beneficio de la organización y los asegurados.
                        </h5>
                        <h5 className='pt-3 d-xl-none text-center' style={{ fontWeight: 'bold', }}>Plataforma Nacional de Datos Abiertos - PCM</h5>
                        <h5 className='pt-3 d-none d-xl-block' style={{ fontWeight: 'bold', }}>Plataforma Nacional de Datos Abiertos - PCM</h5>
                        <div className='d-flex justify-content-center d-xl-none'>
                            <Button href='https://www.datosabiertos.gob.pe/group/seguro-social-de-salud-essalud' target="_blank" variant="light">Explora datos abiertos de Essalud <i className="bi bi-box-arrow-up-right"></i></Button>
                        </div>
                        <div className='d-none d-xl-block'>
                            <Button href='https://www.datosabiertos.gob.pe/group/seguro-social-de-salud-essalud' target="_blank" variant="light">Explora datos abiertos de Essalud <i className="bi bi-box-arrow-up-right"></i></Button>
                        </div>
                        {/* <div className="row">
                            <div className="container-fluid col-lg-12 col-md-12 col-sm-12 d-flex justify-content-md-start justify-content-center">
                                <button type="button" className="btn btn-primary text-light mt-3 px-3 fw-medium" onClick={handleManualModal}>
                                    Ver Manual de Usuario
                                </button>
                            </div>
                        </div> */}
                    </div>
                
                <div className="container-fluid col-lg-5 col-md-6 col-xs-12 form-login">
                    <div className="card p-4" style={{ width: '22.5rem' }}>
                        <form onSubmit={handleLogin} className="my-2">
                            <div className="text-center my-1">
                            <img src={Logo} alt="Logo"  style={{paddingBottom:'20px'}} className='logo-essalud'/>

                            </div>
                            <div className="form-group my-3">
                                <label htmlFor="username">Usuario</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" id="username" name="username" value={credentials.username} onChange={handleChange}></input>
                                    <span className="input-group-text" id="basic-addon2">@essalud.gob.pe</span>
                                </div>
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="password">Contraseña</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                    />
                                    <span className="input-group-text" id="basic-addon2" onClick={toggleShowPassword}>
                                        <i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}></i>
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-primary-custom w-100 mt-3">Ingresar</button>
                            <ManualComponent show={showManualModal} handleClose={handleCloseManualModal} />
                        </form>
                    </div>
                </div>
            </div>
            <footer className="fixed-bottom text-white px-5 m-0">
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC - EsSalud</div>
                        <div className="col-6 text-center">Versión: 2.0.20240617</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-center">Versión: 2.0.20240617</div>
                    </div>
                </div>
            </footer>



        </div>
    );
}
