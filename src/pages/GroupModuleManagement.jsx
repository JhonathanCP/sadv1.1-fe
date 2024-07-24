import React, { useEffect, useState } from 'react';
import { getModules, createModule, updateModule } from '../api/module.api';
import { getGroups, createGroup, updateGroup } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Button, Table, Modal, Form, Spinner, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function GroupModuleManagement() {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupFormData, setGroupFormData] = useState({ name: '', description: '', icon: '' });
    const [moduleFormData, setModuleFormData] = useState({ name: '', description: '', icon: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const modulesResponse = await getModules();
                const groupsResponse = await getGroups();
                setModules(modulesResponse.data);
                setGroups(groupsResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleShowGroupModal = (group = null) => {
        setSelectedGroup(group);
        setGroupFormData({
            name: group ? group.name : '',
            description: group ? group.description : '',
            icon: group ? group.icon : ''
        });
        setShowGroupModal(true);
    };

    const handleShowModuleModal = (module = null) => {
        setSelectedModule(module);
        setModuleFormData({
            name: module ? module.name : '',
            description: module ? module.description : '',
            icon: module ? module.icon : ''
        });
        setShowModuleModal(true);
    };

    const handleCloseGroupModal = () => setShowGroupModal(false);
    const handleCloseModuleModal = () => setShowModuleModal(false);

    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        setGroupFormData({ ...groupFormData, [name]: value });
    };

    const handleModuleChange = (e) => {
        const { name, value } = e.target;
        setModuleFormData({ ...moduleFormData, [name]: value });
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedGroup) {
                await updateGroup(selectedGroup.id, groupFormData);
                toast.success('Grupo actualizado con éxito');
            } else {
                await createGroup(groupFormData);
                toast.success('Grupo creado con éxito');
            }
            const groupsResponse = await getGroups();
            setGroups(groupsResponse.data);
            handleCloseGroupModal();
        } catch (error) {
            toast.error('Error al procesar la solicitud');
        }
    };

    const handleModuleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedModule) {
                await updateModule(selectedModule.id, moduleFormData);
                toast.success('Módulo actualizado con éxito');
            } else {
                await createModule(moduleFormData);
                toast.success('Módulo creado con éxito');
            }
            const modulesResponse = await getModules();
            setModules(modulesResponse.data);
            handleCloseModuleModal();
        } catch (error) {
            toast.error('Error al procesar la solicitud');
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredModules = modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='p-0'>
            <NavBar />
            <Container fluid className='mt-5 mb-1 p-5'>
                <Row>
                    <Col>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                    <a href="#">
                                        <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                        </i>Menú Principal</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">Grupos y módulos</li>
                            </ol>
                        </nav>
                    </Col>
                </Row>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <>
                        <Row className='my-3'>
                            <Col md={10}>
                                <h2 className='custom-h2'>Grupos</h2>
                            </Col>
                            <Col md={2} style={{ alignContent: 'center' }}>
                                <Button variant="primary" onClick={() => handleShowGroupModal(null)} className="ms-2">
                                    Crear Grupo
                                </Button>
                            </Col>
                        </Row>
                        <Table responsive className='mt-3'>
                            <tbody>
                                {filteredGroups.map((group) => (
                                    <tr key={group.id}>
                                        <td><i className={`bi bi-${group.icon}`}></i> {group.name}</td>
                                        <td>{group.description}</td>
                                        <td>
                                            <Button variant="link" onClick={() => handleShowGroupModal(group)} style={{ textDecorationLine: 'none' }}>
                                                <i className="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Row>
                            <Col md={10} className='my-3'>
                                <h2 className='custom-h2'>Módulos</h2>
                            </Col>
                            <Col md={2} style={{ alignContent: 'center' }}>
                                <Button variant="primary" onClick={() => handleShowModuleModal(null)}>
                                    Crear Módulo
                                </Button>
                            </Col>
                        </Row>
                        <Table responsive className='mt-3'>
                            <tbody>
                                {filteredModules.map((module) => (
                                    <tr key={module.id}>
                                        <td><i className={`bi bi-${module.icon}`}></i> {module.name}</td>
                                        <td>{module.description}</td>
                                        <td>
                                            <Button variant="link" onClick={() => handleShowModuleModal(module)} style={{ textDecorationLine: 'none' }}>
                                                <i className="bi bi-pencil-fill" style={{ paddingRight: '10px' }}></i>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Container>

            <Modal show={showGroupModal} onHide={handleCloseGroupModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedGroup ? 'Editar Grupo' : 'Crear Grupo'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleGroupSubmit}>
                        <Form.Group controlId="formGroupName">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={groupFormData.name}
                                onChange={handleGroupChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formGroupDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={groupFormData.description}
                                onChange={handleGroupChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formGroupIcon">
                            <Form.Label><i thumbnail className={`bi bi-${groupFormData.icon}`} style={{ fontSize: '3rem', color: 'cornflowerblue'}}/>Icono: (Solo nombre) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                            <Form.Control
                                type="text"
                                name="icon"
                                value={groupFormData.icon}
                                onChange={handleGroupChange}
                                required
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="outline-primary" onClick={handleCloseGroupModal}>Cancelar</Button>
                            <Button variant="primary" type="submit">{selectedGroup ? 'Guardar' : 'Crear'}</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showModuleModal} onHide={handleCloseModuleModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedModule ? 'Editar Módulo' : 'Crear Módulo'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleModuleSubmit}>
                        <Form.Group controlId="formModuleName">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={moduleFormData.name}
                                onChange={handleModuleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formModuleDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={moduleFormData.description}
                                onChange={handleModuleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formModuleIcon">                            
                            <Form.Label><i thumbnail className={`bi bi-${moduleFormData.icon}`} style={{ fontSize: '3rem', color: 'cornflowerblue'}}/> Icono: (Solo nombre) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                            <Form.Control
                                type="text"
                                name="icon"
                                value={moduleFormData.icon}
                                onChange={handleModuleChange}
                                required
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="outline-primary" onClick={handleCloseModuleModal}>Cancelar</Button>
                            <Button variant="primary" type="submit">{selectedModule ? 'Guardar' : 'Crear'}</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

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
