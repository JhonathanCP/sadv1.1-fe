import React, { useEffect, useState } from 'react';
import { getGroups, createGroup, updateGroup } from '../api/group.api';
import { getModules, createModule, updateModule } from '../api/module.api';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Button, Table, Modal, Form, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function GroupModuleManagement() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '', GroupId: '' });
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsResponse = await getGroups();
                const modulesResponse = await getModules();

                const groupsData = groupsResponse.data.map(group => ({
                    ...group,
                    modules: modulesResponse.data.filter(module => module.GroupId === group.id)
                }));

                setGroups(groupsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleShowModal = (type, group = null, module = null) => {
        setModalType(type);
        setSelectedGroup(group);
        setSelectedModule(module);
        setFormData({
            name: group ? group.name : module ? module.name : '',
            description: group ? group.description : module ? module.description : '',
            icon: group ? group.icon : module ? module.icon : '',
            GroupId: module ? module.GroupId : ''
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
            if (modalType === 'createGroup') {
                await createGroup(formData);
                toast.success('Grupo creado con éxito');
            } else if (modalType === 'createModule') {
                await createModule(formData);
                toast.success('Módulo creado con éxito');
            } else if (modalType === 'editGroup') {
                await updateGroup(selectedGroup.id, formData);
                toast.success('Grupo actualizado con éxito');
            } else if (modalType === 'editModule') {
                await updateModule(selectedModule.id, formData);
                toast.success('Módulo actualizado con éxito');
            }
            // Refresh data
            const groupsResponse = await getGroups();
            const modulesResponse = await getModules();

            const groupsData = groupsResponse.data.map(group => ({
                ...group,
                modules: modulesResponse.data.filter(module => module.GroupId === group.id)
            }));

            setGroups(groupsData);
            handleCloseModal();
        } catch (error) {
            toast.error('Error al procesar la solicitud');
        }
    };

    const toggleGroupExpansion = (groupId) => {
        setExpandedGroups(prevState => ({
            ...prevState,
            [groupId]: !prevState[groupId]
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredGroups = groups.map(group => ({
        ...group,
        modules: group.modules.filter(module =>
            module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(group => group.modules.length > 0 || searchTerm === '');

    useEffect(() => {
        // Expand all groups if there's a search term
        if (searchTerm) {
            const expandedGroupIds = groups.map(group => group.id);
            setExpandedGroups(expandedGroupIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
        } else {
            setExpandedGroups({});
        }
    }, [searchTerm, groups]);

    return (
        <div className='p-0'>
            <NavBar />
            <Container fluid className='my-3 p-5'>
                <Row className="mb-3">
                    <Col md={9} className='d-none d-md-block'>
                        <h2>Grupos y Módulos</h2>
                    </Col>
                    <Col md={9} className="d-sm-none d-flex justify-content-center">
                        <h2>Grupos y Módulos</h2>
                    </Col>
                    <Col md={3} className="d-flex justify-content-center">
                        <Button variant="success" onClick={() => handleShowModal('createGroup')} className="me-2">
                            Crear Grupo
                        </Button>
                        <Button variant="success" onClick={() => handleShowModal('createModule')}>
                            Crear Módulo
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={12}>
                        <InputGroup>
                            <FormControl
                                placeholder="Buscar por nombre o descripción"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
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
                    <Table responsive hover className='mt-3'>
                        <tbody>
                            {filteredGroups.map((group) => (
                                <React.Fragment key={group.id}>
                                    <tr>
                                        <td colSpan="3">
                                            <Button variant="link" onClick={() => toggleGroupExpansion(group.id)} style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
                                                <i className={`bi ${expandedGroups[group.id] ? 'bi-dash-square' : 'bi-plus-square'}`}></i> <i className={`bi bi-${group.icon}`}></i> Grupo: {group.name}
                                            </Button>
                                        </td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleShowModal('editGroup', group)}>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                    {expandedGroups[group.id] && group.modules.map((module) => (
                                        <tr key={module.id}>
                                            <td></td>
                                            <td><i className={`bi bi-${module.icon}`}></i> {module.name}</td>
                                            <td>{module.description}</td>
                                            <td>
                                                <Button variant="primary" onClick={() => handleShowModal('editModule', null, module)}>
                                                    Editar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                )}
                <Row className='mb-4 justify-content-center'>
                    <Col md={2} className='mb-2'>
                        <Button variant="dark" onClick={() => navigate('/menu')} className="w-100">
                            Volver
                        </Button>
                    </Col>
                </Row>
            </Container>


            <Modal show={showModal} onHide={handleCloseModal} size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === 'createGroup' && 'Crear Grupo'}
                        {modalType === 'createModule' && 'Crear Módulo'}
                        {modalType === 'editGroup' && 'Editar Grupo'}
                        {modalType === 'editModule' && 'Editar Módulo'}
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
                        {modalType === 'createModule' && (
                            <Form.Group controlId="formGroupId">
                                <Form.Label>Grupo</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="GroupId"
                                    value={formData.GroupId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar Grupo</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        )}
                        <div className='d-flex justify-content-center'>
                            <Button variant="primary" type="submit" className="mt-3" >
                                {modalType.includes('create') ? 'Crear' : 'Guardar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
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
        </div>
    );
}
