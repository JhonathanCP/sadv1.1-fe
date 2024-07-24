import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Image, Modal, Button } from 'react-bootstrap';
import FondoSvg from '../assets/fondo.svg';
import Logo from '../assets/logo-essalud.svg';
import ComunicadoImage from '../assets/COMUNICADO.jpeg';  // Asegúrate de que la ruta es correcta
import NewsImage from '../assets/COMUNICADO.png';  // Asegúrate de que la ruta es correcta

export function LoginPage() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        systemcode: 'SAD'
    });
    const [error, setError] = useState(null);
    const [showNewsModal, setShowNewsModal] = useState(true);  // Estado para controlar la visibilidad del modal de noticias
    const [showComunicadoModal, setShowComunicadoModal] = useState(false);  // Estado para controlar la visibilidad del modal de comunicado
    const navigate = useNavigate();

    const handleCloseNews = () => {
        setShowNewsModal(false);  // Función para cerrar el modal de noticias
    };

    const handleCloseComunicado = () => {
        setShowComunicadoModal(false);  // Función para cerrar el modal de comunicado
    };

    const handleOpenComunicado = () => {
        setShowComunicadoModal(true);  // Función para abrir el modal de comunicado
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
            <Modal size='xl' show={showNewsModal} onHide={handleCloseNews} centered>
                <Modal.Body className="p-0">
                    <Button onClick={handleCloseNews} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }} className="btn btn-light">
                    <i class="bi bi-x-lg"></i>
                    </Button>
                    <Image src={NewsImage} alt="Noticias" fluid style={{ width: '100%', height: '100%' }} />
                </Modal.Body>
            </Modal>
            <Modal size='xl' show={showComunicadoModal} onHide={handleCloseComunicado} centered>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Image src={ComunicadoImage} alt="Comunicado" fluid />
                </Modal.Body>
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
                            <p className='text-center fst-italic'><a className="link-offset-2 link-underline link-underline-opacity-0" href="#" onClick={handleOpenComunicado}><i className='bi bi-info-circle'></i> Instrucciones de ingreso</a></p>
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
