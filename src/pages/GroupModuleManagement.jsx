import React, { useEffect, useState } from 'react';
import { getModules, createModule, updateModule } from '../api/module.api';
import { getGroups, createGroup, updateGroup } from '../api/group.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Button, Table, Modal, Form, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function GroupModuleManagement() {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '' });
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

    const handleShowModal = (type, item = null, isGroup = false) => {
        setSelectedModule(isGroup ? null : item);
        setSelectedGroup(isGroup ? item : null);
        setFormData({
            name: item ? item.name : '',
            description: item ? item.description : '',
            icon: item ? item.icon : ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedModule) {
                await updateModule(selectedModule.id, formData);
                toast.success('Módulo actualizado con éxito');
            } else if (selectedGroup) {
                await updateGroup(selectedGroup.id, formData);
                toast.success('Grupo actualizado con éxito');
            } else {
                await createModule(formData);
                toast.success('Módulo creado con éxito');
            }
            // Refresh data
            const modulesResponse = await getModules();
            const groupsResponse = await getGroups();
            setModules(modulesResponse.data);
            setGroups(groupsResponse.data);
            handleCloseModal();
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
            <Container fluid className='my-3 p-5'>
                <Row >
                    <Col>
                        <nav className aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                    <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">Grupos y módulos</li> {/* Colocar aqui el nombre de los módulos */}
                            </ol>
                        </nav>
                    </Col>
                    {/**<Col md={10} xs={12} className="mt-2 mb-2">
                        <InputGroup>
                            <FormControl
                                placeholder="Buscar por nombre o descripción"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </Col> */}

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
                        <Row>
                            <Col md={10} className='my-3'>
                                <h2 className='custom-h2'>Grupos</h2>  
                            </Col>
                            <Col md={2} style={{alignContent:'center'}}>
                                <Button variant="primary" onClick={() => handleShowModal('createGroup', null, true)} className="ms-2 ">
                                    Crear Grupo
                                </Button>
                            </Col>
                        </Row>
                        <Table responsive hover className='mt-3'>
                            <tbody>
                                {filteredGroups.map((group) => (
                                    <tr key={group.id}>
                                        <td ><i className={`bi bi-${group.icon}`}></i> {group.name}</td>
                                        <td >{group.description}</td>
                                        <td >
                                            <Button variant="link" onClick={() => handleShowModal('edit', group, true)} style={{textDecorationLine:'none'}} >
                                                <i className="bi bi-pencil-fill"  style={{paddingRight:'10px'}}></i>
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
                            <Col md={2} style={{alignContent:'center'}}>
                                <Button variant="primary" onClick={() => handleShowModal('createModule', null, false)}>
                                    Crear Módulo
                                </Button>
                            </Col>
                        </Row>
                        
                        <Table responsive hover className='mt-3'>
                            <tbody>
                                {filteredModules.map((module) => (
                                    <tr key={module.id}>
                                        <td ><i className={`bi bi-${module.icon}`}></i> {module.name}</td>
                                        <td >{module.description}</td>
                                        <td >
                                            <Button variant="link" onClick={() => handleShowModal('edit', module, false)} style={{textDecorationLine:'none'}}>
                                                <i className="bi bi-pencil-fill"  style={{paddingRight:'10px'}}></i>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
                {/**
                <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/menu')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row>                 
                 */}

            </Container>

            <Modal show={showModal} onHide={handleCloseModal} size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedModule ? 'Editar Módulo' : selectedGroup ? 'Editar Grupo' : 'Crear Módulo'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formIcon">
                            <Form.Label>Icono: (Solo introducir nombre del ícono) <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Ver íconos</a></Form.Label>
                            <Form.Control
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <div className='d-flex justify-content-center'>
                            <Button variant="primary" type="submit" className="mt-3">
                                {selectedModule ? 'Guardar' : 'Crear'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            <footer className="fixed-bottom text-white px-5 m-0 footer" style={{minHeight: '2vh' }}>
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
