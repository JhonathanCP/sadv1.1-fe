import React, { useEffect, useState } from 'react';
import { createAccessRequest, getAllAccessRequests, deleteAccessRequest, uploadPdfForAccessRequest } from '../api/accessrequest.api';
import { getReports } from '../api/report.api';
import { toast } from 'react-hot-toast';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import {jwtDecode} from 'jwt-decode';

export function AccessRequestForm() {
    const [formData, setFormData] = useState({
        justification: '',
        cargo: '',
        nombreJefe: '',
        cargoJefe: '',
        UserId: '', // El ID del usuario debería establecerse en el backend
        ReportIds: [] // IDs de los reportes
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [accessRequests, setAccessRequests] = useState([]);
    const [reportsCatalog, setReportsCatalog] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchAccessRequests = async () => {
            try {
                const response = await getAllAccessRequests();
                setAccessRequests(response.data);
            } catch (error) {
                console.error('Error al obtener las solicitudes de acceso:', error);
            }
        };

        const fetchReportsCatalog = async () => {
            try {
                const response = await getReports();
                setReportsCatalog(response.data);
            } catch (error) {
                console.error('Error al obtener el catálogo de reportes:', error);
            }
        };

        fetchAccessRequests();
        fetchReportsCatalog();

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);
            setFormData(prevData => ({
                ...prevData,
                UserId: decodedToken.id
            }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCreateAccessRequest = async () => {
        try {
            const response = await createAccessRequest(formData);
            setAccessRequests([...accessRequests, response.data]);
            setFormData({
                justification: '',
                cargo: '',
                nombreJefe: '',
                cargoJefe: '',
                UserId: formData.UserId, // Mantener el UserId
                ReportIds: []
            });
            setShowModal(false);
            toast.success("Solicitud de acceso creada exitosamente");
            return response.data;
        } catch (error) {
            console.error('Error al crear la solicitud de acceso:', error);
            toast.error("Error al crear la solicitud de acceso");
        }
    };

    const handleGeneratePDF = (request) => {
        const doc = new jsPDF();
        doc.text("Justificación: " + request.justification, 10, 10);
        doc.text("Cargo: " + request.cargo, 10, 20);
        doc.text("Nombre del Jefe: " + request.nombreJefe, 10, 30);
        doc.text("Cargo del Jefe: " + request.cargoJefe, 10, 40);
        doc.save("solicitud_acceso.pdf");
    };

    const handleFileChange = (event) => {
        setPdfFile(event.target.files[0]);
    };

    const handleUploadPdf = async (requestId) => {
        try {
            if (pdfFile) {
                await uploadPdfForAccessRequest(requestId, pdfFile);
                toast.success("Archivo PDF subido exitosamente");
            } else {
                toast.error("Seleccione un archivo PDF");
            }
        } catch (error) {
            console.error('Error al subir el archivo PDF:', error);
            toast.error("Error al subir el archivo PDF");
        }
    };

    const handleDeleteAccessRequest = async (requestId) => {
        try {
            await deleteAccessRequest(requestId);
            setAccessRequests(accessRequests.filter(req => req.id !== requestId));
            toast.success("Solicitud de acceso eliminada exitosamente");
        } catch (error) {
            console.error('Error al eliminar la solicitud de acceso:', error);
            toast.error("Error al eliminar la solicitud de acceso");
        }
    };

    const handleSelectReport = (reportId) => {
        setFormData(prevData => ({
            ...prevData,
            ReportIds: prevData.ReportIds.includes(reportId)
                ? prevData.ReportIds.filter(id => id !== reportId)
                : [...prevData.ReportIds, reportId]
        }));
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h3>Solicitudes de Acceso</h3>
                    <Button onClick={() => setShowModal(true)}>Crear Solicitud de Acceso</Button>
                </Col>
            </Row>
            <Row>
                {accessRequests.map(request => (
                    <Col key={request.id} md={4} className="mb-3">
                        <div className="p-3 border">
                            <h5>{request.justification}</h5>
                            <p>{request.cargo}</p>
                            <Button onClick={() => handleGeneratePDF(request)}>Descargar PDF</Button>
                            <Form.Group className="mt-3">
                                <Form.Label>Subir Archivo PDF Firmado</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} />
                                <Button className="mt-2" onClick={() => handleUploadPdf(request.id)}>Subir PDF</Button>
                            </Form.Group>
                            <Button variant="danger" onClick={() => handleDeleteAccessRequest(request.id)}>Eliminar</Button>
                        </div>
                    </Col>
                ))}
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Solicitud de Acceso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Justificación</Form.Label>
                            <Form.Control
                                type="text"
                                name="justification"
                                value={formData.justification}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cargo</Form.Label>
                            <Form.Control
                                type="text"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Nombre del Jefe</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombreJefe"
                                value={formData.nombreJefe}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cargo del Jefe</Form.Label>
                            <Form.Control
                                type="text"
                                name="cargoJefe"
                                value={formData.cargoJefe}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Reportes</Form.Label>
                            {reportsCatalog.length > 0 ? reportsCatalog.map(group => (
                                <div key={group.id}>
                                    <h5>{group.name}</h5>
                                    {group.Modules && group.Modules.map(module => (
                                        <div key={module.id} style={{ marginLeft: '20px' }}>
                                            <h6>{module.name}</h6>
                                            {module.Reports && module.Reports.map(report => (
                                                <Form.Check
                                                    key={report.id}
                                                    type="checkbox"
                                                    label={report.name}
                                                    checked={formData.ReportIds.includes(report.id)}
                                                    onChange={() => handleSelectReport(report.id)}
                                                    style={{ marginLeft: '40px' }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )) : <p>No hay reportes disponibles.</p>}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCreateAccessRequest}>Crear Solicitud</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
