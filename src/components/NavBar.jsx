import React, { useEffect, useState } from 'react';
import { Link, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Modal } from 'react-bootstrap';
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
    const [showModal, setShowModal] = useState(false);

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
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const searchUrl = `/reports?key=${encodeURIComponent(searchQuery.trim())}`;
            //navigate(searchUrl);
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
        <Navbar expand="lg" style={{ backgroundColor: "#0064AF", boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)', minHeight: '5vh' }} className='px-1 py-1 fixed-top' variant="dark">
            <Container fluid className='px-4 mx-5'>
                <Navbar.Brand href="#home">
                    <img
                        src={Logo}
                        style={{ width: "140.5px", height: "29.98px" }}
                        className="d-inline-block align-top img-fluid"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="ms-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
                        <Nav.Link hidden={window.location.pathname === '/menu'} onClick={() => navigate('/menu')}>
                            <i className={`bi bi-house`}></i> Volver al menú principal
                        </Nav.Link>
                        {role === 1 && (
                            <>
                                <Nav.Link onClick={() => setShowModal(true)} ><i className={`bi bi-send`}></i> Solicitud de acceso</Nav.Link>
                            </>
                        )}
                        {role === 2 && (
                            <>
                                <Nav.Link onClick={() => navigate('/admin/users')} ><i className={`bi bi-people`}></i> Administración de usuarios</Nav.Link>
                                <Nav.Link onClick={() => navigate('/admin/groups-modules')} ><i className={`bi bi-collection`}></i> Administración de grupos y módulos</Nav.Link>
                                <Nav.Link onClick={() => navigate('/admin/reports')} ><i className={`bi bi-gear`}></i> Administración de reportes</Nav.Link>
                            </>
                        )}
                        <NavDropdown title={<span><i className="bi bi-person"></i> {usuario}</span>} id="navbarScrollingDropdown">
                            <NavDropdown.Item onClick={() => handleLogout()}>Cerrar sesión</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                        <FormControl
                            type="search"
                            placeholder="Buscar reporte"
                            className="me-2"
                            aria-label="Buscar reporte"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <Button variant="outline-dark" onClick={handleSearch}>Buscar</Button>
                    </Form>
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
        </Navbar>
    );
}
