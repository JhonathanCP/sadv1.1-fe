import React, { useEffect, useState } from 'react';
import { getUserReports } from '../api/user.api';
import { postAccessAudit } from '../api/accessaudit.api';
import {jwtDecode} from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AOS from 'aos';
import { NavBar } from '../components/NavBar';
import { Container, Col } from 'react-bootstrap';

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
        <div className='p-0' style={{ height: "100%" }}>
            <NavBar />
            <Container fluid className='p-0 m-0' style={{ minHeight: '100vh' }}>
                <Col xs={12} className="pt-5 px-0 m-0 g-0" style={{ minHeight: '100vh' }}>
                    {report.map((report) => (
                        <iframe key={report.id} src={report.link} style={{ width: '100%', height: '93.542vh', border: 'none' }}></iframe>
                    ))}
                </Col>
            </Container>
            <footer className="fixed-bottom text-white px-5 m-0 d-flex align-items-center" style={{ backgroundColor: "#0064AF", minHeight: '5vh' }}>
                <div className='container-fluid'>
                    <div className='row d-flex d-sm-none justify-content-left'>
                        <div className="col-7">© GCTIC-EsSalud</div>
                        <div className="col-5 text-center">Versión: 1.1.0</div>
                    </div>
                    <div className='row d-none d-md-flex'>
                        <div className="col-11">© Gerencia Central de Tecnologías de Información y Comunicaciones - EsSalud</div>
                        <div className="col-1 text-center">Versión: 1.1.0</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
