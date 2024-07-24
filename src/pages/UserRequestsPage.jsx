import React, { useEffect, useState } from 'react';
import { getAccessRequestByUser, getPdfById, uploadPdfForAccessRequest } from '../api/accessrequest.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { getStates } from '../api/state.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Table, Modal, Button, Form, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import '../assets/main.css';

export function UserRequestsPage() {
    const [accessRequests, setAccessRequests] = useState([]);
    const [states, setStates] = useState([]);
    const [userId, setUserId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 11; // Ajusta este valor según lo necesites
    const navigate = useNavigate();

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

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            setUserId(userId);

            const fetchAccessRequests = async () => {
                try {
                    const response = await getAccessRequestByUser(userId);
                    const sortedRequests = response.data.sort((a, b) => a.StateId - b.StateId);
                    const userAccessRequests = sortedRequests.filter(request => request.UserId === decodedToken.id);
                    setAccessRequests(userAccessRequests);
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
        }
    }, []);

    const getStateNameById = (stateId) => {
        const state = states.find(s => s.id === stateId);
        return state ? state.name : 'Desconocido';
    };

    const handleViewDetails = async (requestId) => {
        try {
            const response = await getPdfById(requestId);
            const pdfBlob = response.data;
            const pdfUrl = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            setPdfUrl(pdfUrl);
            setSelectedRequestId(requestId);
            setShowModal(true);
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
            toast.error('Error al obtener el PDF');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPdfUrl(null);
        setPreviewPdfUrl(null);
        setSelectedRequestId(null);
    };

    const handlePdfUpload = async () => {
        if (!pdfFile) {
            toast.error('Debe seleccionar un archivo PDF');
            return;
        }

        try {
            await uploadPdfForAccessRequest(selectedRequestId, pdfFile);
            toast.success('PDF firmado subido correctamente');
            handleCloseModal();
            location.reload();
        } catch (error) {
            console.error('Error al subir el PDF firmado:', error);
            toast.error('Error al subir el PDF firmado');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setPdfFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewPdfUrl(previewUrl);
    };

    const handleDownloadPdf = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'solicitud.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    // Paginación
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = accessRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(accessRequests.length / requestsPerPage);

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='mt-0 p-5 mb-0'>
                <Col className="d-flex align-items-end" style={{ minHeight: '8vh' }}>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="" >
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal
                                </a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Mis solicitudes</li>
                        </ol>
                    </nav>
                </Col>
                <Row>
                    <Col md={10} className='my-3'>
                        <h2 className='custom-h2'>Mis solicitudes</h2>
                    </Col>
                    <Col md={2} className='my-3'>
                        <button className="btn btn-primary" onClick={() => navigate('/create-request')}>
                            Nueva Solicitud
                        </button>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Nro.</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRequests.map((request, index) => (
                                    <tr key={request.id}>
                                        <td>{indexOfFirstRequest + index + 1}</td>
                                        <td>{new Date(request.createdAt).toLocaleDateString('es-ES')}</td>
                                        <td>{getStateNameById(request.StateId)}</td>
                                        <td>
                                            <button className="btn btn-primary" onClick={() => handleViewDetails(request.id)}>
                                                Ver solicitudes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination.First onClick={() => handlePageChange(1)} />
                            <Pagination.Prev onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} />
                            {currentPage > 2 && (
                                <>
                                    <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
                                    {currentPage > 3 && <Pagination.Ellipsis />}
                                </>
                            )}
                            {Array.from({ length: totalPages }, (_, index) => {
                                const page = index + 1;
                                if (page === currentPage || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                    return (
                                        <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                            {page}
                                        </Pagination.Item>
                                    );
                                }
                                return null;
                            })}
                            {currentPage < totalPages - 1 && (
                                <>
                                    {currentPage < totalPages - 2 && <Pagination.Ellipsis />}
                                    <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                                        {totalPages}
                                    </Pagination.Item>
                                </>
                            )}
                            <Pagination.Next onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)} />
                            <Pagination.Last onClick={() => handlePageChange(totalPages)} />
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
                        <>
                            <iframe
                                src={pdfUrl}
                                title="PDF"
                                width="100%"
                                height="500px"
                            ></iframe>
                            <Button variant="secondary" onClick={handleDownloadPdf} className="mt-3">
                                Descargar PDF
                            </Button>
                            <Form.Group controlId="formFile" className="mt-3">
                                <Form.Label>Subir PDF firmado digitalmente</Form.Label>
                                <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
                            </Form.Group>
                            {previewPdfUrl && (
                                <>
                                    <h5 className="mt-3">Vista previa del PDF firmado</h5>
                                    <iframe
                                        src={previewPdfUrl}
                                        title="PDF Preview"
                                        width="100%"
                                        height="500px"
                                    ></iframe>
                                </>
                            )}
                        </>
                    ) : (
                        <p>No se pudo cargar el PDF.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handlePdfUpload}>
                        Subir PDF firmado
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
