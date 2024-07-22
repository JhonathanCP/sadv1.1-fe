import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/user.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Form, Button, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import AOS from 'aos';

export function UserListPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(11);

    useEffect(() => {

        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage);
            localStorage.removeItem('successMessage');
        }
        AOS.init();

        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > expirationTime) {
                toast('Sesión expirada', {
                    icon: '👏',
                });
                handleLogout();
            }
        }

        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
                setFilteredUsers(response.data); // Inicialmente, mostrar todos los usuarios
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, users]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const booleanToText = (value) => value ? "Sí" : "No";

    const activeStatusToText = (value) => value ? "Activo" : "Inactivo";

    const RoleToText = (value) => value == 1 ? "Usuario" : "Administrador";

    // Get current users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='mt-0 p-5 mb-0'>
                <Col className="d-flex align-items-end" style={{ minHeight: '8vh' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Usuarios</li> {/* Colocar aqui el nombre de los módulos */}
                        </ol>
                    </nav>
                </Col>
                <Row className="my-3">
                    <Col md={10} >
                        <h2 className='custom-h2'>Usuarios
                            ({filteredUsers.length}) {/* Mostrar la cantidad de usuarios filtrados */}
                        </h2>
                    </Col>
                    <Col md={2} style={{ alignContent: 'center' }}>
                        <div className="search-bar d-flex" >
                            <Form.Control
                                type="search"
                                placeholder="Buscar usuario"
                                className="search-input"
                                aria-label="Buscar usuario"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <i className="bi bi-search search-icon"></i>
                        </div>
                    </Col>
                    {/**
                    <Col md={2} style={{alignContent:'center'}}>
                        <Link to={`/admin/editar/user`} className="btn btn-primary">
                            Crear Usuario
                        </Link>
                    </Col> */}

                </Row>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className='col-1 table-header'>Item</th>
                                    <th className='col-1 table-header'>Username</th>
                                    <th className='col-2 table-header'>Correo</th>
                                    {/* <th className='col-2 table-header'>DNI</th> */}
                                    <th className='col-1 table-header'>LDAP</th>
                                    <th className='col-1 table-header'>Estado</th>
                                    <th className='col-1 table-header'>Perfil</th>
                                    <th className='col-2 table-header'>Permisos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{indexOfFirstUser + index + 1}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        {/* <td>{user.dni}</td> */}
                                        <td>{booleanToText(user.ldap)}</td>
                                        <td>{activeStatusToText(user.active)}</td>
                                        <td>{RoleToText(user.RoleId)}</td>
                                        <td>
                                            <Link to={`/admin/user/${user.id}`} className="btn btn-link" style={{ textDecorationLine: 'none' }}>
                                                <i className="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
                                                Editar Permisos
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Row>
                    <Pagination style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Pagination.First onClick={() => paginate(1)} />
                        <Pagination.Prev onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)} />
                        {currentPage > 2 && (
                            <>
                                <Pagination.Item onClick={() => paginate(1)}>1</Pagination.Item>
                                {currentPage > 3 && <Pagination.Ellipsis />}
                            </>
                        )}
                        {Array.from({ length: totalPages }, (_, index) => {
                            const page = index + 1;
                            if (page === currentPage || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                return (
                                    <Pagination.Item key={page} active={page === currentPage} onClick={() => paginate(page)}>
                                        {page}
                                    </Pagination.Item>
                                );
                            }
                            return null;
                        })}
                        {currentPage < totalPages - 1 && (
                            <>
                                {currentPage < totalPages - 2 && <Pagination.Ellipsis />}
                                <Pagination.Item onClick={() => paginate(totalPages)}>{totalPages}</Pagination.Item>
                            </>
                        )}
                        <Pagination.Next onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)} />
                        <Pagination.Last onClick={() => paginate(totalPages)} />
                    </Pagination>
                </Row>


            </Container>
            <footer className="fixed-bottom text-white px-5 m-0 footer" style={{ minHeight: '2vh' }}>
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
        </div>
    );
}
