import React, { useEffect, useState } from 'react';
import { getUserReports } from '../api/user.api';
import { postAccessAudit } from '../api/accessaudit.api';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Container, Col, Breadcrumb } from 'react-bootstrap';

export function ReportPage() {
    const { id } = useParams();
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            toast.success(successMessage);
            localStorage.removeItem('successMessage');
        }
        AOS.init();
        const expirationTime = localStorage.getItem('expirationTime');
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            if (currentTime > expirationTime) {
                toast('Sesión expirada', { icon: '👏' });
                // El token ha expirado, cierra sesión
                handleLogout();
            }
        }

        const token = localStorage.getItem('access');
        if (token) {
            const decodedToken = jwtDecode(token);

            const fetchInfo = async () => {
                try {
                    const response = await getUserReports(decodedToken.id);
                    const reportData = response.data.reports.filter(report => report.id == id);
                    setReport(reportData);
                    setLoading(false); // Marcar la carga como completada

                    if (reportData.length > 0) {
                        // Enviar los datos de auditoría de acceso
                        await postAccessAudit({
                            userId: decodedToken.id,
                            reportId: id
                        });
                    }
                } catch (error) {
                    console.error('Error al obtener la información:', error);
                }
            };

            fetchInfo();
        }
    }, [id]); // Agrega 'id' como dependencia para que useEffect se ejecute cuando cambie

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('expirationTime');
        toast.success("Sesión terminada");
        navigate("/login");
    };

    // Redireccionar solo si no hay informes y la carga está completa
    useEffect(() => {
        if (!loading && report.length === 0) {
            navigate('/menu');
        }
    }, [loading, report, navigate]);

    return (
        <div className='p-0 m-0 g-0'>
            <NavBar />
            <Container fluid className='mt-5 px-5 pt-4 mb-0 pb-0' style={{ maxHeight: '4.5vh' }}>
                <Col>
                    <nav className aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{}}>
                            <li className="breadcrumb-item" onClick={() => navigate('/menu')}>
                                <a href="#">
                                    <i className="bi bi-house-door" style={{ paddingRight: '5px' }}>
                                    </i>Menú Principal</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Administrativo</li> {/* Colocar aqui el nombre de los módulos */}
                        </ol>
                    </nav>
                </Col>
            </Container>
            <Container fluid>
                <Col xs={12} className="px-0 mx-0 g-0">
                    {report.map((report) => (
                        <iframe key={report.id} src={report.link} style={{ width: '100%', minHeight: '80vh', maxHeight: '90vh', border: 'none' }} className="px-0 mx-0 g-0"></iframe>
                    ))}
                </Col>
            </Container>
            <footer className="fixed-bottom text-white px-0 m-0 footer" style={{ maxHeight: '5vh' }}>
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-6">© GCTIC-EsSalud</div>
                        <div className="col-6 text-center">Versión: 1.1.0.20240527</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-10">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-2 text-end">Versión: 1.1.0.20240527</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
