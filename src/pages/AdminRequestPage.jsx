import React, { useEffect, useState } from 'react';
import { getAllAccessRequests, approveAccessRequest, denyAccessRequest, getPdfById } from '../api/accessrequest.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { getStates } from '../api/state.api'; // Asegúrate de tener un archivo api para las solicitudes de acceso
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';
import { Container, Row, Col, Table, Button, Modal } from 'react-bootstrap';
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

    useEffect(() => {
        const fetchAccessRequests = async () => {
            try {
                const response = await getAllAccessRequests();
                setAccessRequests(response.data);
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
            //location.reload();
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
            //location.reload();
        } catch (error) {
            console.error('Error al denegar la solicitud:', error);
            toast.error('Error al denegar la solicitud');
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
                            <li className="breadcrumb-item active" aria-current="page">Solicitudes de acceso</li>
                        </ol>
                    </nav>
                </Col>
                <Row>
                    <Col md={10} className='my-3'>
                        <h2 className='custom-h2'>Solicitudes de acceso</h2>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Nro.</th>
                                    <th>Solicitante</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessRequests
                                    .sort((a, b) => a.StateId - b.StateId)
                                    .map((request, index) => (
                                        <tr key={request.id}>
                                            <td>{index + 1}</td>
                                            <td>{request.nombreSolicitante}</td>
                                            <td>{new Date(request.createdAt).toLocaleDateString('es-ES')}</td>
                                            <td>{getStateNameById(request.StateId)}</td>
                                            <td>
                                                <Button variant="primary" onClick={() => handleViewDetails(request.id, request.StateId)}>Ver detalles</Button>
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
                        <iframe
                            src={pdfUrl}
                            title="PDF"
                            width="100%"
                            height="500px"
                        ></iframe>
                    ) : (
                        <p>No se pudo cargar el PDF.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                    {(selectedRequestStateId === 1 || selectedRequestStateId === 2) && (
                        <>
                            <Button variant="success" onClick={() => handleApproveRequest(selectedRequestId)} className="ml-2">Aprobar</Button>
                            <Button variant="danger" onClick={() => handleDenyRequest(selectedRequestId)} className="ml-2">Denegar</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}
