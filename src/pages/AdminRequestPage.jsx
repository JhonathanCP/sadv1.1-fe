import React, { useEffect, useState } from 'react';
import { getAllAccessRequests, approveAccessRequest, denyAccessRequest, getPdfById } from '../api/accessrequest.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { getStates } from '../api/state.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Table, Button, Modal, Pagination } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';

export function AdminRequestsPage() {
    const [accessRequests, setAccessRequests] = useState([]);
    const [states, setStates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [selectedRequestStateId, setSelectedRequestStateId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [requestsPerPage] = useState(11);

    useEffect(() => {

        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', {
                    icon: '👏',
                });
                // El token ha expirado, cierra sesión
                handleLogout();
            }
        }


        const fetchAccessRequests = async () => {
            try {
                const response = await getAllAccessRequests();
                const sortedRequests = response.data.sort((a, b) => a.StateId - b.StateId);
                setAccessRequests(sortedRequests);
            } catch (error) {
                console.error('Error al obtener las solicitudes de acceso:', error);
                toast.error('Error al cargar las solicitudes de acceso');
            }
        };

        const fetchStates = async () => {
            try {
                const response = await getStates();
                const states = response.data;
                setStates(states);
            } catch (error) {
                console.error('Error al obtener los estados:', error);
                toast.error('Error al cargar los estados');
            }
        };

        fetchAccessRequests();
        fetchStates();
    }, []);

    const getStateNameById = (stateId) => {
        const state = states.find(s => s.id === stateId);
        return state ? state.name : 'Desconocido';
    };

    const handleViewDetails = async (requestId, stateId) => {
        try {
            const response = await getPdfById(requestId);
            const pdfBlob = response.data;
            const pdfUrl = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            setPdfUrl(pdfUrl);
            setSelectedRequestId(requestId);
            setSelectedRequestStateId(stateId);
            setShowModal(true);
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
            toast.error('Error al obtener el PDF');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPdfUrl(null);
        setSelectedRequestId(null);
        setSelectedRequestStateId(null);
    };

    const handleApproveRequest = async (requestId) => {
        try {
            await approveAccessRequest(requestId);
            toast.success('Solicitud aprobada correctamente');
            setAccessRequests(accessRequests.map(request => request.id === requestId ? { ...request, StateId: states.find(s => s.name === 'APROBADO').id } : request));
            handleCloseModal();
        } catch (error) {
            console.error('Error al aprobar la solicitud:', error);
            toast.error('Error al aprobar la solicitud');
        }
    };

    const handleDenyRequest = async (requestId) => {
        try {
            await denyAccessRequest(requestId);
            toast.success('Solicitud denegada correctamente');
            setAccessRequests(accessRequests.map(request => request.id === requestId ? { ...request, StateId: states.find(s => s.name === 'DENEGADO').id } : request));
            handleCloseModal();
        } catch (error) {
            console.error('Error al denegar la solicitud:', error);
            toast.error('Error al denegar la solicitud');
        }
    };

    // Paginación
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = accessRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(accessRequests.length / requestsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleLogout = () => {
        // Lógica para cerrar sesión, por ejemplo, eliminar el token y redirigir al inicio de sesión
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        // Redirige al inicio de sesión u otra página
        toast.success("Sesión terminada");
        navigate("/login");
    };

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='mt-0 p-5 mb-0'>
                <Col className="d-flex align-items-end" style={{ minHeight: '8vh' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item">
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Solicitudes de acceso</li>
                        </ol>
                    </nav>
                </Col>
                <Row className='my-3'>
                    <Col md={10} >
                        <h2 className='custom-h2'>Solicitudes de acceso</h2>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Table responsive style={{ borderRadius: '6px' }}>
                            <thead>
                                <tr>
                                    <th className='table-header'>Nro.</th>
                                    <th className='table-header'>Solicitante</th>
                                    <th className='table-header'>Fecha</th>
                                    <th className='table-header'>Estado</th>
                                    <th className='table-header'>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequests.map((request, index) => (
                                    <tr key={request.id}>
                                        <td>{indexOfFirstRequest + index + 1}</td>
                                        <td>{request.nombreSolicitante}</td>
                                        <td>{new Date(request.createdAt).toLocaleDateString('es-ES')}</td>
                                        <td>{getStateNameById(request.StateId)}</td>
                                        <td>
                                            <Button variant="link" onClick={() => handleViewDetails(request.id, request.StateId)} className="btn btn-link" style={{ textDecorationLine: 'none' }}>
                                                <i className="bi bi-filetype-pdf" style={{ paddingRight: '10px' }}></i>Ver solicitud</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

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
                    </Col>
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

            <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Solicitud</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="PDF"
                            width="100%"
                            height="650px"
                        ></iframe>
                    ) : (
                        <p>No se pudo cargar el PDF.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {(selectedRequestStateId === 1 || selectedRequestStateId === 2) && (
                        <>
                            <Button variant="outline-danger" onClick={() => handleDenyRequest(selectedRequestId)} className="ml-2" >Denegar</Button>
                            <Button variant="primary" onClick={() => handleApproveRequest(selectedRequestId)} className="ml-2">Aprobar</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}
