import React, { useEffect, useState } from 'react';
import { getAccessRequestByUser, getPdfById, uploadPdfForAccessRequest } from '../api/accessrequest.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { getStates } from '../api/state.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Table, Modal, Button, Form } from 'react-bootstrap';
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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            setUserId(userId);

            const fetchAccessRequests = async () => {
                try {
                    const response = await getAccessRequestByUser(userId);
                    const userAccessRequests = response.data.filter(request => request.UserId === decodedToken.id);
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

    return (
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='my-3 p-5'>
                <Col>
                    <nav className aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item">
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Mis solicitudes de acceso</li>
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
                        <Table>
                            <thead>
                                <tr>
                                    <th>Nro.</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessRequests.map((request, index) => (
                                    <tr key={request.id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(request.createdAt).toLocaleDateString('es-ES')}</td>
                                        <td>{getStateNameById(request.StateId)}</td>
                                        <td>
                                            <button className="btn btn-primary" onClick={() => handleViewDetails(request.id)}>
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
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
