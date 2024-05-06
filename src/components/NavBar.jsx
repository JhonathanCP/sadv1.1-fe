import React, { useEffect, useState } from 'react';
import { Link, Route, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Row, Col, NavItem } from 'react-bootstrap';
import Logo from '../assets/logo-essalud-blanco.svg';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
export function NavBar() {
    const [usuario, setUsuario] = useState('');
    const [role, setRole] = useState('');
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {


        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsuario(decodedToken.username);
            setRole(decodedToken.role);
            setUserId(decodedToken.id);

            // Solo realizar la llamada a getUserGroups si userId está disponible

        }
    }, []);
    const handleLogout = () => {
        // Lógica para cerrar sesión, por ejemplo, eliminar el token y redirigir al inicio de sesión
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        // Redirige al inicio de sesión u otra página
        toast.success("Sesión terminada");
        navigate("/login");
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: "#0064AF", boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', minHeight: '5vh' }} className='px-1 py-1 fixed-top' variant="dark">
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
                    <Nav
                        className="ms-auto my-2 my-lg-0"
                        style={{ maxHeight: '100px' }}
                        navbarScroll
                    >
                        <Nav.Link onClick={() => navigate(-1)}>Regresar</Nav.Link>
                        <Nav.Link onClick={() => navigate('/menu')}>Volver al menú principal</Nav.Link>
                        {role === 2 && (
                            <Nav.Link >Opciones de Administrador</Nav.Link>
                        )}
                        <NavDropdown title={usuario} id="navbarScrollingDropdown">
                            <NavDropdown.Item onClick={() => handleLogout()}>Cerrar sesión</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Form className="d-flex">
                            <Form.Control
                                type="search"
                                placeholder="Buscar reporte"
                                className="me-2"
                                aria-label="Buscar reporte"
                            />
                            <Button variant="outline-dark">Buscar</Button>
                        </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>)
}

